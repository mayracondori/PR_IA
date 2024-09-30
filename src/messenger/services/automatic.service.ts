import { Injectable } from "@nestjs/common";
import { Assistant } from "../entities/assistant.entity";
import { OpenaiAservice } from "./openai.service";

@Injectable()
export class AutomaticService {
    constructor(
        private readonly openaiService: OpenaiAservice,
    ) {}
    async initConversation(assistant: Assistant, channel: string, instanceId: number, message: string, origin: string): Promise<any> {
        let res;
        switch(assistant.type) {
            case 'openai':
                res = await this.openaiService.initConversation(assistant, channel, instanceId, message, origin);
                break;
            default:
                throw new Error(`Service ${assistant.type} not found`) 
        }
        return res;
    }

    async createMessage(assistant: Assistant, channel: string, instanceId: number, threadId: string, message: string, origin: string): Promise<any> {
        switch(assistant.type) {
            case 'openai':
                this.openaiService.createMessage(assistant, channel, instanceId, threadId, message, origin);
                break;
            default:
                throw new Error(`Service ${assistant.type} not found`) 
        }
        return true;
    }

    async handleRequireFunction(type: string, threadId: string, instanceId: number, channel: string, origin: string, functions: any, runId: string, assistantConfig: any): Promise<any> {
        switch(type) {
            case 'openai':
                this.openaiService.handleRequireFunction(threadId, instanceId, channel, origin, functions, runId, assistantConfig);
                break;
            default:
                throw new Error(`Service ${type} not found`); 
        }
        return true;
    }
}