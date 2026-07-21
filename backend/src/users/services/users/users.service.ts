import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../entities/user.entitiy';
import { WhereOptions } from 'sequelize/lib/model';
import * as bcrypt from 'bcrypt';
import bcryptKeys from 'src/common/bcryptkeys';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User) private userModel: typeof User,
    ) { }

    async findOne(options: WhereOptions): Promise<User> {
        const user = await this.userModel.findOne({ where: options });
        if (!user && 'username' in options) {
            throw new NotFoundException(`User with username ${options['username']} not found`);
        }
        if (!user) {
            throw new NotFoundException(`User Not Found`);
        }
        return user;
    }

    async storeUser(userDetails: CreateUserDto) {
        const existing = await this.userModel.findOne({ where: { username: userDetails.username } });
        if (existing) {
            throw new Error(`User with username ${userDetails.username} already exists`);
        }

        const salt = bcrypt.genSaltSync(bcryptKeys().saltRounds);
        const pepperedPassword = userDetails.password + bcryptKeys().pepper_secret;
        const hashedPassword = await bcrypt.hash(pepperedPassword + salt, bcryptKeys().saltRounds);
        userDetails.password = hashedPassword;
        const user = await this.userModel.create({ ...userDetails, refreshToken: null });
        return { message: `User with username ${userDetails.username} created successfully`, user };
    }
}
