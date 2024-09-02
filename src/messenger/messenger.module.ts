import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { RedisService } from './services/redis.service';
import { QueueController } from './controllers/queue.controller';


@Module({
  imports: [
    ConfigModule
  ],
  providers: [RedisService],
  controllers: [QueueController]
  
})
export class MessengerModule {}
