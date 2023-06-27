import { AppMentionEvent, SayFn } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { openai } from '@slack/clients/openai.client';
import { getConversationMembers, getMessageWithUserNames, getThreadMessages, getUserNames } from '@utils/slack.utils';

export const summarizeHandler = async (event: AppMentionEvent, client: WebClient, say: SayFn) => {
  const { channel, thread_ts, user } = event;

  if (!thread_ts) {
    throw new Error('Is not a thread');
  }

  const threadMessages = await getThreadMessages(client, channel, thread_ts);

  if (!threadMessages) {
    throw new Error('No messages');
  }

  const context = { thread_ts, user };
  const formattedMessages = threadMessages.map((msg: any) => `[${msg.user}] ${msg.text}`).join(' ');
  const summarizedThread = await openai.summarizeThread(formattedMessages, context);

  const userIDs = await getConversationMembers(client, channel, thread_ts);
  const userNamesMap = await getUserNames(client, userIDs);
  const summary = getMessageWithUserNames(summarizedThread, userIDs, userNamesMap);

  await say({ text: summary, thread_ts });
};
