import { z } from "zod";

// 리포트 데이터 스키마
export const ReportSchema = z.object({
  symbol: z.string(),
  timeframe: z.string(),
  content: z.string(),
  createdAt: z.string().optional(),
  previousReportId: z.string().optional(),
});

export type Report = z.infer<typeof ReportSchema>;

// Notion 데이터베이스 페이지 스키마
export const NotionPageSchema = z.object({
  id: z.string(),
  properties: z.object({
    Symbol: z.object({
      title: z.array(
        z.object({
          plain_text: z.string(),
        })
      ),
    }),
    Timeframe: z.object({
      rich_text: z.array(
        z.object({
          plain_text: z.string(),
        })
      ),
    }),
    Content: z.object({
      rich_text: z.array(
        z.object({
          plain_text: z.string(),
        })
      ),
    }),
    "Created At": z.object({
      created_time: z.string(),
    }),
    "Previous Report": z
      .object({
        relation: z.array(
          z.object({
            id: z.string(),
          })
        ),
      })
      .optional(),
  }),
});

export type NotionPage = z.infer<typeof NotionPageSchema>;

// 리포트 비교 결과 스키마
export const ComparisonResultSchema = z.object({
  hasChanges: z.boolean(),
  changes: z.array(
    z.object({
      type: z.enum(["added", "modified", "removed"]),
      section: z.string(),
      oldContent: z.string().optional(),
      newContent: z.string(),
    })
  ),
  summary: z.string(),
});

export type ComparisonResult = z.infer<typeof ComparisonResultSchema>;

