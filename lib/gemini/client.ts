import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Override with GEMINI_MODEL. Valid v1beta IDs: gemini-2.5-flash, gemini-2.5-flash-lite, gemini-2.5-pro, gemini-2.0-flash.
const modelId = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export const geminiModel = genAI.getGenerativeModel({
  model: modelId,
});

/** Extract retry-after seconds from a Gemini 429 error message, or null. */
export function getRetryAfterSeconds(error: unknown): number | null {
  const msg = error instanceof Error ? error.message : String(error);
  const match = msg.match(/retry in ([\d.]+)s/i) ?? msg.match(/retryDelay":\s*"(\d+)s/);
  if (match) {
    const sec = parseFloat(match[1]);
    return Number.isFinite(sec) ? Math.ceil(sec) : null;
  }
  return null;
}

/** True if the error is a Gemini API rate limit (429). */
export function isRateLimitError(error: unknown): boolean {
  if (error && typeof error === "object" && "status" in error) {
    return (error as { status?: number }).status === 429;
  }
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("429") || msg.includes("Too Many Requests") || msg.includes("quota");
}

const MAX_RETRIES = 1;
const DEFAULT_RETRY_WAIT_MS = 20_000;

export async function generateText(prompt: string): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await geminiModel.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      lastError = err;
      const is429 = isRateLimitError(err);
      const retrySec = getRetryAfterSeconds(err);
      const canRetry = attempt < MAX_RETRIES && is429 && retrySec != null && retrySec > 0;
      if (canRetry) {
        await new Promise((r) => setTimeout(r, Math.min(retrySec * 1000, DEFAULT_RETRY_WAIT_MS)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export function parseGeminiJSON<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}
