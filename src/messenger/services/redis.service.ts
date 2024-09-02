import { Injectable } from "@nestjs/common";
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config'

@Injectable()
export class RedisService {
    private readerRedis: Redis;
    private writerRedis: Redis;
    constructor(private configService: ConfigService) {
        this.readerRedis = new Redis({
            host: configService.get<string>('172.20.29.22'),
            port: configService.get<number>('6379'),
            password: configService.get<string>('uais2022.'),
        });

        this.writerRedis = new Redis({
            host: configService.get<string>('172.20.29.22'),
            port: configService.get<number>('6379'),
            password: configService.get<string>('uais2022.'),
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
