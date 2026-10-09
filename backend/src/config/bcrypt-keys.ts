export default () => {
    const pepper = process.env.PEPPER_SECRET;

    if (!pepper && process.env.NODE_ENV === 'production') {
        throw new Error('PEPPER_SECRET must be set in production.');
    }

    return {
        salt_rounds: parseInt(process.env.SALT_ROUNDS ?? '', 10) || 10,
        pepper_secret: pepper || 'dev_only_pepper_secret',
    };
};
