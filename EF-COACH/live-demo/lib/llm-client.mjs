const DEFAULT_RESPONSES_MODEL = "gpt-5.5";
const DEFAULT_COMPATIBLE_MODEL = "Qwen3.5-0.8B-Q4_K_M";
const ZAI_CODING_PLAN_BASE_URL = "https://api.z.ai/api/coding/paas/v4";
const ZAI_GLM_51_MODEL = "glm-5.1";
const DEFAULT_LLM_TIMEOUT_MS = 25_000;
const GLM_THINKING_MAX_TOKENS = 1200;

function trimSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function isVpsLocalBaseUrl(baseUrl) {
  return /host\.docker\.internal|localhost|127\.0\.0\.1|llama-local/i.test(baseUrl);
}

function resolveTimeoutMs(env = process.env) {
  const value = Number.parseInt(env.LLM_TIMEOUT_MS || "", 10);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_LLM_TIMEOUT_MS;
}

export function resolveLlmConfig(env = process.env) {
  const configuredProvider = env.LLM_PROVIDER?.trim();
  const baseUrl = trimSlash(env.OPENAI_BASE_URL || env.LLM_BASE_URL);
  const provider = configuredProvider || (baseUrl ? "openai-compatible" : "openai-responses");

  if (provider === "zai-coding-plan") {
    const apiKey = env.ZAI_API_KEY || env.OPENAI_API_KEY || env.LLM_API_KEY;
    const model = env.OPENAI_MODEL || env.LLM_MODEL || ZAI_GLM_51_MODEL;
    if (!apiKey) {
      throw new Error("ZAI_API_KEY is required for Z.AI GLM Coding Plan mode.");
    }
    return {
      provider,
      providerLabel: "Z.AI GLM-5.1 (medium reasoning)",
      model,
      apiKey,
      chatCompletionsUrl: `${ZAI_CODING_PLAN_BASE_URL}/chat/completions`,
      chatMaxTokens: GLM_THINKING_MAX_TOKENS,
      chatExtraBody: {
        thinking: { type: "enabled" },
      },
    };
  }

  if (provider === "openai-compatible") {
    const apiKey = env.OPENAI_API_KEY || env.LLM_API_KEY || "local";
    const model = env.OPENAI_MODEL || env.LLM_MODEL || DEFAULT_COMPATIBLE_MODEL;
    if (!baseUrl) {
      throw new Error("OPENAI_BASE_URL or LLM_BASE_URL is required for openai-compatible mode.");
    }
    return {
      provider,
      providerLabel: isVpsLocalBaseUrl(baseUrl) ? "VPS local LLM" : "OpenAI-compatible LLM",
      model,
      apiKey,
      chatCompletionsUrl: `${baseUrl}/chat/completions`,
    };
  }

  const apiKey = env.OPENAI_API_KEY || env.LLM_API_KEY;
  const model = env.OPENAI_MODEL || env.LLM_MODEL || DEFAULT_RESPONSES_MODEL;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY or LLM_API_KEY is required for OpenAI Responses mode.");
  }
  return {
    provider: "openai-responses",
    providerLabel: "OpenAI Responses API",
    model,
    apiKey,
    responsesUrl: "https://api.openai.com/v1/responses",
  };
}

export function publicProviderConfig(config) {
  return {
    provider: config.provider,
    providerLabel: config.providerLabel,
    model: config.model,
  };
}

export function buildChatCompletionsRequest({ instructions, messages, model, maxTokens = 360, extraBody = {} }) {
  return {
    model,
    temperature: 0.2,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: instructions },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ],
    ...extraBody,
  };
}

export function buildResponsesRequest({ instructions, messages, model }) {
  return {
    model,
    instructions,
    input: messages,
    max_output_tokens: 360,
  };
}

export function extractAssistantText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const chatText = payload?.choices?.[0]?.message?.content;
  if (typeof chatText === "string" && chatText.trim()) {
    return chatText.trim();
  }

  const responseText = payload?.output
    ?.flatMap((item) => item.content || [])
    ?.map((content) => content.text || "")
    ?.join("\n")
    ?.trim();
  if (responseText) {
    return responseText;
  }

  throw new Error("LLM response did not contain assistant text.");
}

export async function callCoachModel({ instructions, messages, env = process.env, fetchImpl = fetch }) {
  const config = resolveLlmConfig(env);
  const headers = {
    authorization: `Bearer ${config.apiKey}`,
    "content-type": "application/json",
  };

  const request =
    config.provider === "openai-compatible"
      ? {
          url: config.chatCompletionsUrl,
          body: buildChatCompletionsRequest({
            instructions,
            messages,
            model: config.model,
            maxTokens: config.chatMaxTokens,
            extraBody: config.chatExtraBody,
          }),
        }
      : config.provider === "zai-coding-plan"
        ? {
            url: config.chatCompletionsUrl,
            body: buildChatCompletionsRequest({
              instructions,
              messages,
              model: config.model,
              maxTokens: config.chatMaxTokens,
              extraBody: config.chatExtraBody,
            }),
        }
      : {
          url: config.responsesUrl,
          body: buildResponsesRequest({ instructions, messages, model: config.model }),
        };

  const response = await fetchImpl(request.url, {
    method: "POST",
    headers,
    signal: AbortSignal.timeout(resolveTimeoutMs(env)),
    body: JSON.stringify(request.body),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`LLM request failed with HTTP ${response.status}: ${detail.slice(0, 240)}`);
  }

  const payload = await response.json();
  return {
    text: extractAssistantText(payload),
    provider: config.provider,
    providerLabel: config.providerLabel,
    model: config.model,
  };
}
