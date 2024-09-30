import { Column, Entity, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./permission.entity";
import { permission } from "process";
import { User } from "./user.entity";

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => Permission, permission => permission.roles, { eager: true })
    permissions: Permission[];

    @ManyToMany(() => User, user => user.roles)
    users: User[];
}