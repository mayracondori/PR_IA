import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Instance } from "./instance.entity";
import { Thread } from "./thread.entity";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @Column()
    dateCreated: Date;

    @Column()
    status: string;

    @Column()
    queueId: string;

    @Column()
    type: string;//incoming, outgoing

    @Column({ nullable: true })
    refId?: string;

    @Column()
    threadId: number;

    @ManyToOne(() => Thread, thread => thread.messages)
    @JoinColumn({ name: 'threadId'})
    thread: Thread;
}