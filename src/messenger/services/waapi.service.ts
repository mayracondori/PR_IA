import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Instance } from "../entities/instance.entity";
import { Repository } from "typeorm";
import axios from "axios";
import { ThreadService } from "./thread.service";
import { MessageService } from "./message.service";
import { AssistantService } from "./assistant.service";
import { RedisService } from "./redis.service";
import { Thread } from "../entities/thread.entity";
import { AutomaticService } from "./automatic.service";

@Injectable()
export class WaapiService {
    constructor(
        @InjectRepository(Instance) private readonly instanceRepository: Repository<Instance>,
        @InjectRepository(Thread) private readonly threadRepository: Repository<Thread>,
        private readonly threadService: ThreadService,
        private readonly messageService: MessageService,
        private readonly assistantService: AssistantService,
        private readonly redisService: RedisService,
        private readonly automaticService: AutomaticService,
    ){}

    async execute(config: any, taskPayload:any): Promise<void> {
        if (taskPayload.type === 'out') {
            await this.handleOutgoingMessage(config, taskPayload);
        } else if (taskPayload.type === 'in') {
            console.log('INCOMING!!!!!', taskPayload);
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
        const response = await this.sendMessage(config, instance.externalId, taskPayload.toFrom, taskPayload.message);
    }

    async handleIncommingMessage(config: any, taskPayload:any): Promise<void> {
        const instance = await this.instanceRepository.findOne({ where: { id: taskPayload.instance }});
        const from = taskPayload.data.message.from.split('@')[0];
        if (!instance) {
            throw new Error(`Instance ID: ${taskPayload.instance} not found`)
        }

        //buscar o crear un thread
        const { isNewThread, thread } = await this.threadService.findOrCreateThread(instance, from);
        const message = await this.messageService.createMessage(thread, taskPayload.data.message.body, taskPayload.id, 'incoming');
        
        //getAssistant
        if (isNewThread || !thread.assistants || thread.assistants.length === 0) {
            
            let assistant = await this.assistantService.getAssistant(instance.id);
            if (!assistant) {
                const queueId = await this.redisService.addToQueue({
                    toFrom: from,
                    message: 'No tenemos agentes para atenderte en este momento, porfavor intenta mas tarde.',
                    type: 'out',
                    channel: 'waapi',
                    instance: `${instance.id}`
                });
                return;
            }
            thread.assistants = [assistant];
            await this.threadRepository.save(thread);
        }

        if (thread.assistants[thread.assistants.length - 1].isAutomatic) {
            if (isNewThread) {
                const automaticRes = await this.automaticService.initConversation(thread.assistants[thread.assistants.length - 1], 'waapi', instance.id, taskPayload.data.message.body, from);
                thread.externalId = automaticRes.threadId;
                await this.threadRepository.save(thread);
            } else {
                await this.automaticService.createMessage(thread.assistants[thread.assistants.length - 1], 'waapi', instance.id, thread.externalId, taskPayload.data.message.body, from);
            }
        }

        //call to openai endpoints

        
    }

    async sendMessage(config: any, externalId: string, toFrom: string, message: string) {
        return axios.post(
            `${config.sendUrl}${externalId}${config.service}`,
            {
                chatId: `${toFrom}@c.us`,
                message
            },
            {
                headers: { Authorization: `Bearer ${config.apiKey}` },
            }
        )

    }
}