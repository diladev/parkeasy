import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/users/entities/vehicle.entity';
import { WhereOptions } from 'sequelize/lib/model';
import * as bcrypt from 'bcrypt';
import bcryptKeys from 'src/config/bcrypt-keys';
import { TranslationService } from 'src/i18n/translation.service';
import { PaginationResult } from 'src/common/pagination/interfaces/pagination-result.interface';
import { ModelPagination } from 'src/common/pagination/model-pagination';
import { CreateUserDto, EditUserDto, CreateVehicleDto, RegisterUserDto, ChangePasswordDto } from 'src/users/dtos';

@Injectable()
export class UsersService {
    private readonly userPagination: ModelPagination<User>;
    constructor(
        @InjectModel(User) private userModel: typeof User,
        @InjectModel(Vehicle) private vehicleModel: typeof Vehicle,
        private readonly translationService: TranslationService,
    ) {
        this.userPagination = new ModelPagination<User>(User);
    }


    async findOne(options: WhereOptions, lang: string):
        Promise<User> {
        const user = await this.userModel.findOne({ where: options });
        if (!user && 'username' in options) {
            throw new NotFoundException(
                this.translationService.translate(
                    'message.USER_WITH_USERNAME_NOT_FOUND',
                    {
                        lang: lang, args: { username: options.username }
                    }
                )
            );
        }
        if (!user) {
            throw new NotFoundException(
                this.translationService.translate(
                    'message.USER_NOT_FOUND',
                    {
                        lang: lang
                    }
                )
            );
        }
        return user;
    }

    async findUserByEmail(email: string):
        Promise<User | null> {
        return await this.userModel.findOne({ where: { email } });
    }

    async findAllUsers(page: number, pageSize: number): Promise<PaginationResult<User>> {
        const options = {
            attributes: { exclude: ['password', 'refreshToken',] },
        };

        return await this.userPagination.findAll(page, pageSize, options);
    }

    private async hashPassword(password: string): Promise<string> {
        const { salt_rounds, pepper_secret } = bcryptKeys();

        const pepperedPassword = password + pepper_secret;

        return await bcrypt.hash(
            pepperedPassword,
            salt_rounds
        );
    }

    async storeUser(userDetails: CreateUserDto, lang: string):
        Promise<{ message: string, user: User }> {
        const existing = await this.userModel.findOne({ where: { username: userDetails.username } });
        if (existing) {
            throw new ConflictException(
                this.translationService.translate(
                    'message.USER_WITH_USERNAME_ALREADY_EXISTS',
                    {
                        lang: lang, args: { username: userDetails.username }
                    }
                )
            );
        }

        const hashedPassword = await this.hashPassword(userDetails.password);
        userDetails.password = hashedPassword;
        const user = await this.userModel.create({
            ...userDetails,
            password: hashedPassword,
            refreshToken: null
        });
        return {
            message: this.translationService.translate(
                'message.USER_CREATED_SUCCESSFULLY',
                { lang: lang }),
            user
        };
    }

    async registerUser(userDetails: RegisterUserDto):
        Promise<{ message: string, user: User }> {
        const existing = await this.userModel.findOne({ where: { email: userDetails.email } });
        if (existing) {
            throw new ConflictException(
                this.translationService.translate(
                    'message.USER_WITH_EMAIL_ALREADY_EXISTS',
                    {
                        lang: userDetails.language, args: { email: userDetails.email }
                    }
                )
            );
        }

        const hashedPassword = await this.hashPassword(userDetails.password);

        userDetails.password = hashedPassword;

        const user = await this.userModel.create({
            ...userDetails,
            password: hashedPassword,
            refreshToken: null

        })

        return {
            message: this.translationService.translate(
                'message.USER_REGISTERED_SUCCESSFULLY',
                { lang: userDetails.language }),
            user
        };
    }

    async updateUserProfile(userId: number, newInfo: EditUserDto, lang: string):
        Promise<{ message: string, user: User }> {
        const user = await this.findOne({ id: userId }, lang);
        await user.update(newInfo);
        return {
            message: this.translationService.translate(
                'message.USER_PROFILE_UPDATED_SUCCESSFULLY',
                { lang: lang }),
            user
        };
    }

    async updateUserPassword(userId: number, userPasswords: ChangePasswordDto, lang: string):
        Promise<{ message: string, user: User }> {
        const user = await this.findOne({ id: userId }, lang);
        const isOldPasswordValid = await bcrypt.compare(
            userPasswords.old_password + bcryptKeys().pepper_secret,
            user.password
        );
        if (!isOldPasswordValid) {
            throw new BadRequestException(
                this.translationService.translate(
                    'message.OLD_PASSWORD_INCORRECT',
                    { lang: lang }
                )
            );
        }
        
        const hashedPassword = await this.hashPassword(userPasswords.new_password);

        await user.update({ password: hashedPassword });
        return {
            message: this.translationService.translate(
                'message.USER_PASSWORD_UPDATED_SUCCESSFULLY',
                { lang: lang }),
            user
        };
    }

    async updateRefreshToken(userId: number, refreshToken: string | null, lang: string):
        Promise<User> {
        const user = await this.findOne({ id: userId }, lang);
        await user.update({ refresh_token: refreshToken });
        return user;
    }

    async storeOtp(email: string, otp: string, expiresAt: Date, lang: string):
        Promise<void> {
        const user = await this.findUserByEmail(email);
        if (!user) {
            throw new NotFoundException(
                this.translationService.translate(
                    'message.USER_WITH_EMAIL_NOT_FOUND',
                    {
                        lang: lang, args: { email: email }
                    }
                )
            );
        }
        await user.update({ otp, otp_expires_at: expiresAt });
    }

    async clearOtp(userId: number, lang: string): Promise<void> {
        const user = await this.findOne({ id: userId }, lang);
        await user.update({ otp: null, otp_expires_at: null });
    }

    async deleteUser(userId: number, lang: string): Promise<{ message: string }> {
        const user = await this.findOne({ id: userId }, lang);
        const { username } = user;
        await user.destroy();
        return {
            message: this.translationService.translate(
                'message.USER_DELETED_SUCCESSFULLY',
                { args: { username }, lang: lang }),
        };
    }

    async addVehicleToUser(userId: number, vehicle: CreateVehicleDto, lang: string):
        Promise<{ message: string }> {
        const existingVehicle = await this.userModel.findOne({
            where: {
                license_plate: vehicle.license_plate
            }
        });
        if (existingVehicle) {
            throw new ConflictException(
                this.translationService.translate(
                    'message.VEHICLE_WITH_LICENSE_PLATE_ALREADY_EXISTS',
                    {
                        lang: lang, args: { license_plate: vehicle.license_plate }
                    }
                )
            );
        }

        const count = await this.vehicleModel.count({ where: { userId } });
        await this.vehicleModel.create({
            ...vehicle,
            userId: userId,
            is_default: count === 0
        });
        return {
            message: this.translationService.translate(
                'message.VEHICLE_ADDED_SUCCESSFULLY',
                { lang: lang }),
        };
    }

    async getUserVehicles(userId: number, lang: string): Promise<Vehicle[]> {
        const user = await this.findOne({ id: userId }, lang);
        return await this.vehicleModel.findAll({ where: { userId: user.id } });
    }

    async deleteVehicle(userId: number, vehicleId: number, lang: string): Promise<{ message: string }> {
        const user = await this.findOne({ id: userId }, lang);
        const vehicle = await this.vehicleModel.findOne({ where: { id: vehicleId, userId: user.id } });
        if (!vehicle) {
            throw new NotFoundException(
                this.translationService.translate(
                    'message.VEHICLE_NOT_FOUND_FOR_USER',
                    {
                        lang: lang, args: { vehicleId: vehicleId }
                    }
                )
            );
        }
        await vehicle.destroy();
        return {
            message: this.translationService.translate(
                'message.VEHICLE_DELETED_SUCCESSFULLY',
                { lang: lang }),
        };
    }

    async setDefaultVehicle(userId: number, vehicleId: number, lang: string): Promise<{ message: string }> {
        const user = await this.findOne({ id: userId }, lang);
        const vehicle = await this.vehicleModel.findOne({ where: { id: vehicleId, userId: user.id } });
        if (!vehicle) {
            throw new NotFoundException(
                this.translationService.translate(
                    'message.VEHICLE_NOT_FOUND_FOR_USER',
                    {
                        lang: lang, args: { vehicleId: vehicleId }
                    }
                )
            );
        }
        await this.vehicleModel.update({ is_default: false }, { where: { userId: user.id } });
        await vehicle.update({ is_default: true }, { where: { id: vehicle.id } });
        return {
            message: this.translationService.translate(
                'message.VEHICLE_DEFAULT_SET_SUCCESSFULLY',
                { lang: lang }),
        };
    }
}
