export default () => ({
    saltRounds: parseInt(process.env.SALT_ROUNDS as string) || 10,
    pepper_secret: process.env.PEPPER_SECRET as string || 'default_pepper_secret'
});