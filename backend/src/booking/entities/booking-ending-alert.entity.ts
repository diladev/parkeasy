import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { Booking } from './booking.entity';

/**
 * That a booking's "ends soon" notice was sent, and for which end time.
 * Extending a booking moves its end time, so it gets a new notice then.
 */
@Table({ tableName: 'booking_ending_alerts', timestamps: true })
export class BookingEndingAlert extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    declare id: number;

    @ForeignKey(() => Booking)
    @Column({ allowNull: false, unique: true })
    declare booking_id: number;

    @BelongsTo(() => Booking)
    declare booking: Booking;

    /** The end time the notice was about. */
    @Column({ type: DataType.DATE, allowNull: false })
    declare end_time: Date;
}
