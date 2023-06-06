require('dotenv').config();
const http = require('http');
const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const openaiChatModel = process.env.OPENAI_CHAT_MODEL;
const systemPrompt = fs.readFileSync('./agent.txt', 'utf8');

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

async function getConversationHistory(channel, ts, slackClient) {
  const result = await slackClient.conversations.replies({
    channel: channel,
    ts: ts,
    inclusive: true,
  });

  return result.messages.reverse();
}

async function getOpenAiResponse(conversationHistory) {
  const messages = getOpenAiPayload(conversationHistory, "Summarize this conversation: ");

  const result = await openai.createChatCompletion({
    model: openaiChatModel,
    messages: messages,
  });

  return result.data.choices.shift().message.content;
}

function getOpenAiPayload(conversationHistory, action) {
  return [
    {
      role: 'system', content: systemPrompt,
    },
    ...conversationHistory.map((message) => ({ role: messageRole(message), content: action + message.text })),
  ];
}

//TODO: translate
app.command('/translate', async ({ command, ack, respond }) => {
  console.log(command.text);
  // Acknowledge command request
  await ack();

  await respond(`${command.text}`);
});

//TODO: run any gpt prompt
app.command('/gpt', async ({ command, ack, respond }) => {
  console.log(command.text);
  // Acknowledge command request
  await ack();

  await respond(`${command.text}`);
});

app.message(async ({ message, say, ack, client }) => {
  console.log(message);
  if (!message.type === 'message' || message.subtype) {
    return message;
  }

  const conversationHistory = await getConversationHistory(message.channel, message.ts, client);

  responseText = await getOpenAiResponse(conversationHistory);
  await say(responseText);
});

app.event('app_mention', async ({ event, context, client, say }) => {
  if (event.text.includes('summarize')) {
    try {
      console.log(event);
      var threadId = event.thread_ts
      var channelId = event.channel
      const conversationHistory = await getConversationHistory(channelId, threadId, client);
      console.log(conversationHistory)
      responseText = await getOpenAiResponse(conversationHistory);
      await say(responseText);
    } catch (error) {
      console.error(error);
    }
  } else {
    say(
      'Hey 👋. What can I do for you? \n' +
      'Tag me with the text "summarize" in a thread to summarize you the thread conversation. \n' +
      'Type / to see all my available commands.'
    )
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Slack bot server is running!');
})();
