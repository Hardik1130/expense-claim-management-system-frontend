import api from './api'

export const getUsers = (params = {}) => {
  return api.get('/manager/users', { params })
}

export const getUser = (id) => {
  return api.get(`/manager/users/${id}`)
}

export const updateUserStatus = (id, active) => {
  return api.patch(`/manager/users/${id}/status`, { active })
}