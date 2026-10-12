import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { roundMoney } from 'src/common/money';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { ModelPagination } from 'src/common/pagination/model-pagination';
import { TranslationService } from 'src/i18n/translation.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction, WalletTransactionCategory } from './entities/wallet-transaction.entity';

@Injectable()
export class WalletService {
  private readonly transactionPagination = new ModelPagination(WalletTransaction, '/wallet/transactions');

  constructor(
    @InjectModel(Wallet) private readonly walletModel: typeof Wallet,
    @InjectModel(WalletTransaction) private readonly transactionModel: typeof WalletTransaction,
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly translationService: TranslationService,
    private readonly notificationsService: NotificationsService,
  ) { }

  private t(key: string, args?: Record<string, unknown>): string {
    return this.translationService.translate(`message.${key}`, { args });
  }

  /** The user's wallet. A new user has none yet, so it's created with a 0 balance. */
  async getWallet(userId: number, transaction?: Transaction): Promise<Wallet> {
    const [wallet] = await this.walletModel.findOrCreate({
      where: { user_id: userId },
      defaults: { user_id: userId, balance: 0 },
      transaction,
    });
    return wallet;
  }

  async topUp(userId: number, amount: number): Promise<{ message: string; balance: number }> {
    const wallet = await this.sequelize.transaction(async (transaction) => {
      const wallet = await this.credit(userId, amount, 'TOP_UP', null, transaction);
      await this.notificationsService.notify(userId, 'WALLET_TOPPED_UP', { amount }, transaction);
      return wallet;
    });

    return { message: this.t('WALLET_TOPPED_UP'), balance: wallet.balance };
  }

  /**
   * Takes money out of the wallet. Must run inside the caller's transaction, so the
   * payment is undone if anything after it fails (e.g. the booking can't be saved).
   */
  async debit(
    userId: number,
    amount: number,
    category: WalletTransactionCategory,
    bookingId: number | null,
    transaction: Transaction,
  ): Promise<Wallet> {
    const value = roundMoney(amount);
    const wallet = await this.lockWallet(userId, transaction);

    if (wallet.balance < value) {
      throw new BadRequestException(this.t('INSUFFICIENT_BALANCE'));
    }

    await wallet.update({ balance: roundMoney(wallet.balance - value) }, { transaction });
    await this.transactionModel.create(
      { wallet_id: wallet.id, type: 'debit', amount: value, category, booking_id: bookingId },
      { transaction },
    );
    return wallet;
  }

  /** Puts money into the wallet (top-up or refund). Same transaction rules as debit(). */
  async credit(
    userId: number,
    amount: number,
    category: WalletTransactionCategory,
    bookingId: number | null,
    transaction: Transaction,
  ): Promise<Wallet> {
    const value = roundMoney(amount);
    const wallet = await this.lockWallet(userId, transaction);

    await wallet.update({ balance: roundMoney(wallet.balance + value) }, { transaction });
    await this.transactionModel.create(
      { wallet_id: wallet.id, type: 'credit', amount: value, category, booking_id: bookingId },
      { transaction },
    );
    return wallet;
  }

  /** How much of a booking was paid from the wallet (payments minus refunds so far). */
  async netPaidForBooking(bookingId: number, transaction?: Transaction): Promise<number> {
    const rows = await this.transactionModel.findAll({ where: { booking_id: bookingId }, transaction });
    return roundMoney(
      rows.reduce((sum, row) => sum + (row.type === 'debit' ? row.amount : -row.amount), 0),
    );
  }

  async getTransactions(userId: number, query: PaginationQueryDto) {
    const wallet = await this.getWallet(userId);
    const result = await this.transactionPagination.findAll(query.page, query.pageSize, {
      where: { wallet_id: wallet.id },
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    });

    return {
      ...result,
      data: result.data.map((row) => ({
        ...row.toJSON<Record<string, unknown>>(),
        description: this.translationService.translate(`wallet.${row.category}`),
      })),
    };
  }

  /**
   * Reads the wallet with SELECT ... FOR UPDATE. A second payment for the same
   * user waits here until this transaction ends, so two payments can never both
   * read the same balance and spend it twice.
   */
  private async lockWallet(userId: number, transaction: Transaction): Promise<Wallet> {
    const { id } = await this.getWallet(userId, transaction);
    return this.walletModel.findByPk(id, {
      transaction,
      lock: Transaction.LOCK.UPDATE,
      rejectOnEmpty: true,
    });
  }
}
