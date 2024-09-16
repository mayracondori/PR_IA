import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { channel } from "diagnostics_channel";
import { Thread } from "./thread.entity";
import { InstanceAssistant } from "./instance-assistant.entity";

@Entity()
export class Instance {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()//phone number if exists
    number: string;

    @Column()
    externalId: string;

    @ManyToOne(() => Channel, channel => channel.instances)
    @JoinColumn({ name: 'channelId'})
    channel: Channel;

    @Column()
    channelId: number;

    @OneToMany(() => Thread, thread => thread.instance)
    threads: Thread[];

    @OneToMany(()=> InstanceAssistant, instanceAssistant => instanceAssistant.instance)
    instanceAssistants: InstanceAssistant[];
}