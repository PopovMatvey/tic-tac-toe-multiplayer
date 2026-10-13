import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { LeadersController } from './leaders.controller';

@Module({
  imports: [UsersModule],
  controllers: [LeadersController],
})
export class LeadersModule {}
