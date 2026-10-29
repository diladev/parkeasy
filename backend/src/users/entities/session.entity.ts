import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.entity';

/**
 * One signed-in device: a phone, a browser. Each has its own refresh token,
 * so signing in on a second device doesn't sign the first one out. The token
 * rotates on every refresh and only its hash is stored (see AuthService).
 */
@Table({ tableName: 'sessions', timestamps: true })
export class Session extends Model {
  /** Random, and carried inside the session's tokens as `sid`. */
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;

  /** SHA-256 of the session's current refresh token. */
  @Column({ type: DataType.STRING(64), allowNull: false })
  declare token_hash: string;

  /** When the current refresh token expires; the session ends with it. */
  @Column({ type: DataType.DATE, allowNull: false })
  declare expires_at: Date;
}
