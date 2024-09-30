import { Injectable } from "@nestjs/common";
import { Assistant } from "../entities/assistant.entity";
import OpenAI from "openai";
import { threadId } from "worker_threads";
import { RedisService } from "./redis.service";
import { Run } from "openai/resources/beta/threads/runs/runs";

@Injectable()
export class OpenaiAservice {
    private openai: OpenAI;
    constructor(
        private readonly redisService: RedisService,
    ) {

    }

    async initConversation(assistant: Assistant, channel: string, instanceId: number, message: string, origin: string): Promise<any> {
        const configObj = this.getConfigObj(assistant);
        this.initOpenAI(configObj.authorization);
        let res: string | Run;
        const run = await this.openai.beta.threads.createAndRun({
            assistant_id: configObj.assistantId,
            thread: {
              messages: [
                { role: "user", content: message },
              ],
            },
          });
        
        res = await this.waitForResponse(run.thread_id, run.id);
        const response = await this.handleResponse(res, channel, instanceId, origin, run.thread_id, configObj);

        return {
            rundId: run.id,
            threadId: run.thread_id,
        }
    
    }

    async createMessage(assistant: Assistant, channel: string, instanceId: number, threadId: string, message: string, origin: string): Promise<any> {
        const configObj = this.getConfigObj(assistant);
        this.initOpenAI(configObj.authorization);
        let res: string | Run;
        await this.openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content: message,
        });

        const run = await this.openai.beta.threads.runs.create(threadId, {
            assistant_id: configObj.assistantId,
        });
        
        res = await this.waitForResponse(run.thread_id, run.id);
        const response = await this.handleResponse(res, channel, instanceId, origin, threadId, configObj);

        return {
            rundId: run.id,
            threadId: run.thread_id,
        }
    
    }

    private initOpenAI(authorization: string) {  
        this.openai = new OpenAI({
            apiKey: authorization,
        });
    }

    private getConfigObj(assistant: Assistant): any {
        const configObj = JSON.parse(assistant.config);
        return configObj;
    }

    private async waitForResponse(threadId: string, runId: string): Promise <string | Run> {
        const runStatus = await this.waitForRunCompletion(threadId, runId);
        if (this.isRun(runStatus)) {
            return runStatus;
        } else{
            if (runStatus == 'not_processed') {
                return 'Hay un problema al procesar su mensaje, intentelo nuevamente mas tarde';
            } else {
                const assistantResponse = await this.getAssistantResponse(threadId);
                return assistantResponse;
            }
        }
    }

    private async getAssistantResponse(threadId: string): Promise<string> {
        const messages = await this.openai.beta.threads.messages.list(threadId);
        let lastMessage = null;

        for (let i = 0; i < messages.data.length; i++) {
            if (messages.data[i].role === 'assistant') {
                lastMessage = messages.data[i];
                break;
            }
        }
        return lastMessage.content[0].text.value;
    }

    private async waitForRunCompletion(threadId: string, runId: string): Promise <string|Run> {
        let run;
        let factor = 1
        do {
            run = await this.openai.beta.threads.runs.retrieve(threadId, runId);
            if (    run.status === 'completed' || 
                    run.status === 'cancelled' || 
                    run.status === 'failed' || 
                    run.status === 'expired' || 
                    run.status === 'requires_action') {
                break;        
            }
            await new Promise(resolve => setTimeout(resolve, 500 * factor));
            factor = factor * 1.2;
        } while ((run.status === 'queued' || run.status === 'in_progress') && factor < 3);

        if (run.status === 'requires_action') {
            return run;
        }

        return (run.status === 'cancelled' || run.status === 'failed' || run.status === 'expired' || run.status === 'queued' || run.status === 'in_progress') ? 'not_processed' : run.status;
    }

    private async handleResponse(response: string | Run, channel: string, instanceId: number, origin: string, threadId: string, assistantConfig: any): Promise<string> {
        if (this.isRun(response)) {
            if (response.status === 'requires_action' && response.required_action && response.required_action.submit_tool_outputs
                && response.required_action.submit_tool_outputs.tool_calls)  {
                const functions = [];

                for (const toolCall of response.required_action.submit_tool_outputs.tool_calls) {
                    functions.push({ id: toolCall.id, name: toolCall.function.name, params: toolCall.function.arguments })
                }

                const queueId = await this.redisService.addToQueue({
                    type: 'function',
                    channel,
                    instance: instanceId, 
                    firedBy: 'openai',
                    runId: response.id,
                    threadId,
                    origin,
                    functions,
                    assistantConfig,
                });

                return '__running_function';


            }

        } else {
            const queueId = await this.redisService.addToQueue({
                toFrom: origin,
                message: response,
                type: 'out',
                channel,
                instance: `${instanceId}`, 
            });
            return queueId;
        }

    }

    async handleRequireFunction(threadId: string, instanceId: number, channel: string, origin: string, functions: any, runId: string, assistantConfig: any): Promise<any> {
        this.initOpenAI(assistantConfig.authorization);
        const functionsOutput = functions.map(item => ({
            tool_call_id: item.id,
            output: item.output,
        }));

        let res: string | Run;

        const run = await this.openai.beta.threads.runs.submitToolOutputsAndPoll(
            threadId,
            runId,
            {
                tool_outputs: functionsOutput
            },
        );
        res = await this.waitForResponse(run.thread_id, run.id);
        const response = await this.handleResponse(res, channel, instanceId, origin, threadId, assistantConfig);

        return {
            runId: run.id,
            threadId,
            response,
        };

    
    }

    private isRun(obj: any): obj is Run {
        return (
            obj &&
            typeof obj === 'object' &&
            typeof obj.id === 'string' &&
            typeof obj.status === 'string'
        )

    }
}