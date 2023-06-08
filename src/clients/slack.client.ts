import { App, AppMentionEvent, SayFn } from '@slack/bolt';
import { openai } from './openai.client';
import { botResponses } from '../constants/messages/bot.message';
import { summarizeHandler } from '../handlers/summarize.handler';
import { WebClient } from '@slack/web-api';

class SlackApp {
  private static instance: App;

  public static build() {
    if (!this.instance) {
      this.instance = this.init();
      this.registerMentionEvents();
      this.registerCommands();
    }

    return this.instance;
  }

  private static handlers: any = {
    summarize: async (event: AppMentionEvent, client: WebClient, say: SayFn) => summarizeHandler(event, client, say)
  };

  private static init(): App {
    return new App({
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      token: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.APP_TOKEN,
      socketMode: true
    });
  }

  private static registerMentionEvents() {
    this.instance.event('app_mention', async ({ event, context, client, say }) => {
      try {
        const message = event.text;
        const cmd = message.split(' ').pop() || '';

        const handler = this.handlers[cmd];

        if (handler) {
          await handler(event, client, say);
        } else {
          await this.defaultAnswer(say);
        }
      } catch (error) {
        await this.defaultError(say);
      }
    });
  }

  private static registerCommands() {
    this.instance.command('/hi', async ({ command, ack, say }) => {
      var query = command.text;

      if (query.trim().length > 0) {
        try {
          await ack();
          const responseText = await openai.askGpt(command.text);
          await say(responseText);
        } catch (error) {
          await this.defaultError(say);
        }
      } else {
        await this.defaultAnswer(say);
      }
    });
  }

  private static async defaultAnswer(say: SayFn) {
    await say(botResponses.default);
  }

  private static async defaultError(say: SayFn) {
    await say(botResponses.error);
  }
}

export const slackApp = SlackApp.build();
