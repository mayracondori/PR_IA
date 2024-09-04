import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Instance } from "./instance.entity";

@Entity()
export class Channel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()//waapi, web, whatsapp
    code: string;

    @Column()//service to call on a new message
    service: string;

    @Column()//config for channel actions
    config: string;

    @Column()//number of minutes to expire the conversation
    expiresIn: number;

    @Column()
    name: string;

    @OneToMany(()=> Instance, instance => instance.channel)
    instances: Instance[]


}