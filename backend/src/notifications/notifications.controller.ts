import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from 'src/notifications/notifications.service'
import { UserAccessTokenAuthGuard } from 'src/auth/guards/user-access-token.guard'

@ApiTags('Notifications')
@UsePipes(ValidationPipe)
@UseGuards(UserAccessTokenAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get()
  async getAll(
    @Req() req: any,
    @Query('type') type?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number = 20,
  ) {
    return this.notificationsService.getUserNotifications(
      req.user.id,
      type,
      page,
      pageSize,
    );
  }

  @Patch('mark-all-read')
  async markAllRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id, req.user.lang);
  }

  @Patch(':id/read')
  async markOneRead(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.markAsRead(req.user.id, req.user.lang);
  }
}
