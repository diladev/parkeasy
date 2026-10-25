import { isAllowedRequest } from './fetch-metadata.middleware';

describe('isAllowedRequest (CSRF)', () => {
  const trusted = new Set(['https://admin.parkeasy.app']);
  const host = 'api.parkeasy.app';

  it('always allows reads', () => {
    for (const method of ['GET', 'HEAD', 'OPTIONS', 'get']) {
      expect(
        isAllowedRequest(
          {
            method,
            secFetchSite: 'cross-site',
            origin: 'https://evil.com',
            host,
          },
          trusted,
        ),
      ).toBe(true);
    }
  });

  it('allows same-origin requests and ones the user typed or bookmarked', () => {
    expect(
      isAllowedRequest(
        { method: 'POST', secFetchSite: 'same-origin', host },
        trusted,
      ),
    ).toBe(true);
    expect(
      isAllowedRequest({ method: 'POST', secFetchSite: 'none', host }, trusted),
    ).toBe(true);
  });

  it('allows a trusted portal on another origin', () => {
    expect(
      isAllowedRequest(
        {
          method: 'POST',
          secFetchSite: 'same-site',
          origin: 'https://admin.parkeasy.app',
          host,
        },
        trusted,
      ),
    ).toBe(true);
  });

  it('refuses cross-site posts from untrusted sites', () => {
    expect(
      isAllowedRequest(
        {
          method: 'POST',
          secFetchSite: 'cross-site',
          origin: 'https://evil.com',
          host,
        },
        trusted,
      ),
    ).toBe(false);
    // same-site is not enough: a sibling subdomain could be compromised
    expect(
      isAllowedRequest(
        {
          method: 'POST',
          secFetchSite: 'same-site',
          origin: 'https://blog.parkeasy.app',
          host,
        },
        trusted,
      ),
    ).toBe(false);
  });

  it('allows clients without browser headers (mobile app, webhooks)', () => {
    expect(isAllowedRequest({ method: 'POST', host }, trusted)).toBe(true);
  });

  it('falls back to comparing Origin with Host for older browsers', () => {
    expect(
      isAllowedRequest(
        { method: 'PATCH', origin: 'https://api.parkeasy.app', host },
        trusted,
      ),
    ).toBe(true);
    expect(
      isAllowedRequest(
        { method: 'PATCH', origin: 'https://evil.com', host },
        trusted,
      ),
    ).toBe(false);
    expect(
      isAllowedRequest({ method: 'PATCH', origin: 'null', host }, trusted),
    ).toBe(false);
  });
});
