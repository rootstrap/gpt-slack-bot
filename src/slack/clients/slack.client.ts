import { WebClient } from '@slack/web-api';
import { Lang } from '../../models/language.model';
import { App, AppMentionEvent, SayFn } from '@slack/bolt';
import { openai } from '@slack/clients/openai.client';
import { summarizeHandler } from '@slack/handlers/summarize.handler';
import { botResponses } from '@constants/messages/bot.message';

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
    summarize: async (event: AppMentionEvent, client: WebClient, say: SayFn) => summarizeHandler(event, client, say, Lang.en),
    resumir: async (event: AppMentionEvent, client: WebClient, say: SayFn) => summarizeHandler(event, client, say, Lang.es),
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
    this.instance.event('app_mention', async ({ event, client, say }) => {
      try {
        const message = event.text;
        const cmd = message.split(' ').pop() || '';

        const handler = this.handlers[cmd];

        if (handler) {
          await handler(event, client, say);
        } else {
          await this.defaultAnswer(say, event);
        }
      } catch (error) {
        await this.defaultError(say, event);
      }
    });
  }

  private static registerCommands() {
    this.instance.command('/hi', async ({ command, ack, say }) => {
      await ack();

      const { user_id: user, text: query } = command;

      if (query.trim().length > 0) {
        try {
          const context = { user };
          const responseText = await openai.askGpt(command.text, context);
          await say(responseText);
        } catch (error) {
          await this.defaultError(say);
        }
      } else {
        await this.defaultAnswer(say);
      }
    });

    this.instance.command('/say', async ({ command, ack, say }) => {
      await ack();

      const { user_id: user, text: query } = command;
      const actions = query.split(' to ');

      if (actions.length > 0) {
        const target = actions.pop();
        const order = actions.map((e) => e).join(' to ');

        const context = { user };
        const responseText = await openai.generateMessageIdea(order, context);

        if (target) {
          try {
            await this.instance.client.chat.postMessage({
              channel: target ?? '',
              text: responseText
            });
          } catch (e) {
            await say(responseText);
          }
        } else {
          await this.defaultAnswer(say);
        }
      } else {
        await this.defaultAnswer(say);
      }
    });
  }

  private static async defaultAnswer(say: SayFn, event?: AppMentionEvent) {
    await say({ text: botResponses.default, thread_ts: event?.ts || undefined });
  }

  private static async defaultError(say: SayFn, event?: AppMentionEvent) {
    await say({ text: botResponses.error, thread_ts: event?.ts || undefined });
  }
}

export const slackApp = SlackApp.build();
