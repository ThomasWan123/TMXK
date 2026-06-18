import type { InterpretationResult } from "@/lib/validators";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

function getAiConfig() {
  const apiKey = process.env.AI_API_KEY;
  // Supports any OpenAI-compatible API (Zhipu GLM, Alibaba Qwen, etc.)
  const baseUrl = process.env.AI_BASE_URL ?? "https://open.bigmodel.cn/api/paas/v4";
  const model = process.env.AI_MODEL ?? "glm-4-flash";

  if (!apiKey) {
    throw new Error("AI_API_KEY is not configured");
  }

  return { apiKey, baseUrl, model };
}

async function callChatCompletion(messages: ChatMessage[]) {
  const { apiKey, baseUrl, model } = getAiConfig();

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned empty content");
  }

  return content;
}

export async function generateDreamInterpretation(input: {
  title: string;
  content: string;
  mood?: string | null;
  tags?: string[];
  includeStory?: boolean;
}): Promise<{ result: InterpretationResult; model: string }> {
  const { model } = getAiConfig();

  const systemPrompt = `你是一位温柔、富有想象力的梦境解读助手 Dreamweaver。
请根据用户提供的梦境内容，输出 JSON，字段如下：
- symbols: 梦境象征解读（中文，2-4 段）
- emotions: 情绪与潜意识洞察（中文，2-3 段）
- advice: 温和、积极的自我关怀建议（中文，2-3 条要点）
- story: 可选的睡前安抚小故事（中文，150-250 字）

要求：
1. 不做医学或心理诊断，不给出确定性预言。
2. 语气温暖、诗意、令人安心。
3. 只返回合法 JSON，不要 markdown。`;

  const userPrompt = `梦境标题：${input.title}
梦境内容：${input.content}
情绪：${input.mood ?? "未填写"}
标签：${(input.tags ?? []).join("、") || "无"}
是否需要睡前故事：${input.includeStory ? "是" : "否"}`;

  const raw = await callChatCompletion([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  let parsed: InterpretationResult;
  try {
    parsed = JSON.parse(raw) as InterpretationResult;
  } catch {
    throw new Error("AI response is not valid JSON");
  }

  if (!parsed.symbols || !parsed.emotions || !parsed.advice) {
    throw new Error("AI response missing required fields");
  }

  if (!input.includeStory) {
    parsed.story = undefined;
  }

  return { result: parsed, model };
}
