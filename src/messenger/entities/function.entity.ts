import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Assistant } from "./assistant.entity";
import { FunctionCall } from "./functioncall.entity";

@Entity()
export class Function {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    name: string;

    @Column()
    url: string;

    @Column({ nullable: true, type: 'text' })
    params?: string;

    @Column({ nullable: true, type: 'text' })
    headers?: string;

    @Column()
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';

    @Column()
    responseType: 'xml' | 'json';

    @Column({ nullable: true, type: 'text' })
    templateSource?: string;

    @ManyToOne(() => Assistant, assistant => assistant.functions)
    assistant: Assistant;

    @OneToMany(() => FunctionCall, functionCall => functionCall.function)
    functionCalls: FunctionCall[];

    @Column()
    assistantId: number;

    @Column({default: false})
    sendBodyParams: boolean;

}