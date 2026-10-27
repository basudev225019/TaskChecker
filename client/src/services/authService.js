import { request } from './api.js';

export const authService = {
  register({ name, email, password }) {
    return request('/auth/register', { method: 'POST', body: { name, email, password } });
  },
  login({ email, password }) {
    return request('/auth/login', { method: 'POST', body: { email, password } });
  },
};
