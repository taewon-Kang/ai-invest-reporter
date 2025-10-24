import { Client } from "@notionhq/client";
import { Report, NotionPage } from "./types.js";

export class NotionClient {
  private client: Client;
  private databaseId: string;

  constructor(apiKey: string, databaseId: string) {
    this.client = new Client({ auth: apiKey });
    this.databaseId = databaseId;
  }

  // 리포트를 Notion 데이터베이스에 저장
  async saveReport(report: Report): Promise<string> {
    try {
      const response = await this.client.pages.create({
        parent: { database_id: this.databaseId },
        properties: {
          Symbol: {
            title: [
              {
                text: {
                  content: report.symbol,
                },
              },
            ],
          },
          Timeframe: {
            rich_text: [
              {
                text: {
                  content: report.timeframe,
                },
              },
            ],
          },
          Content: {
            rich_text: [
              {
                text: {
                  content: report.content,
                },
              },
            ],
          },
          "Created At": {
            created_time: report.createdAt || new Date().toISOString(),
          },
          ...(report.previousReportId && {
            "Previous Report": {
              relation: [
                {
                  id: report.previousReportId,
                },
              ],
            },
          }),
        },
      });

      return response.id;
    } catch (error) {
      console.error("Notion 저장 실패:", error);
      throw new Error(`Notion 저장 실패: ${error}`);
    }
  }

  // 심볼과 기간으로 이전 리포트 검색
  async findPreviousReport(
    symbol: string,
    timeframe: string
  ): Promise<NotionPage | null> {
    try {
      const response = await this.client.databases.query({
        database_id: this.databaseId,
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

      if (response.results.length === 0) {
        return null;
      }

      return response.results[0] as NotionPage;
    } catch (error) {
      console.error("이전 리포트 검색 실패:", error);
      throw new Error(`이전 리포트 검색 실패: ${error}`);
    }
  }

  // 특정 리포트 내용 가져오기
  async getReportContent(pageId: string): Promise<string> {
    try {
      const response = await this.client.pages.retrieve({ page_id: pageId });
      const page = response as any;

      if (page.properties?.Content?.rich_text) {
        return page.properties.Content.rich_text
          .map((text: any) => text.plain_text)
          .join("");
      }

      return "";
    } catch (error) {
      console.error("리포트 내용 조회 실패:", error);
      throw new Error(`리포트 내용 조회 실패: ${error}`);
    }
  }

  // 리포트 업데이트
  async updateReport(pageId: string, content: string): Promise<void> {
    try {
      await this.client.pages.update({
        page_id: pageId,
        properties: {
          Content: {
            rich_text: [
              {
                text: {
                  content: content,
                },
              },
            ],
          },
        },
      });
    } catch (error) {
      console.error("리포트 업데이트 실패:", error);
      throw new Error(`리포트 업데이트 실패: ${error}`);
    }
  }
}

