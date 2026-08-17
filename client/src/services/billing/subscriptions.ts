/**
 * Subscription state lives in Supabase. The UI reads entitlements;
 * Razorpay webhooks write status. Never trust checkout.handler alone.
 */
export const subscriptionSource = "supabase" as const;
