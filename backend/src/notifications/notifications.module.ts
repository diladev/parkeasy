import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationSettingsService } from './notification-settings.service';
import { Notification } from './entities/notification.entity';
import { NotificationSettings } from './entities/notification-settings.entity';

@Module({
  imports: [SequelizeModule.forFeature([Notification, NotificationSettings])],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationSettingsService],
  exports: [NotificationsService, NotificationSettingsService],
})
export class NotificationsModule {}
