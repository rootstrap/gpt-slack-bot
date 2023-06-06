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

async function getConversationThreadHistory(channel, ts, slackClient) {
  const result = await slackClient.conversations.replies({
    channel: channel,
    ts: ts,
    inclusive: true,
  });

  return result.messages.reverse();
}

async function summarizeThread(conversationHistory) {
  var message = conversationHistory.map((message) => `[${message.user}] ${message.text}`).join('\n')

  const payload = getOpenAiPayload(message, "Summarize this conversation");

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

//TODO: do a translation tool
app.command('/translate', async ({ command, ack, respond }) => {
  console.log(command.text);
  // Acknowledge command request
  await ack();

  await respond(`${command.text}`);
});

//TODO: run any gpt prompt
app.command('/gpt', async ({ command, ack, say }) => {
  // Acknowledge command request
  try {
    await ack();
    responseText = await askGpt(command.text);
    responseText
  } catch (error) {
    console.error(error);
    await say("Sorry something went wrong! 😪");
  }
});

app.event('app_mention', async ({ event, context, client, say }) => {
  if (event.text.includes('summarize')) {
    try {
      console.log(event);
      var threadId = event.thread_ts
      var channelId = event.channel
      const conversationHistory = await getConversationThreadHistory(channelId, threadId, client);
      responseText = await summarizeThread(conversationHistory);
      responseText;
    } catch (error) {
      console.error(error);
      await say("Sorry something went wrong! 😪");
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
