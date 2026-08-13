import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class UserRefreshTokenAuthGuard extends AuthGuard('user-refresh-token') { }