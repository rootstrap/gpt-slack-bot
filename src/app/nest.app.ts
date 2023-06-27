import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@modules/app.module';

export async function createNestApplication(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  return app;
}
