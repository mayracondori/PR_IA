import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Assistant } from "../entities/assistant.entity";
import { Repository } from "typeorm";
import { InstanceAssistant } from "../entities/instance-assistant.entity";

@Injectable()
export class AssistantService {
    constructor(
        @InjectRepository(Assistant) private readonly assistantRepository: Repository<Assistant>,
        @InjectRepository(InstanceAssistant) private readonly instanceAssistantRepository: Repository<InstanceAssistant>,

    ){}

    async getAssistant(instanceId: number): Promise<Assistant | undefined> {
        let assistant = await this.getDefaultAssistant(instanceId);
        if (!assistant) {
            //If there is no default assistant we can look for other assistant
            console.log('NO EXISTE ASISTENTE POR DEFECTO');
        }
        return assistant;
    }

    async getDefaultAssistant(instanceId: number): Promise<Assistant | undefined> {
        const instanceAssistant = await this.instanceAssistantRepository.findOne({
            where: { instanceId, isDefault: true },
            relations: ['assistant']
        });

        console.log('instanceAssistant:', instanceAssistant);

        return instanceAssistant ? instanceAssistant.assistant : undefined;
    }
}