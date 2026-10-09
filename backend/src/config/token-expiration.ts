/**
 * Token lifetimes in SECONDS.
 *
 * Seconds is what JWT `expiresIn` expects and what the API returns to clients
 * as `accessTokenExpiresIn` / `refreshTokenExpiresIn`. Express' `res.cookie()`
 * expects `maxAge` in MILLISECONDS, so multiply by 1000 there.
 */
export default () => ({
    access_token_expiration:
        parseInt(process.env.JWT_ACCESS_EXPIRATION_TIME ?? '', 10) || 15 * 60, // 15 minutes
    refresh_token_expiration:
        parseInt(process.env.JWT_REFRESH_EXPIRATION_TIME ?? '', 10) || 7 * 24 * 60 * 60, // 7 days
});
