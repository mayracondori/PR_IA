import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { CreateUserDto } from "../dto/create-user.dto";
import { UserService } from "../service/user.service";
import { Permissions } from "../decorators/permissions.decorator";
import { PermissionsGuard } from "../guards/permissions.guard";
import { Request } from "express";



@Controller('user')
@UseGuards(PermissionsGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}
    
    @Post()
    @Permissions('createUser')
    createUser(@Body() createUserDto: CreateUserDto): Promise<any> {
        return this.userService.create(createUserDto);
    }

    @Post('refresh-token')
    @Permissions('refreshToken')
    refreshToken(@Req() request: Request): Promise<any> {
        return this.userService.generateRefreshToken(request);
    }

    @Post('access-token')
    @Permissions('accessToken')
    accessToken(@Req() request: Request): Promise<any> {
        return this.userService.generateAccessToken(request);
    }
}