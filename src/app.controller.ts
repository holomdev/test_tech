import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation } from '@nestjs/swagger';
import { Auth } from './iam/authentication/decorators/auth.decorator';
import { AuthType } from './iam/authentication/enums/auth-type.enum';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Auth(AuthType.None)
  @ApiOperation({
    summary: 'Check the health of the application',
    description: 'Returns the status of the application',
  })
  @Get('health')
  healthcheck(): string {
    return this.appService.healthcheck();
  }
}
