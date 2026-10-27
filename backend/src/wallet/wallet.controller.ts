import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { UserAccessTokenAuthGuard } from 'src/auth/guards/user-access-token.guard';
import type { AuthenticatedUser } from 'src/auth/types/auth.types';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { WalletService } from './wallet.service';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(UserAccessTokenAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWallet(@CurrentUser() user: AuthenticatedUser) {
    return this.walletService.getWallet(user.id);
  }

  @Get('transactions')
  getTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.walletService.getTransactions(user.id, query);
  }
}
