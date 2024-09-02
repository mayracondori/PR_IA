import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MessengerModule } from './messenger/messenger.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
    }),
    MessengerModule
  ],
  
})
export class AppModule {}
