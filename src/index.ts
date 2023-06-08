import 'dotenv/config';
import { slackApp } from './clients/slack.client';

slackApp.start(process.env.PORT || 3000);
