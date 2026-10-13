import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka, Producer } from 'kafkajs';
import { MatchState } from '../matches/match-state';
import { GameEventBus } from './game-event-bus';

@Injectable()
export class KafkaGameEventBus implements GameEventBus, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaGameEventBus.name);
  private readonly listeners = new Set<(state: MatchState) => void>();
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;

  constructor(private readonly config: ConfigService) {}

  subscribe(listener: (state: MatchState) => void): void {
    this.listeners.add(listener);
  }

  async publish(state: MatchState): Promise<void> {
    if (!this.producer) {
      throw new Error('Kafka producer не подключён');
    }
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await this.producer.send({
          topic: this.topic(),
          messages: [{ key: state.matchId, value: JSON.stringify(state) }],
        });
        return;
      } catch (error) {
        lastError = error;
        await delay(300);
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Не удалось опубликовать событие');
  }

  async onModuleInit(): Promise<void> {
    const deadline = Date.now() + 60_000;
    let lastError: unknown;
    while (Date.now() < deadline) {
      try {
        await this.connect();
        this.logger.log(`Kafka подключена, группа tic-tac-toe-${this.instanceId()}`);
        return;
      } catch (error) {
        lastError = error;
        await this.disconnectQuietly();
        const message = error instanceof Error ? error.message : 'ошибка';
        this.logger.warn(`Kafka недоступна, повтор: ${message}`);
        await delay(2000);
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Kafka недоступна');
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnectQuietly();
  }

  private async connect(): Promise<void> {
    const brokers = this.config
      .getOrThrow<string>('KAFKA_BROKERS')
      .split(',')
      .map((broker) => broker.trim())
      .filter((broker) => broker.length > 0);
    const kafka = new Kafka({
      clientId: `ttt-${this.instanceId()}`,
      brokers,
    });
    const admin = kafka.admin();
    await admin.connect();
    const existing = await admin.listTopics();
    if (!existing.includes(this.topic())) {
      await admin.createTopics({
        topics: [{ topic: this.topic(), numPartitions: 3, replicationFactor: 1 }],
        waitForLeaders: true,
      });
    }
    await admin.disconnect();

    this.producer = kafka.producer();
    await this.producer.connect();
    this.consumer = kafka.consumer({ groupId: `tic-tac-toe-${this.instanceId()}` });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topic(), fromBeginning: false });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) {
          return;
        }
        try {
          const state = JSON.parse(message.value.toString()) as MatchState;
          for (const listener of this.listeners) {
            listener(state);
          }
        } catch (error) {
          const text = error instanceof Error ? error.message : 'ошибка разбора';
          this.logger.error(`Событие Kafka пропущено: ${text}`);
        }
      },
    });
  }

  private async disconnectQuietly(): Promise<void> {
    await this.consumer?.disconnect().catch(() => undefined);
    await this.producer?.disconnect().catch(() => undefined);
    this.consumer = null;
    this.producer = null;
  }

  private topic(): string {
    return this.config.get<string>('KAFKA_TOPIC') ?? 'game.events';
  }

  private instanceId(): string {
    return this.config.get<string>('INSTANCE_ID') ?? 'local';
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
