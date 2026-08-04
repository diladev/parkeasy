export default () => ({
    refresh_token_expiration: parseInt(process.env.JWT_REFRESH_EXPIRATION_TIME as string) || 3600,
    access_token_expiration: parseInt(process.env.JWT_ACCESS_EXPIRATION_TIME as string) || 900,
});