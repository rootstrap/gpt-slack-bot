import 'dotenv/config';
import { slackApp } from '@slack/clients/slack.client';
import { createNestApplication } from '@app/nest.app';

async function bootstrap() {
  const app = await createNestApplication();

  app
    .listen(process.env.PORT)
    .then(async () => await slackApp.start())
    .catch((error) => console.error(error));
}

bootstrap();
