import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Queue } from "../entities/queue.entity";
import { Channel } from "../entities/channel.entity";
import { WaapiService } from "./waapi.service";

@Injectable()
export class QueueService {
    constructor(
        @InjectRepository(Queue) private readonly queueRepository: Repository<Queue>,
        @InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,
        private readonly waapiService: WaapiService,
    ) {}

    async processTask(task: any): Promise<void> {
        const taskPayload = JSON.stringify(task);
        let myqueue = await this.queueRepository.create({ redisId: task.id, payload: taskPayload});
        myqueue = await this.queueRepository.save(myqueue);

        let channel: Channel;
        channel = await this.channelRepository.findOne({ where: { code: task.channel }});

        if (!channel) {
            myqueue.errorReason = `Channel ${task.channel} not found`;
            myqueue.status = 'ERROR';
            await this.queueRepository.save(myqueue);
            return;
        }
        try {
            await this.execute(channel.code, JSON.parse(channel.config), task);
        } catch (error) {
            //console.log('ERROR!!!!!', error);
            myqueue.errorReason = error.message;
            myqueue.status = 'ERROR';
            await this.queueRepository.save(myqueue);
            return;
        }
        myqueue.status = 'PROCESSED';
        await this.queueRepository.save(myqueue);
    }

    private async execute(channel: string, config: any, taskPayload: any): Promise<void> {
        console.log(config);
        switch(channel) {
            case 'waapi':
                this.waapiService.execute(config, taskPayload);
                break;
            case 'web': 
                console.log('WEB SERVICE!!!!');
                break;
            default:
                throw new Error(`Service ${channel} not found`);
        }
    }
}