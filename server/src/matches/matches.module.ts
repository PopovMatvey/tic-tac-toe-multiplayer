import { Module } from '@nestjs/common';
import { MessagingModule } from '../messaging/messaging.module';
import { MatchesGateway } from './matches.gateway';
import { MatchesService } from './matches.service';

@Module({
  imports: [MessagingModule],
  providers: [MatchesService, MatchesGateway],
})
export class MatchesModule {}
