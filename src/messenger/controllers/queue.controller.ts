import { Body, Controller, Get, Post } from "@nestjs/common";
import { RedisService } from "../services/redis.service";

@Controller('queue')
export class QueueController {
    constructor(private readonly redisService: RedisService) {}

    @Post()
    async enqueue(@Body() body: any): Promise<{id: string}> {
        const id = await this.redisService.addToQueue(body);
        return { id };
    }

    @Get('pop')
    async pop(): Promise<any> {
        const item = await this.redisService.getFirstFromQueue();
        return item;
    }
}