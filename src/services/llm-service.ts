import { LLMProvider } from "../types/interfaces.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * LLM Service for prompt enhancement
 */
export class LLMService {
  private isStdioMode: boolean;

  constructor(isStdioMode: boolean = false) {
    this.isStdioMode = isStdioMode;
  }

  private log(message: string): void {
    if (!this.isStdioMode) {
      console.error(message);
    }
  }

  /**
   * Load system prompt from external file
   */
  private loadSystemPrompt(): string {
    try {
      const promptPath = join(
        __dirname,
        "..",
        "..",
        "prompts",
        "system-prompt.md"
      );
      return readFileSync(promptPath, "utf-8").trim();
    } catch (error) {
      this.log(
        `Warning: Could not load system prompt file, using fallback: ${error}`
      );
      // Fallback prompt if file loading fails - matches content from prompts/system-prompt.md
      return `You are an expert prompt engineer specializing in transforming user requests into highly effective, clear, and well-structured prompts. Your expertise lies in applying advanced prompt engineering techniques to maximize the quality of AI responses.

## Your Enhancement Strategy:

### Core Principles:

1. **Clarity & Specificity**: Transform vague requests into precise, actionable instructions
2. **Structure & Organization**: Add logical structure with headers, sections, and clear formatting
3. **Context Enrichment**: Include necessary background information and requirements
4. **Actionability**: Make prompts results-oriented with clear success criteria
5. **Intent Preservation**: Maintain the original purpose while enhancing effectiveness
6. **Language Consistency**: Respond in the same language as the input

### Enhancement Patterns:

**For Vague Requests** → Add specific requirements, context, and expected outcomes
**For Unstructured Content** → Organize with headers, bullet points, and logical flow
**For Missing Context** → Include relevant background, constraints, and environment details
**For Technical Queries** → Specify technology stack, versions, and implementation requirements
**For Learning Requests** → Add learning objectives, prerequisites, and expected deliverables

### Output Guidelines:

- Provide ONLY the enhanced prompt - no meta-commentary or explanations
- Use markdown formatting for improved readability
- Include placeholders [like this] for user-specific information when needed
- Add clear sections for complex requests (Context, Requirements, Expected Output)
- Ensure the enhanced prompt would produce a more accurate, complete, and useful response

### Quality Markers:

- Enhanced prompts should be 2-3x more specific than the original
- Include success criteria or evaluation metrics when relevant
- Add role definition for the AI when it would improve results
- Specify output format when structure matters

Transform the following prompt using these principles:`;
    }
  }

  /**
   * AI-powered prompt enhancement
   */
  async enhancePrompt(originalPrompt: string): Promise<string> {
    try {
      const enhanced = await this.callLLMForEnhancement(originalPrompt);
      return enhanced;
    } catch (error) {
      this.log("LLM enhancement failed, returning original prompt: " + error);
      throw error;
    }
  }

  /**
   * Call LLM API for prompt enhancement - Universal OpenAI-compatible solution
   */
  private async callLLMForEnhancement(originalPrompt: string): Promise<string> {
    const providers = this.getProviders();

    // Try each provider in order until one works
    for (const provider of providers) {
      const apiKey = process.env[provider.key];
      if (apiKey) {
        try {
          const baseUrl =
            process.env[provider.baseUrl] ||
            this.getDefaultBaseUrl(provider.name);
          const model =
            process.env[provider.model] || this.getDefaultModel(provider.name);

          this.log(
            `Trying ${provider.name} with model: ${model} at ${baseUrl}`
          );
          const result = await this.enhanceWithOpenAICompatible(
            originalPrompt,
            apiKey,
            baseUrl,
            model,
            provider.name
          );
          this.log(`${provider.name} succeeded!`);
          return result;
        } catch (error) {
          this.log(
            `${provider.name} failed: ${
              error instanceof Error ? error.message : String(error)
            }, trying next provider...`
          );
          continue;
        }
      }
    }

    throw new Error(
      "No LLM API configured. Please set an API key (e.g., DEEPSEEK_API_KEY=sk-your-key) in environment variables."
    );
  }

  private getProviders(): LLMProvider[] {
    return [
      {
        name: "OpenAI",
        key: "OPENAI_API_KEY",
        baseUrl: "OPENAI_BASE_URL",
        model: "OPENAI_MODEL",
      },
      {
        name: "DeepSeek",
        key: "DEEPSEEK_API_KEY",
        baseUrl: "DEEPSEEK_BASE_URL",
        model: "DEEPSEEK_MODEL",
      },
      {
        name: "OpenRouter",
        key: "OPENROUTER_API_KEY",
        baseUrl: "OPENROUTER_BASE_URL",
        model: "OPENROUTER_MODEL",
      },
      {
        name: "Together",
        key: "TOGETHER_API_KEY",
        baseUrl: "TOGETHER_BASE_URL",
        model: "TOGETHER_MODEL",
      },
      {
        name: "Groq",
        key: "GROQ_API_KEY",
        baseUrl: "GROQ_BASE_URL",
        model: "GROQ_MODEL",
      },
      {
        name: "Ollama",
        key: "OLLAMA_API_KEY",
        baseUrl: "OLLAMA_BASE_URL",
        model: "OLLAMA_MODEL",
      },
      {
        name: "LMStudio",
        key: "LMSTUDIO_API_KEY",
        baseUrl: "LMSTUDIO_BASE_URL",
        model: "LMSTUDIO_MODEL",
      },
      {
        name: "Anthropic",
        key: "ANTHROPIC_API_KEY",
        baseUrl: "ANTHROPIC_BASE_URL",
        model: "ANTHROPIC_MODEL",
      },
      {
        name: "Mistral",
        key: "MISTRAL_API_KEY",
        baseUrl: "MISTRAL_BASE_URL",
        model: "MISTRAL_MODEL",
      },
      {
        name: "Cohere",
        key: "COHERE_API_KEY",
        baseUrl: "COHERE_BASE_URL",
        model: "COHERE_MODEL",
      },
      {
        name: "Qwen",
        key: "QWEN_API_KEY",
        baseUrl: "QWEN_BASE_URL",
        model: "QWEN_MODEL",
      },
      {
        name: "Gemini",
        key: "GEMINI_API_KEY",
        baseUrl: "GEMINI_BASE_URL",
        model: "GEMINI_MODEL",
      },
      {
        name: "Custom",
        key: "CUSTOM_API_KEY",
        baseUrl: "CUSTOM_BASE_URL",
        model: "CUSTOM_MODEL",
      },
    ];
  }

  private getDefaultBaseUrl(providerName: string): string {
    const defaults: { [key: string]: string } = {
      OpenAI: "https://api.openai.com/v1",
      DeepSeek: "https://api.deepseek.com",
      OpenRouter: "https://openrouter.ai/api/v1",
      Together: "https://api.together.xyz/v1",
      Groq: "https://api.groq.com/openai/v1",
      Ollama: "http://localhost:11434/v1",
      LMStudio: "http://localhost:1234/v1",
      Anthropic: "https://api.anthropic.com/v1",
      Mistral: "https://api.mistral.ai/v1",
      Cohere: "https://api.cohere.ai/v1",
      Qwen: "https://dashscope.aliyuncs.com/api/v1",
      Gemini: "https://generativelanguage.googleapis.com/v1beta",
      Custom: "http://localhost:8080/v1",
    };
    return defaults[providerName] || "https://api.openai.com/v1";
  }

  private getDefaultModel(providerName: string): string {
    const defaults: { [key: string]: string } = {
      OpenAI: "gpt-4",
      DeepSeek: "deepseek-chat",
      OpenRouter: "anthropic/claude-3.5-sonnet",
      Together: "meta-llama/Llama-2-70b-chat-hf",
      Groq: "llama3-70b-8192",
      Ollama: "llama2",
      LMStudio: "local-model",
      Anthropic: "claude-3-sonnet-20240229",
      Mistral: "mistral-large-latest",
      Cohere: "command",
      Qwen: "qwen-max",
      Gemini: "gemini-1.5-pro-latest",
      Custom: "gpt-3.5-turbo",
    };
    return defaults[providerName] || "gpt-3.5-turbo";
  }

  private async enhanceWithOpenAICompatible(
    prompt: string,
    apiKey: string,
    baseUrl: string,
    model: string,
    providerName: string
  ): Promise<string> {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

    // Load system prompt from external file
    const systemPrompt = this.loadSystemPrompt();

    this.log(`Making request to ${endpoint} with model ${model}`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(providerName === "OpenRouter" && {
          "HTTP-Referer": "https://github.com/mcp-gui-server",
        }),
        ...(providerName === "OpenRouter" && { "X-Title": "MCP GUI Server" }),
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Please enhance this prompt:\n\n${prompt}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        ...(providerName === "Ollama" && { stream: false }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.log(
        `${providerName} API error details: ${response.status} ${response.statusText} - ${errorText}`
      );
      throw new Error(
        `${providerName} API error: ${response.status} ${
          response.statusText
        } - ${errorText.substring(0, 200)}`
      );
    }

    const data = await response.json();

    // Handle different response formats
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    } else if (data.content && Array.isArray(data.content)) {
      // Anthropic format fallback
      return data.content[0].text.trim();
    } else {
      throw new Error(`Unexpected response format from ${providerName}`);
    }
  }
}
