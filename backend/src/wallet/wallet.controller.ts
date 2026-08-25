import { Controller, Get, Req, UseGuards, UsePipes, ValidationPipe, Headers, Post, Body, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { UserAccessTokenAuthGuard } from 'src/auth/guards/user-access-token.guard';
import { ApiTags } from '@nestjs/swagger';
import { TopUpDto } from './dto/top-up-dto';

@ApiTags('Wallet')
@UsePipes(ValidationPipe)
@UseGuards(UserAccessTokenAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  @Get()
  async getWallet(@Req() req: any, @Headers('x-lang') lang: string) {
    return await this.walletService.getWallet(req.user.id, lang)
  }

  @Post('topup')
  async topUp(@Req() req: any, @Body() dto: TopUpDto, @Headers('x-lang') lang: string) {
    return await this.walletService.topUp(req.user.id, dto.amount, lang);
  }

  @Get('transactions')
  async getTransactions(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number
  ) {
    return await this.walletService.getTransactions(req.user.id, page, pageSize);
  }
}
