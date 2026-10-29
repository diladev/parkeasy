import { DataTypes, type ModelAttributes } from 'sequelize';
import type { Migration } from '../migrator';

/*
 * The schema as it was when migrations started: every table the models
 * described then, written out so it never changes. Later changes go in new
 * migrations (0002-..., 0003-...), never here.
 *
 * Tables are created parents first, so every foreign key has its table.
 */

const id = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
};
const timestamps = {
  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false },
};
/** Soft delete (paranoid models). */
const deletedAt = { deletedAt: { type: DataTypes.DATE } };

type OnDelete = 'CASCADE' | 'SET NULL' | 'NO ACTION';
/** An INTEGER column pointing at `table`.id. */
const ref = (table: string, allowNull: boolean, onDelete: OnDelete) => ({
  type: DataTypes.INTEGER,
  allowNull,
  references: { model: table, key: 'id' },
  onDelete,
  onUpdate: 'CASCADE',
});
const required = <T>(type: T) => ({ type, allowNull: false });
const optional = <T>(type: T) => ({ type, allowNull: true });
const withDefault = <T>(type: T, defaultValue: unknown) => ({
  type,
  allowNull: false,
  defaultValue,
});

const TABLES: [string, ModelAttributes][] = [
  [
    'users',
    {
      ...id,
      name: required(DataTypes.STRING),
      username: { ...required(DataTypes.STRING), unique: true },
      email: { ...required(DataTypes.STRING), unique: true },
      phone: required(DataTypes.STRING),
      password: required(DataTypes.STRING),
      date_of_birth: optional(DataTypes.DATEONLY),
      otp_hash: optional(DataTypes.STRING),
      otp_expires_at: optional(DataTypes.DATE),
      otp_attempts: withDefault(DataTypes.INTEGER, 0),
      status: withDefault(DataTypes.STRING, 'active'),
      role: withDefault(DataTypes.STRING(20), 'driver'),
      ...timestamps,
      ...deletedAt,
    },
  ],
  [
    'vehicles',
    {
      ...id,
      brand: required(DataTypes.STRING),
      model: required(DataTypes.STRING),
      year: required(DataTypes.INTEGER),
      color: required(DataTypes.STRING),
      license_plate: required(DataTypes.STRING),
      type: withDefault(DataTypes.STRING, 'sedan'),
      is_default: withDefault(DataTypes.BOOLEAN, false),
      user_id: ref('users', false, 'CASCADE'),
      ...timestamps,
      ...deletedAt,
    },
  ],
  [
    'sessions',
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      user_id: ref('users', false, 'CASCADE'),
      token_hash: required(DataTypes.STRING(64)),
      expires_at: required(DataTypes.DATE),
      ...timestamps,
    },
  ],
  [
    'parking_lots',
    {
      ...id,
      name: required(DataTypes.STRING),
      address: required(DataTypes.STRING),
      city: required(DataTypes.STRING(100)),
      latitude: required(DataTypes.DOUBLE),
      longitude: required(DataTypes.DOUBLE),
      is_open_24h: withDefault(DataTypes.BOOLEAN, true),
      opening_time: required(DataTypes.STRING),
      closing_time: required(DataTypes.STRING),
      price_per_hour: required(DataTypes.INTEGER),
      daily_cap: optional(DataTypes.INTEGER),
      free_cancellation_minutes: withDefault(DataTypes.INTEGER, 10),
      rating: withDefault(DataTypes.DOUBLE, 0),
      has_cctv: withDefault(DataTypes.BOOLEAN, false),
      has_ev_charging: withDefault(DataTypes.BOOLEAN, false),
      is_covered: withDefault(DataTypes.BOOLEAN, false),
      is_accessible: withDefault(DataTypes.BOOLEAN, false),
      is_available: withDefault(DataTypes.BOOLEAN, true),
      status: withDefault(DataTypes.STRING(20), 'pending'),
      owner_id: ref('users', true, 'SET NULL'),
      ...timestamps,
      ...deletedAt,
    },
  ],
  [
    'parking_slots',
    {
      ...id,
      slot_number: required(DataTypes.STRING),
      level: required(DataTypes.STRING),
      status: withDefault(DataTypes.STRING, 'free'),
      parking_lot_id: ref('parking_lots', false, 'CASCADE'),
      ...timestamps,
      ...deletedAt,
    },
  ],
  [
    'favorite_lots',
    {
      ...id,
      user_id: ref('users', false, 'NO ACTION'),
      parking_lot_id: ref('parking_lots', false, 'NO ACTION'),
      ...timestamps,
    },
  ],
  [
    'price_overrides',
    {
      ...id,
      parking_lot_id: ref('parking_lots', false, 'CASCADE'),
      label: required(DataTypes.STRING(60)),
      start_date: required(DataTypes.DATEONLY),
      end_date: required(DataTypes.DATEONLY),
      price_per_hour: required(DataTypes.INTEGER),
      daily_cap: optional(DataTypes.INTEGER),
      ...timestamps,
    },
  ],
  [
    'bookings',
    {
      ...id,
      status: withDefault(DataTypes.STRING, 'active'),
      source: withDefault(DataTypes.STRING, 'app'),
      start_time: required(DataTypes.DATE),
      end_time: optional(DataTypes.DATE),
      cancellable_until: required(DataTypes.DATE),
      ended_at: optional(DataTypes.DATE),
      duration_hours: required(DataTypes.INTEGER),
      price_per_hour: required(DataTypes.INTEGER),
      price_rules: optional(DataTypes.TEXT),
      total_cost: required(DataTypes.INTEGER),
      payment_method: withDefault(DataTypes.STRING, 'card'),
      user_id: ref('users', true, 'SET NULL'),
      parking_lot_id: ref('parking_lots', false, 'NO ACTION'),
      parking_slot_id: ref('parking_slots', false, 'NO ACTION'),
      vehicle_id: ref('vehicles', true, 'SET NULL'),
      plate: optional(DataTypes.STRING(20)),
      ...timestamps,
      ...deletedAt,
    },
  ],
  [
    'wallets',
    {
      ...id,
      balance: withDefault(DataTypes.INTEGER, 0),
      user_id: { ...ref('users', false, 'NO ACTION'), unique: true },
      ...timestamps,
      ...deletedAt,
    },
  ],
  [
    'payments',
    {
      ...id,
      user_id: ref('users', false, 'NO ACTION'),
      purpose: required(DataTypes.STRING),
      amount: required(DataTypes.INTEGER),
      currency: withDefault(DataTypes.STRING, 'IQD'),
      status: withDefault(DataTypes.STRING, 'pending'),
      provider: required(DataTypes.STRING),
      provider_payment_id: { ...required(DataTypes.STRING), unique: true },
      readable_code: required(DataTypes.STRING),
      app_link: required(DataTypes.STRING),
      valid_until: required(DataTypes.DATE),
      paid_at: optional(DataTypes.DATE),
      decline_reason: optional(DataTypes.STRING),
      ...timestamps,
    },
  ],
  [
    'wallet_transactions',
    {
      ...id,
      type: required(DataTypes.STRING),
      amount: required(DataTypes.INTEGER),
      category: required(DataTypes.STRING),
      wallet_id: ref('wallets', false, 'CASCADE'),
      booking_id: ref('bookings', true, 'SET NULL'),
      payment_id: { ...ref('payments', true, 'SET NULL'), unique: true },
      ...timestamps,
      ...deletedAt,
    },
  ],
  [
    'notifications',
    {
      ...id,
      type: required(DataTypes.STRING),
      event: required(DataTypes.STRING),
      data: required(DataTypes.JSON),
      is_read: withDefault(DataTypes.BOOLEAN, false),
      user_id: ref('users', false, 'NO ACTION'),
      ...timestamps,
      ...deletedAt,
    },
  ],
  [
    'notification_settings',
    {
      ...id,
      user_id: { ...ref('users', false, 'NO ACTION'), unique: true },
      booking_reminders: withDefault(DataTypes.BOOLEAN, true),
      expiry_alerts: withDefault(DataTypes.BOOLEAN, true),
      offers: withDefault(DataTypes.BOOLEAN, false),
      loyalty_rewards: withDefault(DataTypes.BOOLEAN, true),
      booking_receipt_emails: withDefault(DataTypes.BOOLEAN, true),
      newsletter: withDefault(DataTypes.BOOLEAN, false),
      ...timestamps,
    },
  ],
  [
    'booking_ending_alerts',
    {
      ...id,
      booking_id: { ...ref('bookings', false, 'NO ACTION'), unique: true },
      end_time: required(DataTypes.DATE),
      ...timestamps,
    },
  ],
];

/** Indexes over several columns (single-column unique ones are on the columns above). */
const INDEXES: [string, string[], { unique?: boolean; name: string }][] = [
  [
    'parking_slots',
    ['parking_lot_id', 'level', 'slot_number'],
    { unique: true, name: 'parking_slots_parking_lot_id_level_slot_number' },
  ],
  [
    'favorite_lots',
    ['user_id', 'parking_lot_id'],
    { unique: true, name: 'favorite_lots_user_id_parking_lot_id' },
  ],
  [
    'payments',
    ['status', 'valid_until'],
    { name: 'payments_status_valid_until' },
  ],
];

export const initialSchema: Migration = {
  name: '0001-initial-schema',
  async up(queryInterface) {
    for (const [table, columns] of TABLES) {
      await queryInterface.createTable(table, columns);
    }
    for (const [table, fields, options] of INDEXES) {
      await queryInterface.addIndex(table, fields, options);
    }
  },
};

/** The tables this migration creates, to recognise a database made before migrations. */
export const INITIAL_TABLES = TABLES.map(([table]) => table);
