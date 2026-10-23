import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import {
    NOTIFICATION_SETTINGS,
    NotificationSettingKey,
    NotificationSettings,
} from './entities/notification-settings.entity';

/** What the app receives: every switch, and which ones ParkEasy acts on yet. */
export interface NotificationSettingsView {
    settings: Record<NotificationSettingKey, boolean>;
    available: NotificationSettingKey[];
}

const KEYS = Object.keys(NOTIFICATION_SETTINGS) as NotificationSettingKey[];

@Injectable()
export class NotificationSettingsService {
    constructor(
        @InjectModel(NotificationSettings) private readonly settingsModel: typeof NotificationSettings,
    ) { }

    async get(userId: number): Promise<NotificationSettingsView> {
        return NotificationSettingsService.present(await this.findOrCreate(userId));
    }

    async update(userId: number, dto: UpdateNotificationSettingsDto): Promise<NotificationSettingsView> {
        const settings = await this.findOrCreate(userId);
        // Only the switches that were sent.
        const changes = Object.fromEntries(KEYS.filter((key) => dto[key] !== undefined).map((key) => [key, dto[key]]));
        await settings.update(changes);
        return NotificationSettingsService.present(settings);
    }

    /** Whether the user wants [key]; a user who never opened the screen gets the default. */
    async isEnabled(userId: number, key: NotificationSettingKey): Promise<boolean> {
        const settings = await this.settingsModel.findOne({ where: { user_id: userId } });
        return settings ? settings[key] : NOTIFICATION_SETTINGS[key].default;
    }

    private async findOrCreate(userId: number): Promise<NotificationSettings> {
        const [settings] = await this.settingsModel.findOrCreate({
            where: { user_id: userId },
            defaults: { user_id: userId },
        });
        return settings;
    }

    private static present(settings: NotificationSettings): NotificationSettingsView {
        return {
            // MariaDB returns booleans as 1/0.
            settings: Object.fromEntries(KEYS.map((key) => [key, Boolean(settings[key])])) as Record<
                NotificationSettingKey,
                boolean
            >,
            available: KEYS.filter((key) => NOTIFICATION_SETTINGS[key].available),
        };
    }
}
