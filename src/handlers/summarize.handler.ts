import { AppMentionEvent, SayFn } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { openai } from '../clients/openai.client';
import { getConversationMembers, getMessageWithUserNames, getThreadMessages, getUserNames } from '../utils/slack.utils';

export const summarizeHandler = async (event: AppMentionEvent, client: WebClient, say: SayFn) => {
  const { channel, thread_ts: ts } = event;

  if (!ts) {
    throw new Error('Is not a thread');
  }

  const threadMessages = await getThreadMessages(client, channel, ts);

  if (!threadMessages) {
    throw new Error('No messages');
  }

  const formattedMessages = threadMessages.map((msg: any) => `[${msg.user}] ${msg.text}`).join(' ');
  let summarizedThread = await openai.summarizeThread(formattedMessages);

  const userIDs = await getConversationMembers(client, channel, ts);
  const userNamesMap = await getUserNames(client, userIDs);
  const summary = getMessageWithUserNames(summarizedThread, userIDs, userNamesMap);

  await say({ text: summary, thread_ts: ts });
};
