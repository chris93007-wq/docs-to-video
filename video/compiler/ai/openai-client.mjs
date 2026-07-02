import {setTimeout as sleep} from "node:timers/promises";

const extractOutputText = (responseBody) => {
  if (typeof responseBody.output_text === "string") {
    return responseBody.output_text;
  }

  const chunks = [];
  for (const output of responseBody.output ?? []) {
    for (const content of output.content ?? []) {
      if (typeof content.text === "string") {
        chunks.push(content.text);
      }
      if (typeof content.output_text === "string") {
        chunks.push(content.output_text);
      }
    }
  }

  return chunks.join("\n").trim();
};

const parseJsonResponse = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
    if (fenced) {
      return JSON.parse(fenced);
    }
    throw error;
  }
};

const strictJsonSchema = (schema) => {
  if (!schema || typeof schema !== "object") {
    return schema;
  }

  if (Array.isArray(schema)) {
    return schema.map(strictJsonSchema);
  }

  const next = {...schema};
  if (next.type === "object" && next.properties) {
    next.additionalProperties = false;
    next.required = Object.keys(next.properties);
  }
  if (next.properties) {
    next.properties = Object.fromEntries(
      Object.entries(next.properties).map(([key, value]) => [key, strictJsonSchema(value)]),
    );
  }
  if (next.items) {
    next.items = strictJsonSchema(next.items);
  }

  return next;
};

export class OpenAICompilerClient {
  constructor({
    apiKey = process.env.OPENAI_API_KEY,
    model = process.env.OPENAI_MODEL || "gpt-5",
    temperature = Number(process.env.OPENAI_TEMPERATURE ?? 0.2),
    maxRetries = Number(process.env.OPENAI_MAX_RETRIES ?? 2),
    minIntervalMs = Number(process.env.OPENAI_MIN_INTERVAL_MS ?? 250),
    baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  } = {}) {
    this.apiKey = apiKey;
    this.model = model;
    this.temperature = temperature;
    this.maxRetries = maxRetries;
    this.minIntervalMs = minIntervalMs;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.nextRequestAt = 0;
  }

  get enabled() {
    return Boolean(this.apiKey);
  }

  async waitForRateLimit() {
    const delay = Math.max(0, this.nextRequestAt - Date.now());
    if (delay > 0) {
      await sleep(delay);
    }
    this.nextRequestAt = Date.now() + this.minIntervalMs;
  }

  async generateJson({stageName, prompt, schema, input, stream = false}) {
    if (!this.enabled) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const payload = {
      model: this.model,
      temperature: this.temperature,
      stream,
      input: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: schema.title ?? stageName,
          strict: true,
          schema: strictJsonSchema(schema),
        },
      },
    };

    let lastError;
    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      await this.waitForRateLimit();
      try {
        const response = await fetch(`${this.baseUrl}/responses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(payload),
        });

        const body = await response.text();
        if (!response.ok) {
          throw new Error(`OpenAI ${response.status}: ${body}`);
        }

        const parsed = JSON.parse(body);
        return parseJsonResponse(extractOutputText(parsed));
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries) {
          await sleep(400 * 2 ** attempt);
        }
      }
    }

    throw lastError;
  }
}
