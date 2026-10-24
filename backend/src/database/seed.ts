/**
 * Demo data for local development: `npm run seed`.
 *
 * Empties the database named in .env, recreates the tables and fills them with
 * demo accounts, parking lots, bookings, wallet history and notifications, so
 * every screen of the app has something to show. It never runs in production.
 *
 * Times are relative to the moment the seed runs, so the active bookings are
 * always in progress right after seeding. Run it again to start fresh.
 */
import { randomUUID } from 'crypto';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { AppModule } from 'src/app.module';
import { Booking, PaymentMethod } from 'src/booking/entities/booking.entity';
import { CURRENCY, formatDinars } from 'src/common/money';
import { hashPassword } from 'src/common/security/password';
import {
    Notification,
    NotificationData,
    NotificationEvent,
    NOTIFICATION_EVENTS,
} from 'src/notifications/entities/notification.entity';
import { FavoriteLot } from 'src/parking/entities/favorite-lot.entity';
import { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import { ParkingSlot } from 'src/parking/entities/parking-slot.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/users/entities/vehicle.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import {
    WalletTransaction,
    WalletTransactionCategory,
} from 'src/wallet/entities/wallet-transaction.entity';

/** The password of every demo account. */
const DEMO_PASSWORD = 'Demo@1234';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
/** Iraq has no daylight saving time, so local time is always UTC+3. */
const IRAQ_UTC_OFFSET = 3 * HOUR;

const logger = new Logger('Seed');

// ------------------------------------------------------------------ parking lots

interface LotSeed {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    price_per_hour: number;
    rating: number;
    /** null = open 24 hours, otherwise local opening and closing time. */
    hours: [string, string] | null;
    has_cctv?: boolean;
    has_ev_charging?: boolean;
    is_covered?: boolean;
    is_accessible?: boolean;
    /** Number of slots on each level, e.g. { B1: 12, G: 8 }. */
    levels: Record<string, number>;
    /** Slots that are out of service ("B1:A04"). */
    unavailable?: string[];
    /** Slots with a car parked without a booking ("G:A02"). */
    occupied?: string[];
    /** Removed from the app: hidden from search, still in booking history. */
    removed?: boolean;
}

const LOTS = {
    cityCenter: {
        name: 'City Center Parking',
        address: 'Salim Street, Sulaymaniyah',
        latitude: 35.5571,
        longitude: 45.4356,
        price_per_hour: 1500,
        rating: 4.6,
        hours: null,
        has_cctv: true,
        is_covered: true,
        is_accessible: true,
        levels: { B2: 10, B1: 12, G: 8 },
        unavailable: ['B2:A09', 'B2:A10'],
        occupied: ['G:A01', 'G:A02', 'G:A05'],
    },
    azadiPark: {
        name: 'Azadi Park Garage',
        address: 'Azadi Park, Sulaymaniyah',
        latitude: 35.5608,
        longitude: 45.4295,
        price_per_hour: 1000,
        rating: 4.2,
        hours: ['08:00', '22:00'],
        has_ev_charging: true,
        levels: { G: 10, F1: 10 },
    },
    bakhtiari: {
        name: 'Bakhtiari Plaza Parking',
        address: 'Bakhtiari, Sulaymaniyah',
        latitude: 35.5536,
        longitude: 45.4148,
        price_per_hour: 2000,
        rating: 4.8,
        hours: ['07:00', '23:00'],
        has_cctv: true,
        has_ev_charging: true,
        is_covered: true,
        is_accessible: true,
        levels: { B1: 8, G: 8, F1: 8, F2: 8 },
    },
    sarchinar: {
        name: 'Sarchinar Night Parking',
        address: 'Sarchinar, Sulaymaniyah',
        latitude: 35.5794,
        longitude: 45.3992,
        price_per_hour: 1250,
        rating: 3.9,
        hours: ['18:00', '02:00'],
        levels: { G: 12 },
    },
    oldBazaar: {
        name: 'Old Bazaar Parking',
        address: 'Mawlawi Street, Sulaymaniyah',
        latitude: 35.5642,
        longitude: 45.4371,
        price_per_hour: 750,
        rating: 3.5,
        hours: ['06:00', '20:00'],
        is_accessible: true,
        levels: { G: 6 },
        occupied: ['G:A01', 'G:A02', 'G:A03', 'G:A04', 'G:A05'],
    },
    tasluja: {
        name: 'Tasluja Road Parking',
        address: 'Tasluja Road, Sulaymaniyah',
        latitude: 35.6021,
        longitude: 45.3567,
        price_per_hour: 1000,
        rating: 3.2,
        hours: null,
        levels: { G: 6 },
        removed: true,
    },
    erbilCitadel: {
        name: 'Citadel Parking',
        address: 'Citadel Square, Erbil',
        latitude: 36.1912,
        longitude: 44.0092,
        price_per_hour: 1500,
        rating: 4.4,
        hours: null,
        has_cctv: true,
        levels: { G: 10 },
    },
} satisfies Record<string, LotSeed>;

type LotKey = keyof typeof LOTS;

interface CreatedLot {
    lot: ParkingLot;
    slots: Map<string, ParkingSlot>;
}

// ------------------------------------------------------------------ the seeding

class DemoData {
    private readonly now = Date.now();
    private readonly lots = new Map<LotKey, CreatedLot>();
    private readonly balances = new Map<number, number>();
    private seededPayments = 1;

    constructor(private readonly transaction: Transaction) { }

    /** A moment relative to when the seed runs: at(-40 * MINUTE) is 40 minutes ago. */
    private at(offset: number): Date {
        return new Date(this.now + offset);
    }

    /**
     * The offset of a local time (Iraq, UTC+3) on an earlier day, so past
     * bookings fall within their lot's opening hours: dayAt(3, '12:00').
     */
    private dayAt(daysAgo: number, time: string): number {
        const local = new Date(this.now + IRAQ_UTC_OFFSET);
        const [hours, minutes] = time.split(':').map(Number);
        const utc = Date.UTC(
            local.getUTCFullYear(),
            local.getUTCMonth(),
            local.getUTCDate() - daysAgo,
            hours,
            minutes,
        ) - IRAQ_UTC_OFFSET;
        return utc - this.now;
    }

    async run(): Promise<void> {
        for (const key of Object.keys(LOTS) as LotKey[]) {
            await this.createLot(key, LOTS[key]);
        }

        // Aram: a regular. Active booking, history of every kind, wallet in use.
        const aram = await this.createUser('Aram Hassan', 'aram@example.com', '+964 750 100 0001', '1995-04-12');
        const corolla = await this.createVehicle(aram, 'Toyota', 'Corolla', 2019, 'White', '22 SUL 48213', 'sedan', true);
        const sportage = await this.createVehicle(aram, 'Kia', 'Sportage', 2021, 'Grey', '22 SUL 77120', 'suv');

        await this.topUp(aram, 20_000, this.dayAt(30, '20:15'), true);
        await this.addBooking(aram, corolla, 'tasluja', 'G:A03', this.dayAt(20, '09:30'), 1, 'card', 'completed', { read: true });
        await this.topUp(aram, 15_000, this.dayAt(10, '18:05'), true);
        await this.addBooking(aram, sportage, 'azadiPark', 'F1:A04', this.dayAt(8, '17:00'), 2, 'card', 'completed', { read: true });
        await this.addBooking(aram, corolla, 'cityCenter', 'B1:A07', this.dayAt(5, '19:00'), 3, 'wallet', 'cancelled', {
            cancelAfterMinutes: 6,
            read: true,
        });
        await this.addBooking(aram, corolla, 'bakhtiari', 'F2:A02', this.dayAt(3, '12:00'), 2, 'wallet', 'completed', {
            extraHours: 1,
            read: true,
        });
        await this.addBooking(aram, corolla, 'cityCenter', 'B1:A03', -40 * MINUTE, 2, 'wallet', 'active', {
            read: false,
        });
        await this.addFavorite(aram, 'bakhtiari');
        await this.addFavorite(aram, 'cityCenter');

        // Shilan: a low balance (1,250 IQD), so most wallet payments fail with "balance too low".
        const shilan = await this.createUser('Shilan Ahmed', 'shilan@example.com', '+964 770 100 0002', '1998-09-03');
        const elantra = await this.createVehicle(shilan, 'Hyundai', 'Elantra', 2018, 'Silver', '22 SUL 30544', 'sedan', true);
        await this.topUp(shilan, 5_000, this.dayAt(6, '09:40'), true);
        await this.addBooking(shilan, elantra, 'oldBazaar', 'G:A06', this.dayAt(6, '10:00'), 5, 'wallet', 'completed', { read: true });
        await this.addBooking(shilan, elantra, 'azadiPark', 'G:A02', this.dayAt(2, '09:00'), 2, 'card', 'completed', { read: false });

        // Lana: active booking paid by card, unread notifications, two vehicles.
        const lana = await this.createUser('Lana Rashid', 'lana@example.com', '+964 751 100 0003', null);
        const hilux = await this.createVehicle(lana, 'Toyota', 'Hilux', 2020, 'Black', '22 SUL 61902', 'truck', true);
        await this.createVehicle(lana, 'Nissan', 'Patrol', 2017, 'White', '22 SUL 10388', 'suv');
        await this.topUp(lana, 50_000, this.dayAt(1, '21:30'), false);
        await this.addBooking(lana, hilux, 'cityCenter', 'B2:A01', -15 * MINUTE, 3, 'card', 'active', { read: false });

        // Karwan: just signed up. No vehicles, no wallet, no bookings: the empty screens.
        await this.createUser('Karwan Omer', 'karwan@example.com', '+964 750 100 0004', null);

        // Hemin: suspended. Signing in answers 403 "account inactive".
        const hemin = await this.createUser('Hemin Aziz', 'hemin@example.com', '+964 772 100 0005', '1990-01-25', 'suspended');
        await this.createVehicle(hemin, 'Ford', 'Ranger', 2016, 'Blue', '22 SUL 99001', 'truck', true);

        await this.saveWalletBalances();
    }

    // ---------------------------------------------------------------- builders

    private async addFavorite(user: User, lotKey: LotKey): Promise<void> {
        const { lot } = this.lots.get(lotKey)!;
        await FavoriteLot.create({ user_id: user.id, parking_lot_id: lot.id }, { transaction: this.transaction });
    }

    private async createLot(key: LotKey, seed: LotSeed): Promise<void> {
        const { transaction } = this;
        const lot = await ParkingLot.create(
            {
                name: seed.name,
                address: seed.address,
                latitude: seed.latitude,
                longitude: seed.longitude,
                price_per_hour: seed.price_per_hour,
                rating: seed.rating,
                is_open_24h: seed.hours === null,
                opening_time: seed.hours?.[0] ?? '00:00',
                closing_time: seed.hours?.[1] ?? '00:00',
                has_cctv: seed.has_cctv ?? false,
                has_ev_charging: seed.has_ev_charging ?? false,
                is_covered: seed.is_covered ?? false,
                is_accessible: seed.is_accessible ?? false,
                is_available: !seed.removed,
            },
            { transaction },
        );

        const statusOf = (ref: string) => {
            if (seed.removed || seed.unavailable?.includes(ref)) return 'unavailable';
            if (seed.occupied?.includes(ref)) return 'occupied';
            return 'free';
        };

        const rows = Object.entries(seed.levels).flatMap(([level, count]) =>
            Array.from({ length: count }, (_, index) => {
                const slotNumber = `A${String(index + 1).padStart(2, '0')}`;
                return {
                    parking_lot_id: lot.id,
                    level,
                    slot_number: slotNumber,
                    status: statusOf(`${level}:${slotNumber}`),
                };
            }),
        );
        const slots = await ParkingSlot.bulkCreate(rows, { transaction });

        this.lots.set(key, {
            lot,
            slots: new Map(slots.map((slot) => [`${slot.level}:${slot.slot_number}`, slot])),
        });
    }

    private async createUser(
        name: string,
        email: string,
        phone: string,
        dateOfBirth: string | null,
        status = 'active',
    ): Promise<User> {
        return User.create(
            {
                name,
                email,
                phone,
                username: email.split('@')[0],
                password: await hashPassword(DEMO_PASSWORD),
                date_of_birth: dateOfBirth,
                status,
            },
            { transaction: this.transaction },
        );
    }

    private createVehicle(
        user: User,
        brand: string,
        model: string,
        year: number,
        color: string,
        plate: string,
        type: 'sedan' | 'suv' | 'truck',
        isDefault = false,
    ): Promise<Vehicle> {
        return Vehicle.create(
            {
                user_id: user.id,
                brand,
                model,
                year,
                color,
                license_plate: plate,
                type,
                is_default: isDefault,
            },
            { transaction: this.transaction },
        );
    }

    /** A top-up the (mock) provider confirmed: the paid payment and the wallet credit it led to. */
    private async topUp(user: User, amount: number, offset: number, read: boolean): Promise<void> {
        const paidAt = this.at(offset);
        const providerPaymentId = randomUUID();
        const payment = await Payment.create(
            {
                user_id: user.id,
                purpose: 'WALLET_TOP_UP',
                amount,
                currency: CURRENCY,
                status: 'paid',
                provider: 'mock',
                provider_payment_id: providerPaymentId,
                readable_code: `PE-SEED-${String(this.seededPayments++).padStart(4, '0')}`,
                app_link: `parkeasy-mock-fib://pay/${providerPaymentId}`,
                valid_until: new Date(paidAt.getTime() + 15 * MINUTE),
                paid_at: paidAt,
                createdAt: new Date(paidAt.getTime() - 2 * MINUTE),
            },
            { transaction: this.transaction },
        );
        await this.walletEntry(user, 'credit', amount, 'TOP_UP', null, offset, payment.id);
        await this.notify(user, 'WALLET_TOPPED_UP', { amount: formatDinars(amount) }, offset, read);
    }

    /**
     * A booking with everything that comes with it: the wallet payments and
     * refund, the notifications, and a reserved slot while it's active. Amounts
     * follow the same rules as BookingService.
     */
    private async addBooking(
        user: User,
        vehicle: Vehicle,
        lotKey: LotKey,
        slotRef: string,
        startOffset: number,
        hours: number,
        payment: PaymentMethod,
        outcome: 'active' | 'completed' | 'cancelled',
        options: { extraHours?: number; cancelAfterMinutes?: number; read: boolean },
    ): Promise<void> {
        const { lot, slots } = this.lots.get(lotKey)!;
        const slot = slots.get(slotRef);
        if (!slot) throw new Error(`No slot ${slotRef} in ${lot.name}`);

        const extraHours = options.extraHours ?? 0;
        const totalHours = hours + extraHours;
        const price = lot.price_per_hour;
        const firstPayment = price * hours;
        const extensionPayment = price * extraHours;
        const start = this.at(startOffset);
        const end = new Date(start.getTime() + totalHours * HOUR);

        const booking = await Booking.create(
            {
                user_id: user.id,
                parking_lot_id: lot.id,
                parking_slot_id: slot.id,
                vehicle_id: vehicle.id,
                duration_hours: totalHours,
                price_per_hour: price,
                total_cost: firstPayment + extensionPayment,
                payment_method: payment,
                status: outcome,
                start_time: start,
                end_time: end,
                createdAt: start,
            },
            { transaction: this.transaction },
        );

        const read = options.read;
        await this.notify(user, 'BOOKING_CONFIRMED', { lot: lot.name, slot: slot.slot_number, hours }, startOffset, read);
        if (payment === 'wallet') {
            await this.walletEntry(user, 'debit', firstPayment, 'BOOKING_PAYMENT', booking.id, startOffset);
        }

        if (extraHours > 0) {
            const extendedAt = startOffset + hours * HOUR - 15 * MINUTE;
            if (payment === 'wallet') {
                await this.walletEntry(user, 'debit', extensionPayment, 'BOOKING_EXTENSION', booking.id, extendedAt);
            }
            await this.notify(user, 'BOOKING_EXTENDED', { lot: lot.name, hours: extraHours }, extendedAt, read);
        }

        if (outcome === 'active') {
            await slot.update({ status: 'reserved' }, { transaction: this.transaction });
        }

        if (outcome === 'completed') {
            await this.notify(user, 'BOOKING_COMPLETED', { lot: lot.name }, startOffset + totalHours * HOUR, read);
        }

        if (outcome === 'cancelled') {
            const minutes = options.cancelAfterMinutes ?? 0;
            const cancelledAt = startOffset + minutes * MINUTE;
            // Within the first 10 minutes everything comes back; after that, the unused whole hours.
            const refundable = minutes <= 10
                ? booking.total_cost
                : Math.floor((totalHours * 60 - minutes) / 60) * price;
            const refund = payment === 'wallet' ? refundable : 0;
            if (refund > 0) {
                await this.walletEntry(user, 'credit', refund, 'BOOKING_REFUND', booking.id, cancelledAt);
            }
            await this.notify(user, 'BOOKING_CANCELLED', { lot: lot.name, refund: formatDinars(refund) }, cancelledAt, read);
        }
    }

    private async walletEntry(
        user: User,
        type: 'credit' | 'debit',
        amount: number,
        category: WalletTransactionCategory,
        bookingId: number | null,
        offset: number,
        paymentId: number | null = null,
    ): Promise<void> {
        const [wallet] = await Wallet.findOrCreate({
            where: { user_id: user.id },
            defaults: { user_id: user.id, balance: 0 },
            transaction: this.transaction,
        });
        await WalletTransaction.create(
            {
                wallet_id: wallet.id,
                type,
                amount,
                category,
                booking_id: bookingId,
                payment_id: paymentId,
                createdAt: this.at(offset),
            },
            { transaction: this.transaction },
        );

        const balance = this.balances.get(wallet.id) ?? 0;
        this.balances.set(wallet.id, type === 'credit' ? balance + amount : balance - amount);
    }

    private async notify(
        user: User,
        event: NotificationEvent,
        data: NotificationData,
        offset: number,
        read: boolean,
    ): Promise<void> {
        await Notification.create(
            {
                user_id: user.id,
                type: NOTIFICATION_EVENTS[event],
                event,
                data,
                is_read: read,
                createdAt: this.at(offset),
            },
            { transaction: this.transaction },
        );
    }

    /** Each wallet's balance is the sum of its transactions. */
    private async saveWalletBalances(): Promise<void> {
        for (const [walletId, balance] of this.balances) {
            await Wallet.update({ balance }, { where: { id: walletId }, transaction: this.transaction });
        }
    }
}

// ------------------------------------------------------------------ entry point

async function seed(): Promise<void> {
    const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });

    try {
        if (app.get(ConfigService).get<string>('NODE_ENV') === 'production') {
            throw new Error('The demo seed never runs in production.');
        }

        const sequelize = app.get<Sequelize>(getConnectionToken());
        const database = sequelize.getDatabaseName();

        console.log(`Emptying the "${database}" database...`);
        await sequelize.getQueryInterface().dropAllTables();
        await sequelize.sync();

        await sequelize.transaction((transaction) => new DemoData(transaction).run());

        console.log(`Demo data is ready. Every account's password is ${DEMO_PASSWORD}`);
        console.table([
            { email: 'aram@example.com', shows: 'active booking, full history, wallet in use, 2 favorites' },
            { email: 'shilan@example.com', shows: 'low balance: most wallet payments fail' },
            { email: 'lana@example.com', shows: 'active booking paid by card, unread notifications' },
            { email: 'karwan@example.com', shows: 'new account: no vehicles, bookings or wallet' },
            { email: 'hemin@example.com', shows: 'suspended: sign-in is refused' },
        ]);
    } finally {
        await app.close();
    }
}

seed().catch((error: unknown) => {
    logger.error(error instanceof Error ? error.stack : String(error));
    process.exit(1);
});
