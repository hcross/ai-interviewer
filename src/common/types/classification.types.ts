export enum Classification {
  PUBLIC = 'PUBLIC',
  CONFIDENTIAL = 'CONFIDENTIAL',
  SECRET = 'SECRET',
  TOP_SECRET = 'TOP_SECRET',
}

export enum MandateStatus {
  PENDING = 'PENDING',
  INITIATED = 'INITIATED',
  RESPONDED = 'RESPONDED',
  COMPLETED = 'COMPLETED',
  REFUSED = 'REFUSED',
  TIMEOUT = 'TIMEOUT',
  CANCELLED = 'CANCELLED',
  IDENTITY_UNRESOLVED = 'IDENTITY_UNRESOLVED',
}

export const CLASSIFICATION_RETENTION_DAYS: Record<Classification, number> = {
  [Classification.PUBLIC]: 365,
  [Classification.CONFIDENTIAL]: 180,
  [Classification.SECRET]: 90,
  [Classification.TOP_SECRET]: 0, // Purge immediately after delivery
};
