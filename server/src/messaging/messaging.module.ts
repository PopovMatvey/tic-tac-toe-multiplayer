import { Module } from '@nestjs/common';
import { GAME_EVENT_BUS } from './game-event-bus';
import { KafkaGameEventBus } from './kafka-game-event-bus';

@Module({
  providers: [
    KafkaGameEventBus,
    { provide: GAME_EVENT_BUS, useExisting: KafkaGameEventBus },
  ],
  exports: [GAME_EVENT_BUS],
})
export class MessagingModule {}
