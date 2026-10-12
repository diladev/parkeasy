import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { UserAccessTokenAuthGuard } from 'src/auth/guards/user-access-token.guard';
import type { AuthenticatedUser } from 'src/auth/types/auth.types';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { TopUpDto } from './dto/top-up-dto';
import { WalletService } from './wallet.service';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(UserAccessTokenAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  @Get()
  getWallet(@CurrentUser() user: AuthenticatedUser) {
    return this.walletService.getWallet(user.id);
  }

  @Post('topup')
  topUp(@CurrentUser() user: AuthenticatedUser, @Body() dto: TopUpDto) {
    return this.walletService.topUp(user.id, dto.amount);
  }

  @Get('transactions')
  getTransactions(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.walletService.getTransactions(user.id, query);
  }
}
