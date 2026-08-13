import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { UserAccessTokenAuthGuard } from 'src/auth/guards/user-access-token.guard';
import { EditUserDto, ChangePasswordDto, CreateVehicleDto } from 'src/users/dtos';

@ApiTags('Users')
@UsePipes(ValidationPipe)
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @UseGuards(UserAccessTokenAuthGuard)
    @Get('profile')
    async getProfile(@Req() req: any) {
        return this.userService.findOne({ where: { id: req.user.id } }, req.user.lang);
    }

    @UseGuards(UserAccessTokenAuthGuard)
    @Patch('profile')
    async updateProfile(@Req() req: any, @Body() dto: EditUserDto) {
        return this.userService.updateUserProfile(req.user.id, dto, req.user.lang);
    }

    @UseGuards(UserAccessTokenAuthGuard)
    @Patch('change-password')
    async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
        return this.userService.updateUserPassword(req.user.id, dto, req.user.lang);
    }
    
    @UseGuards(UserAccessTokenAuthGuard)
    @Post('vehicles')
    async addVehicle(@Req() req: any, @Body() dto: CreateVehicleDto) {
        return this.userService.addVehicleToUser(req.user.id, dto, req.user.lang);
    }

    @UseGuards(UserAccessTokenAuthGuard)
    @Get('vehicles')
    async getVehicles(@Req() req: any) {
        return this.userService.getUserVehicles(req.user.id, req.user.lang);
    }

    @UseGuards(UserAccessTokenAuthGuard)
    @Delete('vehicles/:vehicleId')
    async removeVehicle(@Req() req: any, @Param('vehicleId', ParseIntPipe) vehicleId: number) {
        return this.userService.deleteVehicle(req.user.id, vehicleId, req.user.lang);
    }

    @UseGuards(UserAccessTokenAuthGuard)
    @Patch('vehicles/:vehicleId/default')
    async updateVehicle(@Req() req: any, @Param('vehicleId', ParseIntPipe) vehicleId: number) {
        return this.userService.setDefaultVehicle(req.user.id, vehicleId, req.user.lang);
    }
}
