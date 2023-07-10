import { HealthCheck } from '@nestjs/terminus';
import { Controller, Get } from '@nestjs/common';
import { AppService } from '@services/app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('healthcheck')
  @HealthCheck()
  public healthCheck() {
    return this.appService.healthCheck();
  }
}
