// TODO: Add component content here
import api from './api';

class LeaveService {
  async createLeave(leaveData) {
    const response = await api.post('/leaves', leaveData);
    return response.data;
  }

  async getMyLeaves() {
    const response = await api.get('/leaves/mine');
    return response.data;
  }

  async approveLeave(leaveId, comment = '') {
    const response = await api.post(`/leaves/${leaveId}/approve`, { comment });
    return response.data;
  }

  async rejectLeave(leaveId, comment = '') {
    const response = await api.post(`/leaves/${leaveId}/reject`, { comment });
    return response.data;
  }

  async cancelLeave(leaveId) {
    const response = await api.post(`/leaves/${leaveId}/cancel`);
    return response.data;
  }
}

export default new LeaveService();