import {
  Controller,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import paymentsConfig from 'src/config/payments';
import { UserAccessTokenAuthGuard } from 'src/auth/guards/user-access-token.guard';
import { TranslationService } from 'src/i18n/translation.service';
import { MockFibGateway } from './gateway/mock-fib.gateway';
import {
  PAYMENT_GATEWAY,
  ProviderPaymentStatus,
} from './gateway/payment-gateway';
import type { PaymentGateway } from './gateway/payment-gateway';
import { signWebhook } from './gateway/webhook-signature';
import { PaymentsService } from './payments.service';

/**
 * The customer's side of the mock provider: what tapping Pay or Decline in
 * the banking app would do. Only exists while PAYMENT_PROVIDER=mock.
 *
 * After deciding, it sends the provider's signed callback through the real
 * webhook handler, so the mock goes through the same checks as a real bank.
 */
@ApiTags('Payments (mock bank)')
@ApiBearerAuth()
@UseGuards(UserAccessTokenAuthGuard)
@Controller('payments/mock')
export class MockBankController {
  private readonly webhookSecret = paymentsConfig().webhook_secret;

  constructor(
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
    private readonly paymentsService: PaymentsService,
    private readonly translationService: TranslationService,
  ) {}

  @Post(':providerPaymentId/approve')
  @HttpCode(200)
  @ApiOperation({ summary: 'Pay a pending payment (mock provider only).' })
  approve(@Param('providerPaymentId') providerPaymentId: string) {
    return this.decide(providerPaymentId, (mock) =>
      mock.approve(providerPaymentId),
    );
  }

  @Post(':providerPaymentId/decline')
  @HttpCode(200)
  @ApiOperation({ summary: 'Decline a pending payment (mock provider only).' })
  decline(@Param('providerPaymentId') providerPaymentId: string) {
    return this.decide(providerPaymentId, (mock) =>
      mock.decline(providerPaymentId),
    );
  }

  private async decide(
    providerPaymentId: string,
    action: (mock: MockFibGateway) => ProviderPaymentStatus,
  ): Promise<{ status: ProviderPaymentStatus['status'] }> {
    if (!(this.gateway instanceof MockFibGateway)) {
      throw new NotFoundException();
    }
    const state = action(this.gateway);

    // The callback a real provider would send: it only names the payment.
    const body = JSON.stringify({
      id: providerPaymentId,
      status: state.status,
    });
    try {
      await this.paymentsService.handleWebhook(
        body,
        signWebhook(body, this.webhookSecret),
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          this.translationService.translate('message.PAYMENT_NOT_FOUND'),
        );
      }
      throw error;
    }
    return { status: state.status };
  }
}
