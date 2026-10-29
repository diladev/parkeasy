import { databaseSsl } from './database-ssl';

describe('databaseSsl', () => {
  it('always checks the server certificate', () => {
    expect(databaseSsl()).toEqual({ rejectUnauthorized: true });
    expect(databaseSsl('  ')).toEqual({ rejectUnauthorized: true });
  });

  it('turns a one-line CA (\\n for line breaks) back into a PEM', () => {
    expect(
      databaseSsl(
        '-----BEGIN CERTIFICATE-----\\nABC\\n-----END CERTIFICATE-----',
      ),
    ).toEqual({
      rejectUnauthorized: true,
      ca: '-----BEGIN CERTIFICATE-----\nABC\n-----END CERTIFICATE-----',
    });
  });
});
