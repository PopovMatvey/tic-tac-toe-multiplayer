import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('api/health')
export class HealthController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  get() {
    return {
      ok: true,
      instanceId: this.config.get<string>('INSTANCE_ID') ?? 'local',
    };
  }
}
