import 'dotenv/config';
import * as ngrok from 'ngrok';
import { slackApp } from './clients/slack.client';

const isDev = process.env.STAGE === 'dev';

slackApp.start(process.env.PORT || 3000).then(async () => {
  if (isDev) {
    const url = await ngrok.connect({ authtoken: process.env.NGROK_AUTH_TOKEN, addr: 3000 });
    console.log(`Development url: ${url}`);
  }
});
