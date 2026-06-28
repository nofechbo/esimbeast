// Shared vocabulary for the managed-eSIM auto-refill engine.
// Keep these in sync with the EsimLifecycle model in prisma/schema.prisma.

export const ENTITLEMENT_TYPE = {
  METERED: "metered", // a fixed allowance, e.g. "10GB / 30 days"
  UNLIMITED: "unlimited", // "unlimited" capped by a fair-use ceiling
};

export const LIFECYCLE_STATE = {
  PROVISIONED: "provisioned", // base eSIM ordered, not yet seen in use
  ACTIVE: "active", // in use, being polled & topped up
  REFILLING: "refilling", // a top-up is in flight (guards against double-topup)
  CAPPED: "capped", // hit the entitlement / fair-use ceiling — stop topping up
  EXPIRED: "expired", // entitlement window closed — stop topping up
  FAILED: "failed", // a top-up failed repeatedly — needs human attention
};

// The action the pure engine asks the worker to take this tick.
export const REFILL_ACTION = {
  NONE: "none", // nothing to do; just (maybe) reschedule the next poll
  ACTIVATE: "activate", // first usage seen — stamp activatedAt / expiresAt
  TOPUP: "topup", // routine paid top-up before a ceiling
  SAFETY_TOPUP: "safety_topup", // gift is late and user is near the managed ceiling — cover it
  CAP: "cap", // entitlement / fair-use cap reached
  EXPIRE: "expire", // window elapsed
};

// EA reports bytes; we work in MB internally (decimal SI, matching the platform
// adapter: 1 MB = 1_000_000 bytes, 1 GB = 1000 MB).
export const BYTES_PER_MB = 1_000_000;
export const MB_PER_GB = 1000;

export const mbToBytes = (mb) => Math.round(mb * BYTES_PER_MB);
export const bytesToMb = (bytes) => Math.round((bytes ?? 0) / BYTES_PER_MB);
export const gbToMb = (gb) => Math.round(gb * MB_PER_GB);
