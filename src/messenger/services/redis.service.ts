import { Injectable } from "@nestjs/common";
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config'

@Injectable()
export class RedisService {
    private readerRedis: Redis;
    private writerRedis: Redis;
    constructor(private configService: ConfigService) {
        this.readerRedis = new Redis({
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
            password: configService.get<string>('REDIS_PASSWORD'),
        });

        this.writerRedis = new Redis({
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
            password: configService.get<string>('REDIS_PASSWORD'),
        });
        console.log('CONNECTED TO REDIS!!!!')
    }

    async addToQueue(data: any): Promise<string> {
        const id = new Date().getTime().toString();//Generate unique id
        await this.writerRedis.lpush('queue3', JSON.stringify({ id, ...data }));
        return id;
    }

    async getFirstFromQueue(): Promise<any> {    
        const item = await this.readerRedis.brpop('queue3', 0);
        return JSON.parse(item[1]);
    }

}
