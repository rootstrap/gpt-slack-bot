import { AppMentionEvent, SayFn } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { openai } from '../clients/openai.client';

export const summarizeHandler = async (event: AppMentionEvent, client: WebClient, say: SayFn) => {
  const { channel, thread_ts: ts } = event;

  if (!ts) {
    throw new Error('Is not a thread');
  }

  const threadHistory = await client.conversations.replies({ channel, ts, inclusive: true });
  const threadMessages = threadHistory.messages;

  if (!threadMessages) {
    throw new Error('No messages');
  }

  var summarizedThread = await openai.summarizeThread(threadMessages);
  await say(summarizedThread);
};
