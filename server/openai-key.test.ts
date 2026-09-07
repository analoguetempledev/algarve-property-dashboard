import { describe, expect, it } from "vitest";
import { runLiveApiTests } from "./testEnv";

describe.skipIf(!runLiveApiTests)("OpenAI API key validation", () => {
  it("should authenticate successfully with the provided API key", async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    expect(apiKey).toBeTruthy();

    // Make a lightweight models list call to validate the key
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);

    // Verify gpt-4o is available
    const modelIds = data.data.map((m: { id: string }) => m.id);
    const hasGpt4o = modelIds.some((id: string) => id.includes("gpt-4o"));
    expect(hasGpt4o).toBe(true);
  });
});
