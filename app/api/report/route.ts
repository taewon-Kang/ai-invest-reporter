import { NextResponse } from "next/server";

type ReportRequest = {
  symbol: string;
  timeframe: string;
  notes?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ReportRequest;
  if (!body?.symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is missing" },
      { status: 500 }
    );
  }

  const prompt = `심볼: ${body.symbol}\n기간: ${body.timeframe}\n요청사항: ${
    body.notes ?? ""
  }\n요약/시나리오/리스크 3섹션으로 한국어 투자 리포트를 간결하게 작성하라.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "너는 금융 데이터 리서처다." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content ?? "";

    // Notion에 자동 저장 (선택사항)
    const autoSaveToNotion = process.env.AUTO_SAVE_TO_NOTION === "true";
    console.log("autoSaveToNotion", autoSaveToNotion);

    if (autoSaveToNotion) {
      try {
        const notionResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/api/notion-save`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              symbol: body.symbol,
              timeframe: body.timeframe,
              content: content,
              compareWithPrevious: true,
            }),
          }
        );

        if (notionResponse.ok) {
          const notionResult = await notionResponse.json();
          console.log("Notion 저장 성공:", notionResult.message);
        }
      } catch (notionError) {
        console.error("Notion 저장 실패:", notionError);
        // Notion 저장 실패해도 리포트 생성은 계속 진행
      }
    }

    return NextResponse.json({ content });
  } catch (e) {
    return NextResponse.json(
      { error: "failed to generate report" },
      { status: 500 }
    );
  }
}
