import api from './api';

export const getClaims = (params) =>
    api.get('/claims', { params });

export const getClaim = (id) =>
    api.get(`/claims/${id}`);

export const getManagerClaim = (id) =>
    api.get(`/manager/claims/${id}`);

export const updateClaim = (id, data) =>
    api.put(`/claims/${id}`, data);

export const deleteClaim = (id) =>
    api.delete(`/claims/${id}`);

export const getManagerClaims = (params) =>
    api.get('/manager/claims', { params });

export const getPendingClaims = (params) => {
  return api.get('/manager/claims/pending', { params })
}

export const approveClaim = (claimId, comment) => {
  return api.patch(`/manager/claims/${claimId}/approve`, { comment })
}

export const rejectClaim = (claimId, comment) => {
  return api.patch(`/manager/claims/${claimId}/reject`, { comment })
}




export const createClaim = (data) => {
  return api.post('/claims', data)
}

export const getMyClaims = (params) => {
  return api.get('/claims', { params })
}

export const getClaimDetails = (claimId) => {
  return api.get(`/claims/${claimId}`)
}

export const submitClaim = (claimId) => {
  return api.patch(`/claims/${claimId}/submit`)
}