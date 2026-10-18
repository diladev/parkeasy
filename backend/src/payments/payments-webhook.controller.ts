import { BadRequestException, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { SIGNATURE_HEADER } from './gateway/webhook-signature';
import { PaymentsService } from './payments.service';

/**
 * Where the payment provider reports status changes (FIB's statusCallbackUrl).
 * No user login: the request is trusted by its signature, which is checked
 * against the exact bytes received (main.ts keeps them with rawBody: true).
 */
@ApiTags('Payments')
@Controller('payments')
export class PaymentsWebhookController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('webhook')
    @HttpCode(200)
    @ApiExcludeEndpoint()
    webhook(@Req() request: RawBodyRequest<Request>, @Headers(SIGNATURE_HEADER) signature?: string) {
        if (!request.rawBody) throw new BadRequestException();
        return this.paymentsService.handleWebhook(request.rawBody.toString('utf8'), signature);
    }
}
