import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Instance } from "./instance.entity";
import { Assistant } from "./assistant.entity";

@Entity()
export class InstanceAssistant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    isDefault: boolean;

    @ManyToOne(() => Instance, instance => instance.instanceAssistants)
    @JoinColumn({ name: 'instanceId'})
    instance: Instance;

    @ManyToOne(() => Assistant, assistant => assistant.instanceAssistants)
    @JoinColumn({ name: 'assistantId'})
    assistant: Assistant;

    @Column()
    assistantId: number;

    @Column()
    instanceId: number;


}