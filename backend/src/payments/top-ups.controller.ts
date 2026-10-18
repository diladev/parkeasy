import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { UserAccessTokenAuthGuard } from 'src/auth/guards/user-access-token.guard';
import type { AuthenticatedUser } from 'src/auth/types/auth.types';
import { ParseIdPipe } from 'src/common/pipes/parse-id.pipe';
import { CreateTopUpDto } from './dto/create-top-up.dto';
import { PaymentsService } from './payments.service';

/**
 * Adding money to the wallet. A top-up is a payment the user approves in
 * their banking app; the wallet is credited once the provider confirms it.
 */
@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(UserAccessTokenAuthGuard)
@Controller('wallet/top-ups')
export class TopUpsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    /** Starts a top-up. The response has the code / app link to pay it with. */
    @Post()
    create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTopUpDto) {
        return this.paymentsService.createTopUp(user.id, dto.amount);
    }

    /** Poll this after sending the user to pay: it reports paid, declined or expired. */
    @Get(':id')
    get(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIdPipe) id: number) {
        return this.paymentsService.getTopUp(user.id, id);
    }

    @Post(':id/cancel')
    @HttpCode(200)
    cancel(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIdPipe) id: number) {
        return this.paymentsService.cancelTopUp(user.id, id);
    }
}
