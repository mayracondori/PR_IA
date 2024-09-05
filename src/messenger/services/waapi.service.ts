import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Instance } from "../entities/instance.entity";
import { Repository } from "typeorm";
import axios from "axios";

@Injectable()
export class WaapiService {
    constructor(
        @InjectRepository(Instance) private readonly instanceRepository: Repository<Instance>,
    ){}

    async execute(config: any, taskPayload:any): Promise<void> {
        if (taskPayload.type === 'out') {
            await this.handleOutgoingMessage(config, taskPayload);
        } else {
            throw new Error(`not implemented yet`);
        }
    }

    async handleOutgoingMessage(config: any, taskPayload:any): Promise<void> {
        const instance = await this.instanceRepository.findOne({ where: { id: taskPayload.instance }});
        if (!instance) {
            throw new Error(`Instance ID: ${taskPayload.instance} not found`)
        }
        console.log('CONFIG!!!!!1', config, config.sendUrl, config.apiKey);
        const response = await this.sendMessage(config, instance.externalId, taskPayload.toFrom, taskPayload.payload);
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