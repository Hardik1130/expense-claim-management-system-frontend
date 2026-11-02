export const CLAIM_STATUS = { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED' }
export const statusLabel = s => s ? s[0] + s.slice(1).toLowerCase() : 'Unknown'
