/**
 * TLS options for a hosted MySQL. `ca` is the provider's CA certificate (PEM),
 * as one environment variable; a literal \n stands for a line break, because many
 * hosts only take single-line values. Without a CA, the system's trusted
 * certificates are used.
 */
export function databaseSsl(ca?: string): {
  rejectUnauthorized: true;
  ca?: string;
} {
  const pem = ca?.trim().replace(/\\n/g, '\n');
  return { rejectUnauthorized: true, ...(pem && { ca: pem }) };
}
