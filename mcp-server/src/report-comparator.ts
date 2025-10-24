import { ComparisonResult } from "./types.js";

export class ReportComparator {
  private openaiApiKey: string;

  constructor(openaiApiKey: string) {
    this.openaiApiKey = openaiApiKey;
  }

  // LLM을 사용하여 두 리포트를 비교
  async compareReports(
    currentReport: string,
    previousReport: string
  ): Promise<ComparisonResult> {
    const prompt = `
다음은 같은 심볼과 기간에 대한 두 개의 투자 리포트입니다.

이전 리포트:
${previousReport}

현재 리포트:
${currentReport}

다음 형식으로 JSON 응답을 제공해주세요:
{
  "hasChanges": boolean,
  "changes": [
    {
      "type": "added" | "modified" | "removed",
      "section": "섹션명 (예: 요약, 시나리오, 리스크)",
      "oldContent": "이전 내용 (수정/삭제된 경우만)",
      "newContent": "새로운 내용"
    }
  ],
  "summary": "변경사항에 대한 요약"
}

변경사항이 없다면 hasChanges: false, changes: []로 응답하세요.
`;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "당신은 투자 리포트 분석 전문가입니다. 두 리포트를 정확히 비교하고 변경사항을 JSON 형식으로 제공합니다.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.3,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API 오류: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("OpenAI 응답이 비어있습니다.");
      }

      // JSON 파싱
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("JSON 형식의 응답을 찾을 수 없습니다.");
      }

      const comparisonResult = JSON.parse(jsonMatch[0]);

      return {
        hasChanges: comparisonResult.hasChanges || false,
        changes: comparisonResult.changes || [],
        summary: comparisonResult.summary || "변경사항 없음",
      };
    } catch (error) {
      console.error("리포트 비교 실패:", error);
      throw new Error(`리포트 비교 실패: ${error}`);
    }
  }

  // 변경사항을 기반으로 업데이트된 리포트 생성
  generateUpdatedReport(originalReport: string, changes: any[]): string {
    if (changes.length === 0) {
      return originalReport;
    }

    let updatedReport = originalReport;

    // 변경사항을 적용하여 업데이트된 리포트 생성
    changes.forEach((change) => {
      if (change.type === "added") {
        // 새로운 섹션 추가
        updatedReport += `\n\n## ${change.section}\n${change.newContent}`;
      } else if (change.type === "modified") {
        // 기존 섹션 수정
        const sectionRegex = new RegExp(
          `## ${change.section}[\\s\\S]*?(?=##|$)`,
          "g"
        );
        updatedReport = updatedReport.replace(
          sectionRegex,
          `## ${change.section}\n${change.newContent}`
        );
      }
      // removed 타입은 현재 구현에서 제외 (복잡성 때문)
    });

    return updatedReport;
  }
}

