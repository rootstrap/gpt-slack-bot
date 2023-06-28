import { WebClient } from '@slack/web-api';

export const getThreadMessages = async (slackClient: WebClient, channel: string, ts: string) => {
  const threadHistory = await slackClient.conversations.replies({ channel, ts, inclusive: true });
  return threadHistory.messages;
};

export const getConversationMembers = async (slackClient: WebClient, channel: string, ts: string) => {
  const result = await slackClient.conversations.members({
    channel: channel,
    ts: ts,
    inclusive: true
  });

  return result.members || [];
};

export const getUserNames = async (slackClient: WebClient, userIDs: string[]) => {
  const userNames: { [key: string]: string } = {};

  for (const userID of userIDs) {
    try {
      const result = await slackClient.users.info({
        user: userID
      });

      if (result.user && result.user.real_name) {
        userNames[userID] = result.user.real_name; // There's also real_name_normalized to test in the future
      }
    } catch (error) {
      // Handle any errors or exceptions
      console.error(`Error retrieving name for user ID ${userID}: ${error}`);
    }
  }
  return userNames;
};

export const getMessageWithUserNames = (textWithUserIDs: string, userIDs: string[], userNamesMap: { [key: string]: string }) => {
  for (const userID of userIDs) {
    if (textWithUserIDs.includes(userID)) {
      textWithUserIDs = textWithUserIDs.replaceAll(userID, userNamesMap[userID]);
    }
  }

  return textWithUserIDs;
};
