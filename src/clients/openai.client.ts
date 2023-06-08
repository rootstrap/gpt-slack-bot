import { Configuration, OpenAIApi } from 'openai';
import { getMessageContent, getOpenAiPayload } from '../utils/openai.utils';
import { OpenAIChatModel } from '../constants/enums/chat-model.enum';
import { systemPrompts } from '../constants/messages/system.prompts';

class OpenAIClient {
  private static instance: OpenAIClient;

  constructor(private api: OpenAIApi) {}

  async summarizeThread(conversationHistory: any[]) {
    var messageChat = conversationHistory.map((msg: any) => `[${msg.user}] ${msg.text}`).join(' ');
    const payload = getOpenAiPayload(messageChat, systemPrompts.summarize);

    const result = await this.api.createChatCompletion({
      model: OpenAIChatModel.GPT_3_5_TURBO,
      messages: payload
    });

    return getMessageContent(result);
  }

  async askGpt(question: string) {
    const payload = getOpenAiPayload(question, systemPrompts.hi);

    const result = await this.api.createChatCompletion({
      model: OpenAIChatModel.GPT_3_5_TURBO,
      messages: payload
    });

    return getMessageContent(result);
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
