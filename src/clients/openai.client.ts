import { Configuration, OpenAIApi } from 'openai';
import { getMessageContent, getOpenAiPayload } from '../utils/openai.utils';
import { OpenAIChatModel } from '../constants/enums/chat-model.enum';
import { systemPrompts } from '../constants/messages/system.prompts';
import { checkTokenLimit } from '../utils/tokenizer.utils';
import { Lang } from '../models/language.model';

class OpenAIClient {
  private static instance: OpenAIClient;

  constructor(private api: OpenAIApi) { }

  async gptRequest(input: string, prompt: string) {
    const payload = getOpenAiPayload(input, prompt);

    checkTokenLimit(payload);

    const result = await this.api.createChatCompletion({
      model: OpenAIChatModel.GPT_3_5_TURBO,
      messages: payload
    });

    return getMessageContent(result);
  }

  async summarizeThread(messageChat: string) {
    return await this.gptRequest(messageChat, systemPrompts.summarize);
  }

  async summarizeThreadLang(messageChat: string, lang: Lang) {
    return await this.gptRequest(messageChat, systemPrompts.summarize + lang);
  }

  async generateMessageIdea(idea: string) {
    return await this.gptRequest(idea, systemPrompts.say);
  }

  async askGpt(question: string) {
    return await this.gptRequest(question, systemPrompts.hi);
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
