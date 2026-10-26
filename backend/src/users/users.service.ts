import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { randomBytes, randomInt } from 'crypto';

import { PaginationResult } from 'src/common/pagination/interfaces/pagination-result.interface';
import { ModelPagination } from 'src/common/pagination/model-pagination';
import { hashPassword, verifyPassword } from 'src/common/security/password';
import { TranslationService } from 'src/i18n/translation.service';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/users/entities/vehicle.entity';
import {
    ChangePasswordDto,
    CreateUserDto,
    CreateVehicleDto,
    EditUserDto,
    RegisterUserDto,
    UpdateVehicleDto,
} from 'src/users/dtos';

/**
 * Owns the `users` and `vehicles` tables: the profile, the vehicles, and the
 * credential columns (password, refresh-token hash, reset code) that AuthService
 * reads and writes through the methods at the bottom of this class.
 */
@Injectable()
export class UsersService {
    private readonly userPagination = new ModelPagination(User, '/users');

    constructor(
        @InjectModel(User) private readonly userModel: typeof User,
        @InjectModel(Vehicle) private readonly vehicleModel: typeof Vehicle,
        @InjectConnection() private readonly sequelize: Sequelize,
        private readonly translationService: TranslationService,
    ) { }

    private t(key: string, args?: Record<string, unknown>): string {
        return this.translationService.translate(`message.${key}`, { args });
    }

    // ---------------------------------------------------------------- lookups

    /** The user with this id, or a 404. */
    async findById(id: number): Promise<User> {
        const user = await this.userModel.findByPk(id);
        if (!user) {
            throw new NotFoundException(this.t('USER_NOT_FOUND'));
        }
        return user;
    }

    findByIdOrNull(id: number): Promise<User | null> {
        return this.userModel.findByPk(id);
    }

    findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ where: { email: email.trim().toLowerCase() } });
    }

    /**
     * Locks the user's row until the transaction ends (SELECT ... FOR UPDATE), so two
     * requests from the same user that must not overlap (e.g. two bookings sent
     * by a double tap) run one after the other.
     */
    async lockForUpdate(userId: number, transaction: Transaction): Promise<void> {
        await this.userModel.findByPk(userId, {
            attributes: ['id'],
            lock: Transaction.LOCK.UPDATE,
            transaction,
        });
    }

    /** For the future admin portal. Secrets are stripped by User.toJSON(). */
    findAllUsers(page: number, pageSize: number): Promise<PaginationResult<User>> {
        return this.userPagination.findAll(page, pageSize, { order: [['id', 'ASC']] });
    }

    // --------------------------------------------------------------- accounts

    /** Customer sign-up. The username isn't on the form, so it's generated from the email. */
    async register(dto: RegisterUserDto): Promise<User> {
        await this.assertEmailAvailable(dto.email);

        return this.userModel.create({
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            username: await this.generateUsername(dto.email),
            password: await hashPassword(dto.password),
        });
    }

    /** For the future admin portal, when an admin creates an account directly. */
    async createUser(dto: CreateUserDto): Promise<User> {
        await this.assertEmailAvailable(dto.email);

        const usernameTaken = await this.userModel.findOne({
            where: { username: dto.username },
            paranoid: false,
        });
        if (usernameTaken) {
            throw new ConflictException(this.t('USERNAME_TAKEN', { username: dto.username }));
        }

        return this.userModel.create({ ...dto, password: await hashPassword(dto.password) });
    }

    /**
     * When an admin adds a garage: links the garage owner who already has this
     * email, or opens an owner account for them. An account with another role is
     * never promoted silently, so a driver can't be turned into an owner by mistake.
     * The new account gets a random password nobody knows; the owner picks their
     * own with "Forgot password".
     */
    async findOrCreateGarageOwner(
        owner: { name: string; email: string; phone: string },
        transaction: Transaction,
    ): Promise<{ user: User; created: boolean }> {
        // paranoid: false, because the unique index also covers soft-deleted rows.
        const existing = await this.userModel.findOne({
            where: { email: owner.email },
            paranoid: false,
            transaction,
        });
        if (existing) {
            if (existing.role !== 'garage_owner' || existing.deletedAt) {
                throw new ConflictException(this.t('GARAGE_OWNER_NOT_ELIGIBLE', { email: owner.email }));
            }
            return { user: existing, created: false };
        }

        const user = await this.userModel.create(
            {
                name: owner.name,
                email: owner.email,
                phone: owner.phone,
                role: 'garage_owner',
                username: await this.generateUsername(owner.email),
                password: await hashPassword(randomBytes(32).toString('base64url')),
            },
            { transaction },
        );
        return { user, created: true };
    }

    async updateProfile(userId: number, dto: EditUserDto): Promise<{ message: string; user: User }> {
        const user = await this.findById(userId);

        if (dto.email && dto.email !== user.email) {
            await this.assertEmailAvailable(dto.email);
        }

        // Model#update skips undefined values, so fields that weren't sent stay as they are.
        await user.update(dto);

        return { message: this.t('PROFILE_UPDATED'), user };
    }

    async changePassword(userId: number, dto: ChangePasswordDto): Promise<{ message: string }> {
        const user = await this.findById(userId);

        if (!(await verifyPassword(dto.old_password, user.password))) {
            throw new BadRequestException(this.t('OLD_PASSWORD_INCORRECT'));
        }
        if (dto.old_password === dto.new_password) {
            throw new BadRequestException(this.t('NEW_PASSWORD_SAME_AS_OLD'));
        }

        await user.update({ password: await hashPassword(dto.new_password) });

        return { message: this.t('PASSWORD_CHANGED') };
    }

    /**
     * Deletes the account after checking the password.
     *
     * The row is soft-deleted (paranoid) so past bookings still point to it, but the
     * personal details are wiped first. Changing the email and username also frees
     * them: their unique indexes include soft-deleted rows, so otherwise the person
     * could never sign up again with the same email.
     */
    async deleteAccount(userId: number, password: string): Promise<{ message: string }> {
        const user = await this.findById(userId);

        if (!(await verifyPassword(password, user.password))) {
            throw new BadRequestException(this.t('PASSWORD_INCORRECT'));
        }

        const tag = `${user.id}_${Date.now()}`;
        await this.sequelize.transaction(async (transaction) => {
            await user.update(
                {
                    name: 'Deleted user',
                    email: `deleted_${tag}@deleted.invalid`,
                    username: `deleted_${tag}`,
                    phone: '',
                    date_of_birth: null,
                    refresh_token_hash: null,
                    otp_hash: null,
                    otp_expires_at: null,
                    otp_attempts: 0,
                    status: 'deleted',
                },
                { transaction },
            );
            await this.vehicleModel.destroy({ where: { user_id: user.id }, transaction });
            await user.destroy({ transaction });
        });

        return { message: this.t('ACCOUNT_DELETED') };
    }

    // --------------------------------------------------------------- vehicles

    /** The default vehicle first, then the rest in the order they were added. */
    getVehicles(userId: number): Promise<Vehicle[]> {
        return this.vehicleModel.findAll({
            where: { user_id: userId },
            order: [
                ['is_default', 'DESC'],
                ['createdAt', 'ASC'],
            ],
        });
    }

    /** One of the user's own vehicles, or a 404 (also for other users' vehicles). */
    async getVehicle(userId: number, vehicleId: number, transaction?: Transaction): Promise<Vehicle> {
        const vehicle = await this.vehicleModel.findOne({
            where: { id: vehicleId, user_id: userId },
            transaction,
        });
        if (!vehicle) {
            throw new NotFoundException(this.t('VEHICLE_NOT_FOUND'));
        }
        return vehicle;
    }

    /** The first vehicle a user adds becomes their default. */
    async addVehicle(userId: number, dto: CreateVehicleDto): Promise<{ message: string; vehicle: Vehicle }> {
        const vehicle = await this.sequelize.transaction(async (transaction) => {
            await this.assertPlateAvailable(userId, dto.license_plate, null, transaction);
            const count = await this.vehicleModel.count({ where: { user_id: userId }, transaction });

            return this.vehicleModel.create(
                { ...dto, user_id: userId, is_default: count === 0 },
                { transaction },
            );
        });

        return { message: this.t('VEHICLE_ADDED'), vehicle };
    }

    async updateVehicle(
        userId: number,
        vehicleId: number,
        dto: UpdateVehicleDto,
    ): Promise<{ message: string; vehicle: Vehicle }> {
        const vehicle = await this.getVehicle(userId, vehicleId);

        if (dto.license_plate && dto.license_plate !== vehicle.license_plate) {
            await this.assertPlateAvailable(userId, dto.license_plate, vehicle.id);
        }
        await vehicle.update(dto);

        return { message: this.t('VEHICLE_UPDATED'), vehicle };
    }

    /** If the default vehicle is deleted, the oldest remaining one becomes the default. */
    async deleteVehicle(userId: number, vehicleId: number): Promise<{ message: string }> {
        await this.sequelize.transaction(async (transaction) => {
            const vehicle = await this.getVehicle(userId, vehicleId, transaction);
            await vehicle.destroy({ transaction });

            if (vehicle.is_default) {
                const next = await this.vehicleModel.findOne({
                    where: { user_id: userId },
                    order: [['createdAt', 'ASC']],
                    transaction,
                });
                await next?.update({ is_default: true }, { transaction });
            }
        });

        return { message: this.t('VEHICLE_DELETED') };
    }

    async setDefaultVehicle(userId: number, vehicleId: number): Promise<{ message: string; vehicle: Vehicle }> {
        const vehicle = await this.sequelize.transaction(async (transaction) => {
            const vehicle = await this.getVehicle(userId, vehicleId, transaction);

            // Unset every OTHER vehicle. Unsetting all of them and then calling
            // vehicle.update({ is_default: true }) would do nothing when this one
            // was already the default (the instance still says true), leaving none.
            await this.vehicleModel.update(
                { is_default: false },
                { where: { user_id: userId, id: { [Op.ne]: vehicle.id } }, transaction },
            );
            return vehicle.update({ is_default: true }, { transaction });
        });

        return { message: this.t('DEFAULT_VEHICLE_SET'), vehicle };
    }

    // ------------------------------------------- credentials (used by AuthService)

    /** Saves a new password and signs the user out everywhere. */
    async setPassword(userId: number, password: string): Promise<void> {
        await this.userModel.update(
            {
                password: await hashPassword(password),
                refresh_token_hash: null,
                otp_hash: null,
                otp_expires_at: null,
                otp_attempts: 0,
            },
            { where: { id: userId } },
        );
    }

    /** Stores the hash of the current refresh token, or null to sign the user out. */
    async setRefreshTokenHash(userId: number, hash: string | null): Promise<void> {
        await this.userModel.update({ refresh_token_hash: hash }, { where: { id: userId } });
    }

    /** Stores the hash of a new password-reset code and resets the attempt counter. */
    async storeOtp(userId: number, otpHash: string, expiresAt: Date): Promise<void> {
        await this.userModel.update(
            { otp_hash: otpHash, otp_expires_at: expiresAt, otp_attempts: 0 },
            { where: { id: userId } },
        );
    }

    async clearOtp(userId: number): Promise<void> {
        await this.userModel.update(
            { otp_hash: null, otp_expires_at: null, otp_attempts: 0 },
            { where: { id: userId } },
        );
    }

    async incrementOtpAttempts(userId: number): Promise<void> {
        await this.userModel.increment('otp_attempts', { where: { id: userId } });
    }

    // ---------------------------------------------------------------- helpers

    private async assertEmailAvailable(email: string): Promise<void> {
        // paranoid: false, because the unique index also covers soft-deleted rows.
        const existing = await this.userModel.findOne({ where: { email }, paranoid: false });
        if (existing) {
            throw new ConflictException(this.t('EMAIL_TAKEN', { email }));
        }
    }

    /**
     * A user can't add the same plate twice. Different users may share a car
     * (e.g. a family), so plates are only unique per user, not globally.
     */
    private async assertPlateAvailable(
        userId: number,
        licensePlate: string,
        exceptVehicleId: number | null,
        transaction?: Transaction,
    ): Promise<void> {
        const existing = await this.vehicleModel.findOne({
            where: {
                user_id: userId,
                license_plate: licensePlate,
                ...(exceptVehicleId !== null && { id: { [Op.ne]: exceptVehicleId } }),
            },
            transaction,
        });
        if (existing) {
            throw new ConflictException(this.t('VEHICLE_PLATE_TAKEN', { license_plate: licensePlate }));
        }
    }

    /** "Dilan.K+test@mail.com" -> "dilan.ktest", with a random suffix if it's taken. */
    private async generateUsername(email: string): Promise<string> {
        const base = (email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.]/g, '') || 'user')
            .slice(0, 20)
            .padEnd(3, '0');

        let candidate = base;
        for (let attempt = 0; attempt < 5; attempt++) {
            const taken = await this.userModel.findOne({ where: { username: candidate }, paranoid: false });
            if (!taken) return candidate;
            candidate = `${base}${randomInt(1000, 10000)}`;
        }
        return `${base}${Date.now().toString(36)}`;
    }
}
