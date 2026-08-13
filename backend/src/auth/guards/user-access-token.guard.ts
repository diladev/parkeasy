import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class UserAccessTokenAuthGuard extends AuthGuard('user-access-token') { }