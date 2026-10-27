import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
  HasMany,
  DataType,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { WalletTransaction } from './wallet-transaction.entity';

@Table({ tableName: 'wallets', timestamps: true, paranoid: true })
export class Wallet extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  /** Whole Iraqi dinars (see common/money.ts). */
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare balance: number;

  @ForeignKey(() => User)
  @Column({ allowNull: false, unique: true })
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @HasMany(() => WalletTransaction)
  declare transactions: WalletTransaction[];
}
