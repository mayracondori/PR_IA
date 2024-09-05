import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { RedisService } from './services/redis.service';
import { QueueController } from './controllers/queue.controller';
import { WorkerService } from './services/worker.service';
import { QueueService } from './services/queue.service';
import { WaapiService } from './services/waapi.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Queue } from './entities/queue.entity';
import { Channel } from './entities/channel.entity';
import { Instance } from './entities/instance.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Queue, Channel, Instance]),
    ConfigModule
  ],
  providers: [RedisService, WorkerService, QueueService, WaapiService],
  controllers: [QueueController]

})
export class MessengerModule {}