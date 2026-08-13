import { ExecutionContext, UnauthorizedException, createParamDecorator } from "@nestjs/common";

type UserDecoratorData = 'currentUser' | 'refreshToken' | undefined;

export const CurrentUser =createParamDecorator(
    (data: UserDecoratorData, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        if (data === 'currentUser') return request.currentUser;
        if (request.user) return request.user;
        throw new UnauthorizedException('Invalid Credentails.')
    },
);

export const RefreshDecorator = createParamDecorator(
    (data: UserDecoratorData, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        if (data === 'currentUser') return request.currentUser;
        if (data === 'refreshToken') {
            const refreshToken = request.user?.refreshToken;
            if (refreshToken) return refreshToken;
            throw new UnauthorizedException('Invalid refresh token.') 
        }

        return request.user;
    },
)