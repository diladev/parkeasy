import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import paymentsConfig from 'src/config/payments';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { Payment } from './entities/payment.entity';
import { MockFibGateway } from './gateway/mock-fib.gateway';
import { PAYMENT_GATEWAY, PaymentGateway } from './gateway/payment-gateway';
import { MockBankController } from './mock-bank.controller';
import { PaymentsWebhookController } from './payments-webhook.controller';
import { PaymentsService } from './payments.service';
import { TopUpsController } from './top-ups.controller';

/**
 * Picks the payment provider from PAYMENT_PROVIDER. A real one (FIB, ZainCash)
 * is another PaymentGateway added here; nothing else changes.
 */
function createGateway(): PaymentGateway {
  const config = paymentsConfig();
  switch (config.provider) {
    case 'mock':
      return new MockFibGateway(config.validity_minutes);
  }
}

@Module({
  imports: [
    SequelizeModule.forFeature([Payment]),
    WalletModule,
    NotificationsModule,
  ],
  controllers: [
    TopUpsController,
    PaymentsWebhookController,
    MockBankController,
  ],
  providers: [
    PaymentsService,
    { provide: PAYMENT_GATEWAY, useFactory: createGateway },
  ],
})
export class PaymentsModule {}
