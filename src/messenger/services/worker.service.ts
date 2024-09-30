import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { QueueService } from "./queue.service";

@Injectable()
export class WorkerService implements OnModuleInit, OnModuleDestroy {
    private isRunning: boolean = true;
    constructor(
        private readonly redisService: RedisService,
        private readonly queueService: QueueService,
        
    ) {}

    async onModuleInit() {
        this.startProcessing();
    }

    async onModuleDestroy() {
        this.isRunning = false;
    }

    async startProcessing() {
        console.log('STARTING WORKER!!!');
        //CODE TO PROCESS QUEUE
        while (this.isRunning) {
            const task = await this.redisService.consumeFromQueue();
            
            if (task) {
                try {
                    console.log('PROCESS:', task);
                    this.queueService.processTask(task);
                } catch (error) {
                    console.error('Failed to process task: ', task, error);
                }
                
            
            } else {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }


}