import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { DEFAULT_AI, joinApiUrl, loadAiSettings, saveAiSettings, usesClaude } from "./ai";

const mem = new Map<string, string>();

beforeAll(() => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => mem.get(key) ?? null,
      setItem: (key: string, value: string) => { mem.set(key, value); },
      removeItem: (key: string) => { mem.delete(key); },
    },
  });
});

describe("joinApiUrl", () => {
  it("appends chat completions to an OpenAI-style base", () => {
    expect(joinApiUrl("https://openrouter.ai/api/v1", "/chat/completions")).toBe(
      "https://openrouter.ai/api/v1/chat/completions",
    );
  });

  it("keeps a full endpoint the user pasted", () => {
    expect(joinApiUrl("https://proxy.example/v1/chat/completions/", "/chat/completions")).toBe(
      "https://proxy.example/v1/chat/completions",
    );
  });

  it("does not double /v1 on Claude bases", () => {
    expect(joinApiUrl("https://api.anthropic.com", "/v1/messages")).toBe("https://api.anthropic.com/v1/messages");
    expect(joinApiUrl("https://api.anthropic.com/v1", "/v1/messages")).toBe("https://api.anthropic.com/v1/messages");
  });
});

describe("usesClaude", () => {
  it("uses Claude messages for Claude and custom Claude-style endpoints", () => {
    expect(usesClaude({ provider: "claude", apiStyle: "openai" })).toBe(true);
    expect(usesClaude({ provider: "custom", apiStyle: "claude" })).toBe(true);
    expect(usesClaude({ provider: "custom", apiStyle: "openai" })).toBe(false);
    expect(usesClaude({ provider: "openai", apiStyle: "claude" })).toBe(false);
  });
});

describe("ai settings", () => {
  afterEach(() => {
    mem.clear();
  });

  it("remembers a custom provider", () => {
    saveAiSettings({
      ...DEFAULT_AI,
      provider: "custom",
      baseUrl: "http://localhost:11434/v1",
      model: "qwen3",
      apiStyle: "openai",
    });
    const loaded = loadAiSettings();
    expect(loaded.provider).toBe("custom");
    expect(loaded.baseUrl).toBe("http://localhost:11434/v1");
    expect(loaded.model).toBe("qwen3");
    expect(loaded.apiStyle).toBe("openai");
  });
});
