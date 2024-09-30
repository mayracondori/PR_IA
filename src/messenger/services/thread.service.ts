import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Thread } from "../entities/thread.entity";
import { MoreThan, Repository } from "typeorm";
import { Instance } from "../entities/instance.entity";

@Injectable()
export class ThreadService {
    constructor(
        @InjectRepository(Thread)
        private readonly threadRepository: Repository<Thread>
    ) {}

    async findOrCreateThread(instance: Instance, externalInstance: string): Promise<any> {
        const now = new Date();

        let isNewThread = true;
        let thread = await this.threadRepository.findOne({ where: {
            instanceId: instance.id,
            externalInstance,
            expirationDate: MoreThan(now),
        }});

        if (thread) {
            thread.expirationDate = new Date(now.getTime() + 30 * 60000);
            await this.threadRepository.save(thread);
            isNewThread = false;
        } else {
            thread = this.threadRepository.create({
                instance,
                externalInstance,
                expirationDate: new Date(now.getTime() + 30 * 60000)
            });
            await this.threadRepository.save(thread);
        }
        return { isNewThread, thread }
        
    }
}