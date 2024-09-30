import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserService } from "../service/user.service";
import { JwtService } from "@nestjs/jwt";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { Role } from "../entities/role.entity";


@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('Authorization header not found');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw new UnauthorizedException('Token not found');
            
        }
        try {
            const decoded = this.jwtService.verify(token);
            const user = await this.userService.findOne(decoded.sub);
            request.userId = user.id;
            const permissions = this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler());

            return this.matchPermissions(permissions, user.roles);
        } catch (e) {
            throw new UnauthorizedException('Invalid Token');
        }
        
    }

    private matchPermissions(requiredPermissions: string[], userRoles: Role[]): boolean {
        for ( const role of userRoles) {
            if (role.name === 'admin') {
                return true;
            }
            for (const permission of role.permissions) {
                if (requiredPermissions.includes(permission.name)) {
                    return true;
                }
            }    
        }

        return false;
    }
}