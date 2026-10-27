import { NotFoundException } from '@nestjs/common';

import type { TranslationService } from 'src/i18n/translation.service';
import type { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import {
  averageMinutes,
  type GarageStatsService,
} from 'src/parking/garage-stats.service';
import { GaragePortalService } from './garage-portal.service';

describe('GaragePortalService', () => {
  const LOT = {
    id: 5,
    name: 'City Center Parking',
    city: 'Sulaymaniyah',
    status: 'approved',
  };
  let lookups: Record<string, unknown>[];
  let service: GaragePortalService;

  beforeEach(() => {
    lookups = [];
    const lotModel = {
      findOne: ({ where }: { where: Record<string, unknown> }) => {
        lookups.push(where);
        // Only owner 6 owns lot 5.
        return Promise.resolve(
          where.id === 5 && where.owner_id === 6 ? LOT : null,
        );
      },
      findAll: () => Promise.resolve([LOT]),
    } as unknown as typeof ParkingLot;
    const stats = {
      slotsByLevel: () =>
        Promise.resolve([
          { level: 'G', total: 8, taken: 7 },
          { level: 'B1', total: 12, taken: 1 },
        ]),
      revenueBetween: (_id: number, from: Date) =>
        // Today's window starts later than yesterday's.
        Promise.resolve(from.getTime() > Date.now() - 86_400_000 ? 7500 : 3000),
      activeBookings: () => Promise.resolve({ active: 2, ending_soon: 1 }),
      averageStayMinutes: (_id: number, from: Date) =>
        Promise.resolve(
          from.getTime() > Date.now() - 8 * 86_400_000 ? 135 : 143,
        ),
      paidBookingsBetween: () => Promise.resolve([]),
      recentBookings: () => Promise.resolve([]),
    } as unknown as GarageStatsService;
    const translations = {
      translate: (key: string) => key,
    } as unknown as TranslationService;
    service = new GaragePortalService(lotModel, stats, translations);
  });

  it("only opens the owner's own garages", async () => {
    await expect(service.dashboard(6, 5)).resolves.toMatchObject({
      garage: { id: 5, name: 'City Center Parking' },
    });
    // Someone else's garage looks exactly like one that doesn't exist.
    await expect(service.dashboard(7, 5)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(lookups.at(-1)).toEqual({ id: 5, owner_id: 7, is_available: true });
  });

  it('adds up the dashboard figures', async () => {
    const dashboard = await service.dashboard(6, 5);
    expect(dashboard.occupancy).toEqual({ taken: 8, total: 20 });
    expect(dashboard.revenue_today).toEqual({ today: 7500, yesterday: 3000 });
    expect(dashboard.active_bookings).toEqual({ active: 2, ending_soon: 1 });
    expect(dashboard.average_stay).toEqual({
      last_7_days: 135,
      previous_7_days: 143,
    });
    expect(dashboard.revenue_days).toHaveLength(7);
  });
});

describe('averageMinutes', () => {
  it('uses the real end when parking ended early', () => {
    const start = new Date('2026-10-20T08:00:00Z');
    expect(
      averageMinutes([
        // Booked 3 h, ended after 1 h.
        {
          start_time: start,
          end_time: new Date('2026-10-20T11:00:00Z'),
          ended_at: new Date('2026-10-20T09:00:00Z'),
        },
        // Booked and stayed 2 h.
        {
          start_time: start,
          end_time: new Date('2026-10-20T10:00:00Z'),
          ended_at: null,
        },
      ]),
    ).toBe(90);
    expect(averageMinutes([])).toBeNull();
  });
});
