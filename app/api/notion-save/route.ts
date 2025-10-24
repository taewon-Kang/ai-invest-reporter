import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

type NotionSaveRequest = {
  symbol: string;
  timeframe: string;
  content: string;
  compareWithPrevious?: boolean;
};

// Notion 클라이언트 초기화
function getNotionClient() {
  const notionApiKey = process.env.NOTION_API_KEY;
  const notionDatabaseId = process.env.NOTION_DATABASE_ID;

  if (!notionApiKey || !notionDatabaseId) {
    throw new Error("Notion API credentials are missing");
  }

  return {
    client: new Client({ auth: notionApiKey }),
    databaseId: notionDatabaseId,
  };
}

// 이전 리포트 검색
async function findPreviousReport(
  client: Client,
  databaseId: string,
  symbol: string,
  timeframe: string
) {
  try {
    const response = await client.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: "Symbol",
            title: {
              equals: symbol,
            },
          },
          {
            property: "Timeframe",
            rich_text: {
              equals: timeframe,
            },
          },
        ],
      },
      sorts: [
        {
          property: "Created At",
          direction: "descending",
        },
      ],
      page_size: 1,
    });

    return response.results.length > 0 ? response.results[0] : null;
  } catch (error) {
    console.error("이전 리포트 검색 실패:", error);
    return null;
  }
}

// 리포트 내용 가져오기
async function getReportContent(
  client: Client,
  pageId: string
): Promise<string> {
  try {
    const response = await client.pages.retrieve({ page_id: pageId });
    const page = response as any;

    if (page.properties?.Content?.rich_text) {
      return page.properties.Content.rich_text
        .map((text: any) => text.plain_text)
        .join("");
    }

    return "";
  } catch (error) {
    console.error("리포트 내용 조회 실패:", error);
    return "";
  }
}

// 리포트 비교 (간단한 버전)
async function compareReports(
  currentReport: string,
  previousReport: string
): Promise<{ hasChanges: boolean; summary: string }> {
  // 간단한 비교: 내용이 완전히 같은지 확인
  if (currentReport.trim() === previousReport.trim()) {
    return { hasChanges: false, summary: "변경사항 없음" };
  }

  // OpenAI를 사용한 비교 (선택사항)
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return { hasChanges: true, summary: "내용이 다름 (자세한 비교 불가)" };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "두 투자 리포트를 비교하여 변경사항을 간단히 요약해주세요.",
          },
          {
            role: "user",
            content: `이전 리포트:\n${previousReport}\n\n현재 리포트:\n${currentReport}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content || "내용이 변경됨";
      return { hasChanges: true, summary };
    }
  } catch (error) {
    console.error("OpenAI 비교 실패:", error);
  }

  return { hasChanges: true, summary: "내용이 변경됨" };
}

export async function POST(request: Request) {
  const body = (await request.json()) as NotionSaveRequest;

  if (!body?.symbol || !body?.timeframe || !body?.content) {
    return NextResponse.json(
      { error: "symbol, timeframe, content are required" },
      { status: 400 }
    );
  }

  try {
    const { client, databaseId } = getNotionClient();

    if (body.compareWithPrevious) {
      // 이전 리포트 검색
      const previousReport = await findPreviousReport(
        client,
        databaseId,
        body.symbol,
        body.timeframe
      );

      if (previousReport) {
        // 이전 리포트 내용 가져오기
        const previousContent = await getReportContent(
          client,
          previousReport.id
        );

        // 리포트 비교
        const comparison = await compareReports(body.content, previousContent);

        if (!comparison.hasChanges) {
          return NextResponse.json({
            success: true,
            message: "이전 리포트와 변경사항이 없습니다.",
            pageId: previousReport.id,
          });
        }

        // 변경사항이 있는 경우 새로운 리포트 저장
        const response = await client.pages.create({
          parent: { database_id: databaseId },
          properties: {
            Symbol: {
              title: [
                {
                  text: {
                    content: body.symbol,
                  },
                },
              ],
            },
            Timeframe: {
              rich_text: [
                {
                  text: {
                    content: body.timeframe,
                  },
                },
              ],
            },
            Content: {
              rich_text: [
                {
                  text: {
                    content: body.content,
                  },
                },
              ],
            },
            // "Created At": {
            //   created_time: new Date().toISOString(),
            // },
            "Previous Report": {
              relation: [
                {
                  id: previousReport.id,
                },
              ],
            },
          },
        });

        return NextResponse.json({
          success: true,
          message: `리포트가 비교 분석되어 저장되었습니다.\n\n변경사항 요약:\n${comparison.summary}`,
          pageId: response.id,
        });
      }
    }

    // 새로운 리포트 저장
    const response = await client.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Symbol: {
          title: [
            {
              text: {
                content: body.symbol,
              },
            },
          ],
        },
        Timeframe: {
          rich_text: [
            {
              text: {
                content: body.timeframe,
              },
            },
          ],
        },
        Content: {
          rich_text: [
            {
              text: {
                content: body.content,
              },
            },
          ],
        },
        // "Created At": {
        //   created_time: new Date().toISOString(),
        // },
      },
    });

    return NextResponse.json({
      success: true,
      message: "리포트가 성공적으로 Notion에 저장되었습니다.",
      pageId: response.id,
    });
  } catch (error) {
    console.error("Notion 저장 실패:", error);
    return NextResponse.json(
      { error: `Notion 저장 실패: ${error}` },
      { status: 500 }
    );
  }
}
