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

  async function signIn(email: string, portal?: 'admin'): Promise<string> {
    const response = await api()
      .post('/user/local/login')
      .send({ email, password: PASSWORD, ...(portal && { portal }) })
      .expect(200);
    const body = response.body as { accessToken: string };
    return body.accessToken;
  }

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
});
