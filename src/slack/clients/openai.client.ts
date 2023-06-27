import { Configuration, OpenAIApi } from 'openai';
import { getMessageContent, getOpenAiPayload } from '@utils/openai.utils';
import { systemPrompts } from '@constants/messages/system.prompts';
import { checkTokenLimit } from '@utils/tokenizer.utils';

class OpenAIClient {
  private static instance: OpenAIClient;

  constructor(private api: OpenAIApi) {}

  async gptRequest(input: string, prompt: string, context: any) {
    const payload = getOpenAiPayload(input, prompt);

    checkTokenLimit(payload, context);

    const result = await this.api.createChatCompletion({
      model: process.env.OPENAI_CHAT_MODEL || 'gpt-3.5-turbo-16k',
      messages: payload
    });

    return getMessageContent(result);
  }

  async summarizeThread(messageChat: string, context: any) {
    return await this.gptRequest(messageChat, systemPrompts.summarize, context);
  }

  async generateMessageIdea(idea: string, context: any) {
    return await this.gptRequest(idea, systemPrompts.say, context);
  }

  async askGpt(question: string, context: any) {
    return await this.gptRequest(question, systemPrompts.hi, context);
  }

  public static build() {
    if (!this.instance) {
      this.instance = this.init();
    }

    return this.instance;
  }

  private static init(): OpenAIClient {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });

    const openAIApi = new OpenAIApi(configuration);

    return new OpenAIClient(openAIApi);
  }
}

export const openai = OpenAIClient.build();
