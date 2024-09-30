import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Instance } from "../entities/instance.entity";
import { Repository } from "typeorm";
import { ThreadService } from "./thread.service";
import { MessageService } from "./message.service";
import { AssistantService } from "./assistant.service";
import { RedisService } from "./redis.service";
import { Thread } from "../entities/thread.entity";
import { AutomaticService } from "./automatic.service";
import { WebsocketGateway } from "../websocket.gateway";

@Injectable()
export class WebService {
    constructor(
        @InjectRepository(Instance) private readonly instanceRepository: Repository<Instance>,
        @InjectRepository(Thread) private readonly threadRepository: Repository<Thread>,
        private readonly threadService: ThreadService,
        private readonly messageService: MessageService,
        private readonly assistantService: AssistantService,
        private readonly redisService: RedisService,
        private readonly automaticService: AutomaticService,
        private readonly websocketGateway: WebsocketGateway,
    ){}

    async execute(config: any, taskPayload:any): Promise<void> {
        if (taskPayload.type === 'out') {
            await this.handleOutgoingMessage(config, taskPayload);
        } else if (taskPayload.type === 'in') {
            await this.handleIncommingMessage(config, taskPayload);
        } else {
            throw new Error(`Not implemented`)
        }
    }

    async handleOutgoingMessage(config: any, taskPayload:any): Promise<void> {
        const instance = await this.instanceRepository.findOne({ where: { id: taskPayload.instance }});
        if (!instance) {
            throw new Error(`Instance ID: ${taskPayload.instance} not found`)
        }

        //buscar o crear un thread
        const { thread } = await this.threadService.findOrCreateThread(instance, taskPayload.toFrom);
        const message = await this.messageService.createMessage(thread, taskPayload.message, taskPayload.id, 'outgoing', taskPayload.refId);
        this.websocketGateway.sendMessage(taskPayload.toFrom, message);
    }

    async handleIncommingMessage(config: any, taskPayload:any): Promise<void> {
        const instance = await this.instanceRepository.findOne({ where: { id: taskPayload.instance }});
        
        if (!instance) {
            throw new Error(`Instance ID: ${taskPayload.instance} not found`)
        }

        //buscar o crear un thread
        const { isNewThread, thread } = await this.threadService.findOrCreateThread(instance, taskPayload.toFrom);
        const message = await this.messageService.createMessage(thread, taskPayload.message, taskPayload.id, 'incoming');
        
        //getAssistant
        if (isNewThread || !thread.assistants || thread.assistants.length === 0) {
            
            let assistant = await this.assistantService.getAssistant(instance.id);
            if (!assistant) {
                const queueId = await this.redisService.addToQueue({
                    toFrom: taskPayload.toFrom,
                    message: 'No tenemos agentes para atenderte en este momento, porfavor intenta mas tarde.',
                    type: 'out',
                    channel: 'web',
                    instance: `${instance.id}`
                });
                return;
            }
            thread.assistants = [assistant];
            await this.threadRepository.save(thread);
        }

        if (thread.assistants[thread.assistants.length - 1].isAutomatic) {
            if (isNewThread) {
                const automaticRes = await this.automaticService.initConversation(thread.assistants[thread.assistants.length - 1], 'web', instance.id, taskPayload.message, taskPayload.toFrom);
                thread.externalId = automaticRes.threadId;
                await this.threadRepository.save(thread);
            } else {
                await this.automaticService.createMessage(thread.assistants[thread.assistants.length - 1], 'web', instance.id, thread.externalId, taskPayload.message, taskPayload.toFrom);
            }
        }
        
    }

}