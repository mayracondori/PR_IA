import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true})
    email: string;

    @Column({ nullable: true, select: false})
    password: string;

    @Column({ default: false})
    isApiUser: boolean;

    @Column({ default: true})
    active: boolean;

    @Column({ nullable: true, select: false})
    apiKeyExpiration?: Date;

    @Column({ nullable: true, select: false})
    apiKeyLastDigits?: string;

    @ManyToMany(() => Role, role => role.users)
    @JoinTable()
    roles: Role[];


}