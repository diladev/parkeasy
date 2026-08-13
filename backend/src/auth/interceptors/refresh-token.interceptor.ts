import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    UnauthorizedException
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { TranslationService } from 'src/i18n/translation.service';

import { UsersService } from 'src/users/users.service'

@Injectable()
export class RefreshInterceptor implements NestInterceptor {
    constructor(
        private readonly usersService: UsersService,
        private readonly translationService: TranslationService
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.sub;

        if (userId) {
            const user = await this.usersService.findOne({ id: userId }, request.lang);
            if (user.status === 'inactive') throw new UnauthorizedException(
                this.translationService.translate(
                    'message.USER_INACTIVE',
                    { lang: request.lang }
                )
            );
            request.currentUser = user;
        }
        return next.handle();
    }
}