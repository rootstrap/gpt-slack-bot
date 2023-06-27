import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from '@controllers/app.controller';
import { AppService } from '@services/app.service';

@Module({
  imports: [TerminusModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
