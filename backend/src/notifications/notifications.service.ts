import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';

import { PaginationResult } from 'src/common/pagination/interfaces/pagination-result.interface';
import { ModelPagination } from 'src/common/pagination/model-pagination';
import { TranslationService } from 'src/i18n/translation.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import {
  Notification,
  NotificationData,
  NotificationEvent,
  NOTIFICATION_EVENTS,
} from './entities/notification.entity';

/** A notification as the app receives it: with the title and body in the request language. */
export interface NotificationView {
  id: number;
  type: string;
  event: string;
  title: string;
  body: string;
  data: NotificationData;
  is_read: boolean;
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  private readonly pagination = new ModelPagination(
    Notification,
    '/notifications',
  );

  constructor(
    @InjectModel(Notification)
    private readonly notificationModel: typeof Notification,
    private readonly translationService: TranslationService,
  ) {}

  private t(key: string): string {
    return this.translationService.translate(`message.${key}`);
  }

  /**
   * Records an event for a user. Pass the caller's transaction so the
   * notification is only saved if the booking/payment it describes is.
   */
  async notify(
    userId: number,
    event: NotificationEvent,
    data: NotificationData = {},
    transaction?: Transaction,
  ): Promise<void> {
    await this.notificationModel.create(
      { user_id: userId, type: NOTIFICATION_EVENTS[event], event, data },
      { transaction },
    );
  }

  async getUserNotifications(
    userId: number,
    query: NotificationQueryDto,
  ): Promise<PaginationResult<NotificationView>> {
    const result = await this.pagination.findAll(query.page, query.pageSize, {
      // Only add the filter when it's set: `type: undefined` makes Sequelize throw.
      where: { user_id: userId, ...(query.type && { type: query.type }) },
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    });
    return {
      ...result,
      data: result.data.map((notification) => this.present(notification)),
    };
  }

  async countUnread(userId: number): Promise<{ count: number }> {
    const count = await this.notificationModel.count({
      where: { user_id: userId, is_read: false },
    });
    return { count };
  }

  async markAsRead(
    userId: number,
    notificationId: number,
  ): Promise<{ message: string }> {
    // user_id in the query: users can only touch their own notifications.
    const notification = await this.notificationModel.findOne({
      where: { id: notificationId, user_id: userId },
    });
    if (!notification) {
      throw new NotFoundException(this.t('NOTIFICATION_NOT_FOUND'));
    }

    if (!notification.is_read) {
      await notification.update({ is_read: true });
    }
    return { message: this.t('NOTIFICATION_MARKED_AS_READ') };
  }

  async markAllAsRead(userId: number): Promise<{ message: string }> {
    await this.notificationModel.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } },
    );
    return { message: this.t('NOTIFICATIONS_MARKED_AS_READ') };
  }

  private present(notification: Notification): NotificationView {
    const args = notification.data ?? {};
    const translate = (part: 'TITLE' | 'BODY') =>
      this.translationService.translate(
        `notification.${notification.event}.${part}`,
        { args },
      );

    return {
      id: notification.id,
      type: notification.type,
      event: notification.event,
      title: translate('TITLE'),
      body: translate('BODY'),
      data: args,
      is_read: notification.is_read,
      createdAt: notification.createdAt as Date,
    };
  }
}
