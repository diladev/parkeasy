/** Payment providers the API can talk to. Only the built-in mock for now. */
export const PAYMENT_PROVIDERS = ['mock'] as const;
export type PaymentProviderName = (typeof PAYMENT_PROVIDERS)[number];

/**
 * Payment settings. Everything has a working default, so a fresh clone runs
 * with the mock provider and no keys. Production must set its own secret.
 */
export default () => {
  const isProduction = process.env.NODE_ENV === 'production';
  // Production has to choose on purpose: the mock lets users approve their own payments.
  if (isProduction && !process.env.PAYMENT_PROVIDER) {
    throw new Error('PAYMENT_PROVIDER must be set in production.');
  }
  const provider = process.env.PAYMENT_PROVIDER || 'mock';
  if (!(PAYMENT_PROVIDERS as readonly string[]).includes(provider)) {
    throw new Error(
      `Unknown PAYMENT_PROVIDER "${provider}". Supported: ${PAYMENT_PROVIDERS.join(', ')}.`,
    );
  }

  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!webhookSecret && isProduction) {
    throw new Error('PAYMENT_WEBHOOK_SECRET must be set in production.');
  }

  return {
    provider: provider as PaymentProviderName,
    webhook_secret: webhookSecret || 'dev_only_payment_webhook_secret',
    /** How long the customer has to approve a payment, like FIB's validUntil. */
    validity_minutes:
      parseInt(process.env.PAYMENT_VALIDITY_MINUTES ?? '', 10) || 15,
  };
};
