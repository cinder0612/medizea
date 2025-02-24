export function validateStripeConfig() {
  const requiredEnvVars = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  }

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    )
  }

  // Validate NEXT_PUBLIC_SITE_URL format
  try {
    new URL(process.env.NEXT_PUBLIC_SITE_URL!)
  } catch {
    throw new Error('NEXT_PUBLIC_SITE_URL must be a valid URL')
  }
}
