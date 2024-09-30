import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Thread } from "../entities/thread.entity";
import { MoreThan, Repository } from "typeorm";
import { Instance } from "../entities/instance.entity";
import { Message } from "../entities/message.entity";

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>
    ) {}

    async createMessage(thread: Thread, message: string, queueId: string, type: string, refId?: string): Promise<any> {
        const messageObj = this.messageRepository.create({
            thread,
            message,
            dateCreated: new Date(),
            status: 'done',
            queueId,
            type,
            refId,
        });
        await this.messageRepository.save(messageObj);
        return messageObj;
        
    }
}