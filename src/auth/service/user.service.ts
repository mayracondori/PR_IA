import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { CreateUserDto } from "../dto/create-user.dto"; 
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) {}


    async generateRefreshToken(request: any): Promise<any> {
        const id = request.userId;
        const user = await this.findOne(id);

        if (user.isApiUser) {
            const payload = { email: user.email, sub: user.id };
            const refreshToken = this.jwtService.sign(payload, { expiresIn: '48h' });
            const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });
            return {refreshToken, accessToken };
        } else {
            throw new BadRequestException('Generate Refresh Token is only allowed for API users.');
        }
    }

    async generateAccessToken(request: any): Promise<any> {
        const id = request.userId;
        const user = await this.findOne(id);

        if (user.isApiUser) {
            const payload = { email: user.email, sub: user.id };
            const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });
            return { accessToken };
        } else {
            throw new BadRequestException('Generate Refresh Token is only allowed for API users.');
        }
        
        
    }

    async create(createUserDto: CreateUserDto): Promise<any> {
        let user = this.userRepository.create(createUserDto);
        if (user.isApiUser) {
            user = await this.userRepository.save(user);
            const payload = { email: user.email, sub: user.id };
            const apiKey = this.jwtService.sign(payload, { expiresIn: '10y' });

            const currentDate = new Date();

            currentDate.setFullYear(currentDate.getFullYear() + 10);
            user.apiKeyExpiration = currentDate;
            user.apiKeyLastDigits = apiKey.slice(-7);
            user = await this.userRepository.save(user);
            return { apiKey, ...user };

        } else {
            return this.userRepository.save(user);
        }
        
        
    }

    async findOne(id:number):Promise<User> {
        const user = await this.userRepository.findOne({ where: { id }, relations: ['roles']});
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
}