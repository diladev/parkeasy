import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TranslationService } from 'src/i18n/translation.service';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectModel(Wallet) private walletModel: typeof Wallet,
    @InjectModel(WalletTransaction) private walletTransactionModel: typeof WalletTransaction,
    private readonly translationService: TranslationService,
  ) { }

  async findOrCreate(userId: number): Promise<Wallet> {
    const [wallet] = await this.walletModel.findOrCreate({
      where: { userId },
      defaults: { userId, balance: 0 }
    });
    return wallet;
  }

  async getWallet(userId: number, lang: string): Promise<Wallet> {
    const wallet = await this.walletModel.findOne({
      where: { userId },
      include: [WalletTransaction]
    });

    if (!wallet) {
      throw new NotFoundException(
        this.translationService.translate('message.WALLET_NOT_FOUND', { lang: lang })
      )
    }
    return wallet;
  }

  async topUp(userId: number, amount: number, lang: string) {
    const wallet = await this.findOrCreate(userId);
    await wallet.update({ balance: wallet.balance + amount });
    await this.walletTransactionModel.create({
      wallet_id: wallet.id,
      type: 'credit',
      amount,
      description: 'Top up'
    })

    return {
      message: this.translationService.translate('message.WALLET_TOPPED_UP', { lang: lang }),
      balance: wallet.balance + amount
    };
  }

  async deduct(userId: number, amount: number, lang: string): Promise<void> {
    const wallet = await this.findOrCreate(userId);
    if (wallet.balance < amount) {
      throw new BadRequestException(
        this.translationService.translate(
          'message.INSUFFICIENT_BALANCE',
          { lang: lang }
        )
      );
    }

    await wallet.update({ balance: wallet.balance - amount })
    await this.walletTransactionModel.create({
      wallet_id: wallet.id,
      type: 'debit',
      amount,
      description: 'Booking payment'
    });
  }

  async credit(userId: number, amount: number): Promise<void> {
    const wallet = await this.findOrCreate(userId);
    await wallet.update({ balance: wallet.balance + amount });
    await this.walletTransactionModel.create({
      wallet_id: wallet.id,
      type: 'credit',
      amount,
      description: 'Booking refund'
    });
  }

  async getTransactions(userId: number, page = 1, pageSize = 10) {
    const wallet = await this.findOrCreate(userId);
    const offset = (page - 1) * pageSize;
    const { rows, count } = await this.walletTransactionModel.findAndCountAll({
      where: { wallet_Id: wallet.id },
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      data: rows,
      meta: {
        totalItems: count,
        currentPage: page,
        itemsPerPage: pageSize,
        totalPages: Math.ceil(count / pageSize)
      }
    };
  }
}
