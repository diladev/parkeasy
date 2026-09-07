import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { title } from 'process';
import { TranslationService } from 'src/i18n/translation.service';
import { ModelPagination } from 'src/common/pagination/model-pagination';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly pagination: ModelPagination<Notification>;

  constructor(
    @InjectModel(Notification) private readonly notificationModel: typeof Notification,
    private readonly translationService: TranslationService,
  ) {
    this.pagination = new ModelPagination<Notification>(Notification);
  }

  async create(userId: number, title: string, body: string, type: string): Promise<Notification> {
    const notification = await this.notificationModel.create({
      userId,
      title,
      body,
      type,
    });
    return notification;
  }

  async getUserNotifications(userId: number, type?: string, page: number = 1, pageSize: number = 10) {
    const options = {
      where: { userId, type },
      order: [['createdAt', 'DESC']],
    };
    return this.pagination.findAll(page, pageSize, options as any);
  }

  async markAsRead(notificationId: number, lang: string) {
    const notification = await this.notificationModel.findByPk(notificationId);
    if (!notification) {
      throw new Error(this.translationService.translate('message.NOTIFICATION_NOT_FOUND', { lang: lang }));
    }
    notification.is_read = true;
    await notification.save();
    return { message: this.translationService.translate('message.NOTIFICATION_MARKED_AS_READ', { lang: lang }) }
  }

  async markAllAsRead(userId: number, lang: string) {
    const [updatedCount] = await this.notificationModel.update(
      { is_read: true },
      { where: { userId, is_read: false } }
    );
    return { message: this.translationService.translate('message.NOTIFICATIONS_MARKED_AS_READ', { lang: lang, args: { updatedCount } }) };
  }

}
