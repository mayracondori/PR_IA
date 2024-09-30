import { IsBoolean, IsEmail, IsString, ValidateIf } from "class-validator";
import { IsPasswordRequired } from "./custom-validator";

export class CreateUserDto {
    @IsString()
    readonly name: string;

    @IsEmail()
    readonly email: string;

    @IsBoolean()
    readonly isApiUser: boolean;

    @ValidateIf(o => !o.isApiUser)
    @IsString()
    @IsPasswordRequired()
    readonly password: string;
}