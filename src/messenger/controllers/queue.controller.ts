import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { RedisService } from "../services/redis.service";

@Controller('queue')
export class QueueController {
    constructor(private readonly redisService: RedisService) {}

    @Post(':type/:channel/:instance') // type: in/out
    async enqueue(
        @Param('type') type: string,
        @Param('channel') channel: string,
        @Param('instance') instance: string,

        @Body() body: any): Promise<{id: string}> 
        {
        const id = await this.redisService.addToQueue({
            ...body,
            type,
            channel,
            instance,
        });
        return { id };
    }

    @Get('pop')
    async pop(): Promise<any> {
        const item = await this.redisService.getFirstFromQueue();
        return item;
    }
}