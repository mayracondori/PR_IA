import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Instance } from "./instance.entity";
import { Message } from "./message.entity";
import { Assistant } from "./assistant.entity";

@Entity()
export class Thread {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    externalInstance: string;

    @Column({type: 'varchar',  nullable: true})
    externalId?: string;

    @Column()
    expirationDate: Date;

    @Column()
    instanceId: number;

    @ManyToOne(() => Instance, instance => instance.threads)
    @JoinColumn({ name: 'instanceId'})
    instance: Instance;

    @OneToMany(() => Message, message => message.thread)
    messages: Message[];

    @ManyToMany(() => Assistant, assistant => assistant.threads)
    assistants: Assistant[];
}