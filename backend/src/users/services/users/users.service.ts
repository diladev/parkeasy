import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../entities/user.entitiy';
import { WhereOptions } from 'sequelize/lib/model';
import * as bcrypt from 'bcrypt';
import bcryptKeys from 'src/common/bcryptkeys';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { TranslationService } from 'src/i18n/translation.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User) private userModel: typeof User,
        private readonly translationService: TranslationService,
    ) { }
    

    async findOne(options: WhereOptions): Promise<User> {
        const user = await this.userModel.findOne({ where: options });
        if (!user && 'username' in options) {
            throw new NotFoundException('message.UserWithUsernameNotFound');
        }
        if (!user) {
            throw new NotFoundException('message.UserNotFound');
        }
        return user;
    }

    async storeUser(userDetails: CreateUserDto) {
        const existing = await this.userModel.findOne({ where: { username: userDetails.username } });
        if (existing) {
            throw new Error('message.UserWithUsernameAlreadyExists');
        }

        const salt = bcrypt.genSaltSync(bcryptKeys().saltRounds);
        const pepperedPassword = userDetails.password + bcryptKeys().pepper_secret;
        const hashedPassword = await bcrypt.hash(pepperedPassword + salt, bcryptKeys().saltRounds);
        userDetails.password = hashedPassword;
        const user = await this.userModel.create({ ...userDetails, refreshToken: null });
        return { message: this.translationService.translate('message.UserCreatedSuccessfully'), user };
    }
}
