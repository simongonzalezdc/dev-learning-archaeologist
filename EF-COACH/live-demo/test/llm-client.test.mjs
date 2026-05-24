import assert from "node:assert/strict";
import test from "node:test";

import {
  buildChatCompletionsRequest,
  buildResponsesRequest,
  callCoachModel,
  extractAssistantText,
  publicProviderConfig,
  resolveLlmConfig,
} from "../lib/llm-client.mjs";

test("resolveLlmConfig supports OpenAI-compatible VPS-local endpoints", () => {
  const config = resolveLlmConfig({
    OPENAI_BASE_URL: "http://host.docker.internal:8085/v1",
    OPENAI_API_KEY: "local-secret",
    OPENAI_MODEL: "qwen-test",
  });

  assert.equal(config.provider, "openai-compatible");
  assert.equal(config.model, "qwen-test");
  assert.equal(config.chatCompletionsUrl, "http://host.docker.internal:8085/v1/chat/completions");
});

test("resolveLlmConfig supports GLM-5.1 with medium reasoning", () => {
  const config = resolveLlmConfig({
    LLM_PROVIDER: "zai-coding-plan",
    ZAI_API_KEY: "zai-secret",
  });

  assert.equal(config.provider, "zai-coding-plan");
  assert.equal(config.providerLabel, "Z.AI GLM-5.1 (medium reasoning)");
  assert.equal(config.model, "glm-5.1");
  assert.equal(config.chatCompletionsUrl, "https://api.z.ai/api/coding/paas/v4/chat/completions");
  assert.equal(config.chatMaxTokens, 1200);
  assert.deepEqual(config.chatExtraBody, {
    thinking: { type: "enabled" },
  });
});

test("publicProviderConfig never exposes API keys or raw base URLs", () => {
  const publicConfig = publicProviderConfig(
    resolveLlmConfig({
      OPENAI_BASE_URL: "http://host.docker.internal:8085/v1",
      OPENAI_API_KEY: "super-secret",
      OPENAI_MODEL: "qwen-test",
    }),
  );

  assert.deepEqual(publicConfig, {
    provider: "openai-compatible",
    providerLabel: "VPS local LLM",
    model: "qwen-test",
  });
  assert.doesNotMatch(JSON.stringify(publicConfig), /secret|host\.docker|8085/i);
});

test("request builders put the coach contract in server-side instructions", () => {
  const messages = [{ role: "user", content: "I am frozen." }];
  const instructions = "You are Unstuck Coach.";

  const chat = buildChatCompletionsRequest({ instructions, messages, model: "demo-model" });
  assert.equal(chat.model, "demo-model");
  assert.equal(chat.max_tokens, 360);
  assert.equal(chat.messages[0].role, "system");
  assert.equal(chat.messages[0].content, instructions);
  assert.equal(chat.messages[1].content, "I am frozen.");

  const glm = buildChatCompletionsRequest({
    instructions,
    messages,
    model: "glm-5.1",
    maxTokens: 1200,
    extraBody: { thinking: { type: "enabled" } },
  });
  assert.equal(glm.max_tokens, 1200);
  assert.deepEqual(glm.thinking, { type: "enabled" });

  const responses = buildResponsesRequest({ instructions, messages, model: "gpt-test" });
  assert.equal(responses.model, "gpt-test");
  assert.equal(responses.instructions, instructions);
  assert.deepEqual(responses.input, messages);
});

test("extractAssistantText handles Responses and Chat Completions payloads", () => {
  assert.equal(extractAssistantText({ output_text: "One move." }), "One move.");
  assert.equal(
    extractAssistantText({ choices: [{ message: { content: "Calendar first." } }] }),
    "Calendar first.",
  );
});

test("callCoachModel sends a timeout signal to provider fetches", async () => {
  let seenOptions;
  const result = await callCoachModel({
    instructions: "You are Unstuck Coach.",
    messages: [{ role: "user", content: "I am frozen." }],
    env: {
      OPENAI_BASE_URL: "http://localhost:9999/v1",
      OPENAI_API_KEY: "test-secret",
      OPENAI_MODEL: "test-model",
      LLM_TIMEOUT_MS: "12000",
    },
    fetchImpl: async (_url, options) => {
      seenOptions = options;
      return new Response(JSON.stringify({ choices: [{ message: { content: "One tiny move." } }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  });

  assert.equal(result.text, "One tiny move.");
  assert.ok(seenOptions.signal instanceof AbortSignal);
});
