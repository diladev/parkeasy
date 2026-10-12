import type { ParkingLot } from './entities/parking-lot.entity';

/**
 * Opening times are local times in Iraq. Working them out in this time zone
 * (instead of the server's) keeps them correct when the server runs in UTC.
 */
const LOT_TIME_ZONE = 'Asia/Baghdad';
const MINUTES_PER_DAY = 24 * 60;

const clockFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: LOT_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});

/** "08:30" -> 510 */
function toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/** Minutes since local midnight for this moment. */
function localMinutesOfDay(date: Date): number {
    const parts = clockFormat.formatToParts(date);
    const value = (type: 'hour' | 'minute') => Number(parts.find((part) => part.type === type)?.value);
    return value('hour') * 60 + value('minute');
}

/**
 * True if the lot is open for the whole period from `start` to `end`.
 * Handles lots that close after midnight (e.g. 18:00-02:00).
 */
export function isOpenDuring(
    lot: Pick<ParkingLot, 'is_open_24h' | 'opening_time' | 'closing_time'>,
    start: Date,
    end: Date,
): boolean {
    if (lot.is_open_24h) return true;

    const open = toMinutes(lot.opening_time);
    const close = toMinutes(lot.closing_time);
    if (open === close) return true; // e.g. 00:00-00:00: open all day

    const now = localMinutesOfDay(start);
    let minutesUntilClose: number;

    if (open < close) {
        // Same-day hours, e.g. 08:00-22:00.
        if (now < open || now >= close) return false;
        minutesUntilClose = close - now;
    } else {
        // Overnight hours, e.g. 18:00-02:00.
        if (now >= close && now < open) return false;
        minutesUntilClose = now >= open ? MINUTES_PER_DAY - now + close : close - now;
    }

    const bookedMinutes = (end.getTime() - start.getTime()) / 60_000;
    return bookedMinutes <= minutesUntilClose;
}
