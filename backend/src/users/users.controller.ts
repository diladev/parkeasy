import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { UserAccessTokenAuthGuard } from 'src/auth/guards/user-access-token.guard';
import type { AuthenticatedUser } from 'src/auth/types/auth.types';
import { ParseIdPipe } from 'src/common/pipes/parse-id.pipe';
import { UsersService } from 'src/users/users.service';
import {
  ChangePasswordDto,
  CreateVehicleDto,
  DeleteAccountDto,
  EditUserDto,
  UpdateVehicleDto,
} from 'src/users/dtos';

/** Everything here belongs to the signed-in user: their profile and their vehicles. */
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(UserAccessTokenAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ---------------------------------------------------------------- profile

  @Get('profile')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findById(user.id);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: EditUserDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Delete('profile')
  @HttpCode(200)
  deleteAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: DeleteAccountDto,
  ) {
    return this.usersService.deleteAccount(user.id, dto.password);
  }

  @Patch('change-password')
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.id, dto);
  }

  // --------------------------------------------------------------- vehicles

  @Get('vehicles')
  getVehicles(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getVehicles(user.id);
  }

  @Post('vehicles')
  addVehicle(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.usersService.addVehicle(user.id, dto);
  }

  @Patch('vehicles/:vehicleId')
  updateVehicle(
    @CurrentUser() user: AuthenticatedUser,
    @Param('vehicleId', ParseIdPipe) vehicleId: number,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.usersService.updateVehicle(user.id, vehicleId, dto);
  }

  @Delete('vehicles/:vehicleId')
  removeVehicle(
    @CurrentUser() user: AuthenticatedUser,
    @Param('vehicleId', ParseIdPipe) vehicleId: number,
  ) {
    return this.usersService.deleteVehicle(user.id, vehicleId);
  }

  @Patch('vehicles/:vehicleId/default')
  setDefaultVehicle(
    @CurrentUser() user: AuthenticatedUser,
    @Param('vehicleId', ParseIdPipe) vehicleId: number,
  ) {
    return this.usersService.setDefaultVehicle(user.id, vehicleId);
  }
}
