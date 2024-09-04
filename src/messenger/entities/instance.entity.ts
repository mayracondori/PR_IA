import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { channel } from "diagnostics_channel";

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

}