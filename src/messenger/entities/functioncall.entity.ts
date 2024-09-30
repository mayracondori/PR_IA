import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Function } from "./function.entity";

@Entity()
export class FunctionCall {
    @PrimaryGeneratedColumn()
    id:number;

    @Column('text')
    params: string;

    @Column('text')
    response: string;

    @ManyToOne(() => Function, func => func.functionCalls)
    function: Function;

    @Column()
    functionId: number;
}