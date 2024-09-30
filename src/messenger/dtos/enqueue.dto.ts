import { IsIn, IsInt, isInt, IsNotEmpty, IsString } from "class-validator";

export class EnqueueDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(['in', 'out'])
    type: string;

    @IsString()
    @IsNotEmpty()
    channel: string;

    @IsString()
    @IsNotEmpty()
    instance: number;
}