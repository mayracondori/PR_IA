import { Injectable } from '@nestjs/common';
import { Assistant } from '../entities/assistant.entity';
import OpenAI from 'openai';
import { threadId } from 'worker_threads';
import { RedisService } from './redis.service';

@Injectable()
export class OpenaiAservice {
  private openai: OpenAI;
  constructor(private readonly redisService: RedisService) {}

  async initConversation(
    assistant: Assistant,
    channel: string,
    instanceId: number,
    message: string,
    origin: string,
  ): Promise<any> {
    const configObj = this.getConfigObj(assistant);
    this.initOpenAI(configObj.authorization);
    let res: string;
    const run = await this.openai.beta.threads.createAndRun({
      assistant_id: configObj.assistantId,
      thread: {
        messages: [{ role: 'user', content: message }],
      },
    });

    res = await this.waitForResponse(run.thread_id, run.id);
    const response = await this.handleResponse(
      res,
      channel,
      instanceId,
      origin,
    );

    return {
      rundId: run.id,
      threadId: run.thread_id,
    };
  }

  async createMessage(
    assistant: Assistant,
    channel: string,
    instanceId: number,
    threadId: string,
    message: string,
    origin: string,
  ): Promise<any> {
    const configObj = this.getConfigObj(assistant);
    this.initOpenAI(configObj.authorization);
    let res: string;
    await this.openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });

    const run = await this.openai.beta.threads.runs.create(threadId, {
      assistant_id: configObj.assistantId,
    });

    res = await this.waitForResponse(run.thread_id, run.id);
    const response = await this.handleResponse(
      res,
      channel,
      instanceId,
      origin,
    );

    return {
      rundId: run.id,
      threadId: run.thread_id,
    };
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

  private async waitForResponse(
    threadId: string,
    runId: string,
  ): Promise<string> {
    const runStatus = await this.waitForRunCompletion(threadId, runId);
    if (runStatus == 'not_processed') {
      return 'Hay un problema al procesar su mensaje, intentelo nuevamente mas tarde';
    } else {
      const assistantResponse = await this.getAssistantResponse(threadId);
      return assistantResponse;
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

  private async waitForRunCompletion(
    threadId: string,
    runId: string,
  ): Promise<string> {
    let run;
    let factor = 1;
    do {
      run = await this.openai.beta.threads.runs.retrieve(threadId, runId);
      if (
        run.status === 'completed' ||
        run.status === 'cancelled' ||
        run.status === 'failed' ||
        run.status === 'expired' ||
        run.status === 'requires_action'
      ) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * factor));
      factor = factor * 1.2;
    } while (
      (run.status === 'queued' || run.status === 'in_progress') &&
      factor < 3
    );

    if (run.status === 'requires_action') {
      return 'function';
    }

    return run.status === 'cancelled' ||
      run.status === 'failed' ||
      run.status === 'expired' ||
      run.status === 'queued' ||
      run.status === 'in_progress'
      ? 'not_processed'
      : run.status;
  }

  private async handleResponse(
    response: string,
    channel: string,
    instanceId: number,
    origin: string,
  ): Promise<string> {
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
