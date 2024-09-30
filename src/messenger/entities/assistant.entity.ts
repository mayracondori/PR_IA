import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Thread } from "./thread.entity";
import { InstanceAssistant } from "./instance-assistant.entity";
import { Function } from "./function.entity";

@Entity()
export class Assistant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    active: boolean;

    @Column()
    type: string;

    @Column()
    isAutomatic: boolean;

    @Column({type: 'text',  nullable: true})//config for channel actions
    config: string;

    @ManyToMany(() => Thread, thread => thread.assistants)
    @JoinTable()
    threads: Thread[];

    @OneToMany(()=> InstanceAssistant, instanceAssistant => instanceAssistant.assistant)
    instanceAssistants: InstanceAssistant[];

    @OneToMany(() => Function, func => func.assistant)
    functions: Function[];
}