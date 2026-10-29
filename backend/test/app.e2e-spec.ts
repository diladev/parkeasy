import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

/*
 * The real API against a real MySQL database, with the demo data from
 * `npm run seed`: the same modules, guards, validation and translations as
 * the running server. CI runs this after seeding a fresh database.
 */

const PASSWORD = 'Demo@1234';

describe('ParkEasy API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const nestApp = moduleRef.createNestApplication<NestExpressApplication>({
      rawBody: true,
    });
    configureApp(nestApp);
    await nestApp.init();
    app = nestApp;
  });

  afterAll(async () => {
    await app.close();
  });

  const api = () => request(app.getHttpServer());

  async function signIn(
    email: string,
    portal?: 'admin' | 'garage',
  ): Promise<string> {
    const response = await api()
      .post('/user/local/login')
      .send({ email, password: PASSWORD, ...(portal && { portal }) })
      .expect(200);
    const body = response.body as { accessToken: string };
    return body.accessToken;
  }

  describe('the server', () => {
    it('answers the health check', async () => {
      const response = await api().get('/health').expect(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('signing in', () => {
    it('signs a driver in and says who they are', async () => {
      const token = await signIn('aram@example.com');
      const me = await api()
        .get('/user/local/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(me.body).toMatchObject({
        user: { email: 'aram@example.com' },
        role: 'driver',
        permissions: [],
      });
      // Secrets never leave the server.
      expect(JSON.stringify(me.body)).not.toMatch(/password|refresh_token/);
    });

    it('stays signed in on two devices, and signs out only the one that asks', async () => {
      // The refresh token comes back in the Set-Cookie header.
      const signIn = async () => {
        const response = await api()
          .post('/user/local/login')
          .send({ email: 'shilan@example.com', password: PASSWORD })
          .expect(200);
        const cookies = ([] as string[]).concat(
          response.headers['set-cookie'] ?? [],
        );
        const cookie = cookies.find((c) => c.startsWith('refreshToken='))!;
        return {
          cookie: cookie.split(';')[0],
          access: (response.body as { accessToken: string }).accessToken,
        };
      };
      const refresh = (cookie: string) =>
        api().post('/user/local/refresh').set('Cookie', cookie);

      const phone = await signIn();
      const browser = await signIn();

      // Signing in on the browser didn't end the phone's session.
      await refresh(phone.cookie).expect(200);
      // Each refresh token works once: the old one coming back is refused,
      // and ends that (phone) session, in case it was copied.
      await refresh(phone.cookie).expect(401);

      // Signing the browser out leaves another device signed in.
      const tablet = await signIn();
      await api()
        .post('/user/local/logout')
        .set('Authorization', `Bearer ${browser.access}`)
        .expect(200);
      await refresh(browser.cookie).expect(401);
      await refresh(tablet.cookie).expect(200);
    });

    it('answers in Kurdish when asked to', async () => {
      const response = await api()
        .post('/user/local/login')
        .set('x-lang', 'ckb')
        .send({ email: 'aram@example.com', password: 'Wrong@1234' })
        .expect(401);
      const body = response.body as { message: string };
      expect(body.message).toMatch(/[؀-ۿ]/);
    });

    it('keeps a suspended account out', async () => {
      await api()
        .post('/user/local/login')
        .send({ email: 'hemin@example.com', password: PASSWORD })
        .expect(403);
    });

    it('rejects bad input with translated validation messages', async () => {
      const response = await api()
        .post('/user/local/login')
        .send({ email: 'not-an-email', password: PASSWORD, role: 'admin' })
        .expect(400);
      const body = response.body as { message: string[] };
      expect(body.message).toEqual(
        expect.arrayContaining(['property role should not exist']),
      );
    });
  });

  describe('the mobile app', () => {
    it('finds only approved garages nearby', async () => {
      const token = await signIn('karwan@example.com');
      const response = await api()
        .get('/parking/nearby?lat=35.5571&lng=45.4356&radius=50')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const body = response.body as {
        data: { name: string; status?: string }[];
      };
      const names = body.data.map((lot) => lot.name);
      expect(names).toContain('City Center Parking');
      // Pending (Zagros) and suspended (Sarchinar) garages stay hidden.
      expect(names).not.toContain('Zagros Park Deck');
      expect(names).not.toContain('Sarchinar Night Parking');
      expect(JSON.stringify(body)).not.toContain('owner_id');
    });
  });

  describe('the Admin Panel', () => {
    it('lets only admins in', async () => {
      await api()
        .post('/user/local/login')
        .send({
          email: 'aram@example.com',
          password: PASSWORD,
          portal: 'admin',
        })
        .expect(403);

      const driver = await signIn('aram@example.com');
      await api()
        .get('/admin/overview')
        .set('Authorization', `Bearer ${driver}`)
        .expect(403);
      await api().get('/admin/overview').expect(401);
    });

    it('shows the overview, garages and users to an admin', async () => {
      const admin = await signIn('admin@parkeasy.app', 'admin');
      const auth = { Authorization: `Bearer ${admin}` };

      const overview = await api().get('/admin/overview').set(auth).expect(200);
      expect(overview.body).toMatchObject({ garages: { pending: 2 } });

      const garages = await api()
        .get('/admin/garages?status=pending')
        .set(auth)
        .expect(200);
      const garageNames = (
        garages.body as { data: { name: string }[] }
      ).data.map((garage) => garage.name);
      expect(garageNames).toEqual(['Ankawa Mall Parking', 'Zagros Park Deck']);

      const users = await api()
        .get('/admin/users?role=garage_owner')
        .set(auth)
        .expect(200);
      expect(users.body).toMatchObject({ counts: { garage_owner: 5 } });
    });
  });

  describe('the Garage Portal', () => {
    it('lets only garage owners in', async () => {
      await api()
        .post('/user/local/login')
        .send({
          email: 'admin@parkeasy.app',
          password: PASSWORD,
          portal: 'garage',
        })
        .expect(403);

      const admin = await signIn('admin@parkeasy.app', 'admin');
      await api()
        .get('/garage/garages')
        .set('Authorization', `Bearer ${admin}`)
        .expect(403);
      await api().get('/garage/garages').expect(401);
    });

    it("shows an owner their own garages and nobody else's", async () => {
      const sardar = await signIn('sardar@example.com', 'garage');
      const auth = { Authorization: `Bearer ${sardar}` };

      const list = await api().get('/garage/garages').set(auth).expect(200);
      const garages = list.body as { id: number; name: string }[];
      expect(garages.map((garage) => garage.name)).toEqual([
        'Bakhtiari Plaza Parking',
        'City Center Parking',
      ]);

      const cityCenter = garages[1];
      const dashboard = await api()
        .get(`/garage/garages/${cityCenter.id}/dashboard`)
        .set(auth)
        .expect(200);
      expect(dashboard.body).toMatchObject({
        garage: { name: 'City Center Parking' },
        occupancy: { total: 28 },
      });
      const body = dashboard.body as { revenue_days: unknown[] };
      expect(body.revenue_days).toHaveLength(7);
      // Customers appear by name only.
      expect(JSON.stringify(dashboard.body)).not.toMatch(/email|phone/);

      // Another owner gets the same 404 as a garage that doesn't exist.
      const rawand = await signIn('rawand@example.com', 'garage');
      await api()
        .get(`/garage/garages/${cityCenter.id}/dashboard`)
        .set('Authorization', `Bearer ${rawand}`)
        .expect(404);
      await api()
        .get(`/garage/garages/${cityCenter.id}/slots`)
        .set('Authorization', `Bearer ${rawand}`)
        .expect(404);
    });

    it("blocks a free slot, puts it back, and never touches a driver's booking", async () => {
      const sardar = await signIn('sardar@example.com', 'garage');
      const auth = { Authorization: `Bearer ${sardar}` };
      const list = await api().get('/garage/garages').set(auth).expect(200);
      const cityCenter = (list.body as { id: number; name: string }[]).find(
        (garage) => garage.name === 'City Center Parking',
      )!;
      const base = `/garage/garages/${cityCenter.id}/slots`;

      type Slot = { id: number; status: string; booking: unknown };
      const live = await api().get(base).set(auth).expect(200);
      const slots = (live.body as { slots: Slot[] }).slots;
      const free = slots.find((slot) => slot.status === 'free')!;
      const booked = slots.find(
        (slot) =>
          (slot.booking as { source?: string } | null)?.source === 'app',
      )!;
      expect(booked.status).toBe('reserved');
      expect(JSON.stringify(live.body)).not.toMatch(/email|phone/);

      const blocked = await api()
        .post(`${base}/${free.id}/block`)
        .set(auth)
        .expect(200);
      expect(blocked.body).toMatchObject({ slot: { status: 'blocked' } });
      // Out of service: drivers see it taken, and can't book it.
      const driverView = await api()
        .get(`/parking/${cityCenter.id}/slots`)
        .set(auth)
        .expect(200);
      const seen = (driverView.body as Slot[]).find((s) => s.id === free.id);
      expect(seen?.status).toBe('blocked');

      await api().post(`${base}/${free.id}/release`).set(auth).expect(200);

      await api().post(`${base}/${booked.id}/release`).set(auth).expect(409);
      await api().post(`${base}/${booked.id}/block`).set(auth).expect(409);
    });

    it("lists a garage's app bookings and walk-ins, with search and filters", async () => {
      const sardar = await signIn('sardar@example.com', 'garage');
      const auth = { Authorization: `Bearer ${sardar}` };
      const list = await api().get('/garage/garages').set(auth).expect(200);
      const cityCenter = (list.body as { id: number; name: string }[]).find(
        (garage) => garage.name === 'City Center Parking',
      )!;
      const base = `/garage/garages/${cityCenter.id}/bookings`;
      type Page = {
        data: { source: string; customer: { name: string } | null }[];
        meta: { totalItems: number };
      };

      const all = (await api().get(base).set(auth).expect(200)).body as Page;
      const sources = new Set(all.data.map((row) => row.source));
      expect(sources).toEqual(new Set(['app', 'walk_in']));

      const walkIns = (
        await api().get(`${base}?source=walk_in`).set(auth).expect(200)
      ).body as Page;
      expect(walkIns.data.every((row) => row.source === 'walk_in')).toBe(true);
      expect(walkIns.meta.totalItems).toBeLessThan(all.meta.totalItems);

      // A name, and a plate typed without its spaces.
      const aram = (await api().get(`${base}?q=aram`).set(auth).expect(200))
        .body as Page;
      expect(aram.data.map((row) => row.customer?.name)).toContain(
        'Aram Hassan',
      );
      const plate = (
        await api().get(`${base}?q=22sul48213`).set(auth).expect(200)
      ).body as Page;
      expect(plate.meta.totalItems).toBeGreaterThan(0);

      await api().get(`${base}?status=nope`).set(auth).expect(400);
      const rawand = await signIn('rawand@example.com', 'garage');
      await api()
        .get(base)
        .set('Authorization', `Bearer ${rawand}`)
        .expect(404);
    });

    it('saves lot settings, checks the price rules, and prices new stays by them', async () => {
      const sardar = await signIn('sardar@example.com', 'garage');
      const auth = { Authorization: `Bearer ${sardar}` };
      const list = await api().get('/garage/garages').set(auth).expect(200);
      const cityCenter = (list.body as { id: number; name: string }[]).find(
        (garage) => garage.name === 'City Center Parking',
      )!;
      const url = `/garage/garages/${cityCenter.id}/settings`;

      type Override = {
        label: string;
        start_date: string;
        end_date: string;
        price_per_hour: number;
        daily_cap: number | null;
      };
      type Settings = Record<string, unknown> & {
        price_per_hour: number;
        daily_cap: number | null;
        total_slots: number;
        price_overrides: (Override & { id: number })[];
        today: string;
      };
      const before = (await api().get(url).set(auth).expect(200))
        .body as Settings;
      expect(before).toMatchObject({
        name: 'City Center Parking',
        price_per_hour: 1500,
        daily_cap: 9000,
      });
      expect(before.price_overrides.map((rule) => rule.label)).toEqual([
        'Weekend market',
        'Newroz',
      ]);
      const {
        id: _id,
        status: _status,
        total_slots: _slots,
        today,
        ...body
      } = before;
      const asSent = (rules: Override[]) => ({
        ...body,
        price_overrides: rules,
      });
      const saved = before.price_overrides.map(
        ({ id: _ruleId, ...rule }) => rule,
      );

      // A cap below one hour's price, and two special prices on the same day.
      const lowCap = await api()
        .put(url)
        .set(auth)
        .send({ ...asSent(saved), daily_cap: 1000 })
        .expect(400);
      expect((lowCap.body as { message: string }).message).toBe(
        "The daily cap can't be lower than one hour's price.",
      );
      await api()
        .put(url)
        .set(auth)
        .send(asSent([...saved, { ...saved[0], label: 'Twice' }]))
        .expect(400);
      await api()
        .put(url)
        .set(auth)
        .send(asSent([{ ...saved[0], start_date: '2026-13-01' }]))
        .expect(400);

      // Today and tomorrow cost 3,000 an hour, at most 5,000 a day.
      const tomorrow = new Date(Date.parse(today) + 86_400_000)
        .toISOString()
        .slice(0, 10);
      const match = {
        label: 'Match day',
        start_date: today,
        end_date: tomorrow,
        price_per_hour: 3000,
        daily_cap: 5000,
      };
      const ok = await api()
        .put(url)
        .set(auth)
        .send(asSent([match, ...saved]))
        .expect(200);
      expect(ok.body).toMatchObject({
        message: expect.stringContaining('Settings saved') as string,
        settings: { price_overrides: [match, ...saved] },
      });

      // A driver's quote follows it, day by day.
      const driver = await signIn('karwan@example.com');
      const quote = (
        await api()
          .get(`/parking/${cityCenter.id}/quote?hours=4`)
          .set('Authorization', `Bearer ${driver}`)
          .expect(200)
      ).body as {
        hours: number;
        amount: number;
        days: { hours: number; amount: number; label: string | null }[];
      };
      expect(quote.hours).toBe(4);
      for (const day of quote.days) {
        expect(day.label).toBe('Match day');
        expect(day.amount).toBe(Math.min(day.hours * 3000, 5000));
      }
      expect(quote.amount).toBe(
        quote.days.reduce((sum, day) => sum + day.amount, 0),
      );
      await api()
        .get(`/parking/${cityCenter.id}/quote?hours=0`)
        .set('Authorization', `Bearer ${driver}`)
        .expect(400);

      // Another owner can't see or change it; then put everything back.
      const rawand = await signIn('rawand@example.com', 'garage');
      await api()
        .put(url)
        .set('Authorization', `Bearer ${rawand}`)
        .send(asSent(saved))
        .expect(404);
      await api().put(url).set(auth).send(asSent(saved)).expect(200);
    });

    it('starts a walk-in on a free slot, charges it at the exit and frees the slot', async () => {
      const sardar = await signIn('sardar@example.com', 'garage');
      const auth = { Authorization: `Bearer ${sardar}` };
      const list = await api().get('/garage/garages').set(auth).expect(200);
      const cityCenter = (list.body as { id: number; name: string }[]).find(
        (garage) => garage.name === 'City Center Parking',
      )!;
      const garage = `/garage/garages/${cityCenter.id}`;

      type Slot = {
        id: number;
        status: string;
        booking: { id: number; source: string; plate: string | null } | null;
      };
      const live = await api().get(`${garage}/slots`).set(auth).expect(200);
      const slots = (live.body as { slots: Slot[] }).slots;
      // The demo data has cars parked without the app.
      expect(slots.some((slot) => slot.booking?.source === 'walk_in')).toBe(
        true,
      );
      const free = slots.find((slot) => slot.status === 'free')!;

      const bad = await api()
        .post(`${garage}/slots/${free.id}/walk-in`)
        .set(auth)
        .send({ plate: '!' })
        .expect(400);
      expect(JSON.stringify(bad.body)).toContain('plate');

      const started = await api()
        .post(`${garage}/slots/${free.id}/walk-in`)
        .set(auth)
        .send({ plate: ' 22 sul 909 ' })
        .expect(200);
      const walkIn = (started.body as { slot: Slot }).slot;
      expect(walkIn).toMatchObject({
        status: 'occupied',
        booking: { source: 'walk_in', plate: '22 SUL 909' },
      });
      // The slot is taken: no second walk-in, no "mark as free".
      await api()
        .post(`${garage}/slots/${free.id}/walk-in`)
        .set(auth)
        .send({ plate: '22 SUL 910' })
        .expect(409);
      await api()
        .post(`${garage}/slots/${free.id}/release`)
        .set(auth)
        .expect(409);

      const ended = await api()
        .post(`${garage}/walk-ins/${walkIn.booking!.id}/end`)
        .set(auth)
        .send({ payment_method: 'cash' })
        .expect(200);
      expect(ended.body).toMatchObject({
        charge: { hours: 1 },
        slot: { status: 'free', booking: null },
      });
      await api()
        .post(`${garage}/walk-ins/${walkIn.booking!.id}/end`)
        .set(auth)
        .send({ payment_method: 'cash' })
        .expect(409);
    });
  });
});
