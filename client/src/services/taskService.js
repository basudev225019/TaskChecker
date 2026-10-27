import { request } from './api.js';

export const taskService = {
  list({ page = 1, limit = 50 } = {}) {
    return request(`/tasks?page=${page}&limit=${limit}`);
  },
  create({ title, dueDate }) {
    return request('/tasks', { method: 'POST', body: { title, dueDate: dueDate || null } });
  },
  update(id, changes) {
    return request(`/tasks/${id}`, { method: 'PATCH', body: changes });
  },
  remove(id) {
    return request(`/tasks/${id}`, { method: 'DELETE' });
  },
};
