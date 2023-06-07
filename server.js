require('dotenv').config();
const http = require('http');
const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const openaiChatModel = process.env.OPENAI_CHAT_MODEL;

const { App } = require('@slack/bolt');

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.APP_TOKEN,
  socketMode: true,
});

function messageRole(message) {
  if (!message.bot_id) {
    return 'user';
  } else {
    return 'assistant';
  }
};

async function getConversationThreadHistory(channel, ts, slackClient) {
  const result = await slackClient.conversations.replies({
    channel: channel,
    ts: ts,
    inclusive: true,
  });

  return result.messages;
}

async function summarizeThread(conversationHistory) {
  var message = conversationHistory.map((message) => `[${message.user}] ${message.text}`).join(' ')
  const payload = getOpenAiPayload(message, "Summarize this conversation, highlight the most important parts, don't mentions the users name, the response should be in the same predominant language in the conversation.");

  const result = await openai.createChatCompletion({
    model: openaiChatModel,
    messages: payload,
  });

  return result.data.choices.shift().message.content;
}

async function askGpt(question) {
  const payload = getOpenAiPayload(question, "Answer");

  const result = await openai.createChatCompletion({
    model: openaiChatModel,
    messages: payload,
  });

  return result.data.choices.shift().message.content;
}

function getOpenAiPayload(message, action) {
  return [
    {
      role: 'system', content: action,
    },
    {
      role: 'user', content: message,
    }
  ];
}

async function defaultAnswer(say) {
  await say(
    'Hey 👋. What can I do for you? \n' +
    'Tag me with the text "summarize" in a thread to summarize you the thread conversation. \n' +
    'Type / to see all my available commands.'
  )
}

async function defaultError(say) {
  await say("Sorry something went wrong! 😪");
}

//TODO: run any gpt prompt
app.command('/hi', async ({ command, ack, say }) => {
  // Acknowledge command request
  var query = command.text;
  if (query.trim.length > 0) {
    try {
      await ack();
      responseText = await askGpt(command.text);
      await say(responseText);
    } catch (error) {
      console.error(error);
      await defaultError(say);
    }
  } else {
    await defaultAnswer(say);
  }
});

app.event('app_mention', async ({ event, context, client, say }) => {
  if (event.text.includes('summarize')) {
    try {
      var threadId = event.thread_ts
      var channelId = event.channel
      const threadHistory = await getConversationThreadHistory(channelId, threadId, client);
      var summarizedThread = await summarizeThread(threadHistory);
      await say(summarizedThread);
    } catch (error) {
      await defaultError(say);
    }
  } else {
    await defaultAnswer(say);
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Slack bot server is running!');
})();
