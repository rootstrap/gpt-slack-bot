import { Configuration, OpenAIApi } from 'openai';
import { getOpenAiPayload } from '../utils/openai.utils';
import { OpenAIChatModel } from '../constants/enums/chat-model.enum';
import { botResponses } from '../constants/messages/bot.message';

class OpenAIClient {
  private static instance: OpenAIClient;

  constructor(private api: OpenAIApi) {}

  async summarizeThread(conversationHistory: any[]) {
    var messageChat = conversationHistory.map((msg: any) => `[${msg.user}] ${msg.text}`).join(' ');
    const payload = getOpenAiPayload(messageChat, botResponses.summarize);

    const result = await this.api.createChatCompletion({
      model: OpenAIChatModel.GPT_3_5_TURBO,
      messages: payload
    });

    const choice = result.data.choices.shift();
    const message = choice ? choice.message : null;

    return message ? message.content : '';
  }

  async gptRequest(payload: any) {
    const result = await this.api.createChatCompletion({
      model: OpenAIChatModel.GPT_3_5_TURBO,
      messages: payload
    });

    const choice = result.data.choices.shift();
    const message = choice ? choice.message : null;

    return message ? message.content : '';
  }

  async generateMessageIdea(idea: string) { 
    const payload = getOpenAiPayload(idea, botResponses.say);
    return await this.gptRequest(payload);
  }

  async askGpt(question: string) {
    const payload = getOpenAiPayload(question, botResponses.hi);

    const result = await this.api.createChatCompletion({
      model: OpenAIChatModel.GPT_3_5_TURBO,
      messages: payload
    });

    const choice = result.data.choices.shift();
    const message = choice ? choice.message : null;

    return message ? message.content : '';
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
