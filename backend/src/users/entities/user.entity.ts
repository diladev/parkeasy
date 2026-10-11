import { Table, Column, Model, HasMany, DataType } from 'sequelize-typescript';
import { Vehicle } from './vehicle.entity';

/** Columns that must never leave the server. */
const PRIVATE_FIELDS = [
  'password',
  'refresh_token_hash',
  'otp_hash',
  'otp_expires_at',
  'otp_attempts',
  'deletedAt',
] as const;

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export class User extends Model {
  // Every attribute uses `declare`: a plain class field would shadow Sequelize's
  // getter/setter, so reads return undefined and writes are never saved.
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ allowNull: false })
  declare name: string;

  // Customers sign in with their email; the username is generated at sign-up.
  @Column({ allowNull: false, unique: true })
  declare username: string;

  @Column({ allowNull: false, unique: true })
  declare email: string;

  // Stored as text: phone numbers keep leading zeros and the + prefix.
  @Column({ allowNull: false })
  declare phone: string;

  @Column({ allowNull: false })
  declare password: string;

  // Optional, because the sign-up form doesn't ask for it.
  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare date_of_birth: string | null;

  // SHA-256 of the current refresh token (never the token itself).
  @Column({ type: DataType.STRING, allowNull: true })
  declare refresh_token_hash: string | null;

  // SHA-256 of the password-reset code.
  @Column({ type: DataType.STRING, allowNull: true })
  declare otp_hash: string | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare otp_expires_at: Date | null;

  @Column({ allowNull: false, defaultValue: 0 })
  declare otp_attempts: number;

  @Column({ allowNull: false, defaultValue: 'active' })
  declare status: string;

  @HasMany(() => Vehicle)
  declare vehicles: Vehicle[];

  /**
   * Strips secrets whenever a user is serialized into a response, including
   * when it's nested inside another model (e.g. a booking's user).
   */
  toJSON<T extends object>(): T {
    const values: Record<string, unknown> = { ...super.toJSON() };
    for (const field of PRIVATE_FIELDS) delete values[field];
    return values as T;
  }
}
