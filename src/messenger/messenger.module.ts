import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './services/redis.service';
import { QueueController } from './controllers/queue.controller';
import { WorkerService } from './services/worker.service';
import { QueueService } from './services/queue.service';
import { WaapiService } from './services/waapi.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Queue } from './entities/queue.entity';
import { Channel } from './entities/channel.entity';
import { Instance } from './entities/instance.entity';
import { Thread } from './entities/thread.entity';
import { Message } from './entities/message.entity';
import { ThreadService } from './services/thread.service';
import { MessageService } from './services/message.service';
import { Assistant } from './entities/assistant.entity';
import { InstanceAssistant } from './entities/instance-assistant.entity';
import { AssistantService } from './services/assistant.service';
import { AutomaticService } from './services/automatic.service';
import { OpenaiAservice } from './services/openai.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Queue,
      Channel,
      Instance,
      Thread,
      Message,
      Assistant,
      InstanceAssistant,
    ]),
    ConfigModule,
  ],
  providers: [
    RedisService,
    WorkerService,
    QueueService,
    WaapiService,
    ThreadService,
    MessageService,
    AssistantService,
    AutomaticService,
    OpenaiAservice,
  ],
  controllers: [QueueController],
})
export class MessengerModule {}
