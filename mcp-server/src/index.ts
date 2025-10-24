import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { NotionClient } from "./notion-client.js";
import { ReportComparator } from "./report-comparator.js";
import { Report } from "./types.js";
import dotenv from "dotenv";

// 환경 변수 로드
dotenv.config();

// 환경 변수 검증
const requiredEnvVars = [
  "NOTION_API_KEY",
  "NOTION_DATABASE_ID",
  "OPENAI_API_KEY",
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`필수 환경 변수가 누락되었습니다: ${envVar}`);
    process.exit(1);
  }
}

// Notion 클라이언트와 리포트 비교기 초기화
const notionClient = new NotionClient(
  process.env.NOTION_API_KEY!,
  process.env.NOTION_DATABASE_ID!
);
const reportComparator = new ReportComparator(process.env.OPENAI_API_KEY!);

// MCP 서버 생성
const server = new Server(
  {
    name: "notion-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 도구 목록 제공
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "save_report",
        description: "AI 투자 리포트를 Notion 데이터베이스에 저장합니다.",
        inputSchema: {
          type: "object",
          properties: {
            symbol: {
              type: "string",
              description: "투자 심볼 (예: BTCUSDT, ETHUSDT)",
            },
            timeframe: {
              type: "string",
              description: "분석 기간 (예: 1h, 1d, 1w)",
            },
            content: {
              type: "string",
              description: "LLM이 생성한 리포트 내용",
            },
          },
          required: ["symbol", "timeframe", "content"],
        },
      },
      {
        name: "compare_and_save_report",
        description:
          "이전 리포트와 비교하여 변경사항을 분석하고 Notion에 저장합니다.",
        inputSchema: {
          type: "object",
          properties: {
            symbol: {
              type: "string",
              description: "투자 심볼 (예: BTCUSDT, ETHUSDT)",
            },
            timeframe: {
              type: "string",
              description: "분석 기간 (예: 1h, 1d, 1w)",
            },
            content: {
              type: "string",
              description: "LLM이 생성한 새로운 리포트 내용",
            },
          },
          required: ["symbol", "timeframe", "content"],
        },
      },
      {
        name: "get_previous_report",
        description: "특정 심볼과 기간의 이전 리포트를 조회합니다.",
        inputSchema: {
          type: "object",
          properties: {
            symbol: {
              type: "string",
              description: "투자 심볼",
            },
            timeframe: {
              type: "string",
              description: "분석 기간",
            },
          },
          required: ["symbol", "timeframe"],
        },
      },
    ],
  };
});

// 도구 실행 핸들러
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "save_report": {
        const { symbol, timeframe, content } = args as {
          symbol: string;
          timeframe: string;
          content: string;
        };

        const report: Report = {
          symbol,
          timeframe,
          content,
          createdAt: new Date().toISOString(),
        };

        const pageId = await notionClient.saveReport(report);

        return {
          content: [
            {
              type: "text",
              text: `리포트가 성공적으로 Notion에 저장되었습니다. 페이지 ID: ${pageId}`,
            },
          ],
        };
      }

      case "compare_and_save_report": {
        const { symbol, timeframe, content } = args as {
          symbol: string;
          timeframe: string;
          content: string;
        };

        // 이전 리포트 검색
        const previousReport = await notionClient.findPreviousReport(
          symbol,
          timeframe
        );

        if (!previousReport) {
          // 이전 리포트가 없으면 새로 저장
          const report: Report = {
            symbol,
            timeframe,
            content,
            createdAt: new Date().toISOString(),
          };

          const pageId = await notionClient.saveReport(report);

          return {
            content: [
              {
                type: "text",
                text: `이전 리포트가 없어 새로운 리포트를 저장했습니다. 페이지 ID: ${pageId}`,
              },
            ],
          };
        }

        // 이전 리포트 내용 가져오기
        const previousContent = await notionClient.getReportContent(
          previousReport.id
        );

        // 리포트 비교
        const comparisonResult = await reportComparator.compareReports(
          content,
          previousContent
        );

        if (!comparisonResult.hasChanges) {
          return {
            content: [
              {
                type: "text",
                text: "이전 리포트와 변경사항이 없습니다. 새로운 리포트를 저장하지 않았습니다.",
              },
            ],
          };
        }

        // 변경사항이 있는 경우 업데이트된 리포트 생성
        const updatedContent = reportComparator.generateUpdatedReport(
          content,
          comparisonResult.changes
        );

        // 새로운 리포트 저장 (이전 리포트와의 관계 설정)
        const report: Report = {
          symbol,
          timeframe,
          content: updatedContent,
          createdAt: new Date().toISOString(),
          previousReportId: previousReport.id,
        };

        const pageId = await notionClient.saveReport(report);

        return {
          content: [
            {
              type: "text",
              text: `리포트가 비교 분석되어 저장되었습니다!\n\n변경사항 요약:\n${comparisonResult.summary}\n\n페이지 ID: ${pageId}`,
            },
          ],
        };
      }

      case "get_previous_report": {
        const { symbol, timeframe } = args as {
          symbol: string;
          timeframe: string;
        };

        const previousReport = await notionClient.findPreviousReport(
          symbol,
          timeframe
        );

        if (!previousReport) {
          return {
            content: [
              {
                type: "text",
                text: "해당 심볼과 기간의 이전 리포트를 찾을 수 없습니다.",
              },
            ],
          };
        }

        const content = await notionClient.getReportContent(previousReport.id);

        return {
          content: [
            {
              type: "text",
              text: `이전 리포트를 찾았습니다:\n\n${content}`,
            },
          ],
        };
      }

      default:
        throw new Error(`알 수 없는 도구: ${name}`);
    }
  } catch (error) {
    console.error(`도구 실행 오류 (${name}):`, error);
    return {
      content: [
        {
          type: "text",
          text: `오류가 발생했습니다: ${error}`,
        },
      ],
      isError: true,
    };
  }
});

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Notion MCP 서버가 시작되었습니다.");
}

main().catch((error) => {
  console.error("서버 시작 실패:", error);
  process.exit(1);
});

