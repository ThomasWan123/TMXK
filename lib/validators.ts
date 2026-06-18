import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(8, "密码至少 8 位"),
  name: z.string().min(1, "昵称不能为空").max(50, "昵称过长").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(1, "请输入密码"),
});

export const dreamSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(120, "标题过长"),
  content: z.string().min(10, "梦境描述至少 10 个字").max(5000, "梦境描述过长"),
  mood: z.string().max(50).optional().nullable(),
  tags: z.array(z.string().max(30)).max(10).optional().default([]),
  sleepDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式无效"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DreamInput = z.infer<typeof dreamSchema>;

export interface InterpretationResult {
  symbols: string;
  emotions: string;
  advice: string;
  story?: string;
}
