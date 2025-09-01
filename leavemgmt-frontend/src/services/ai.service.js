// TODO: Add component content here
import api from './api';

class AIService {
  async chatWithAI(message, context = {}) {
    const response = await api.post('/ai/chat', { message, context });
    return response.data;
  }

  async analyzePatterns(employeeId, timeframe = 90) {
    const response = await api.post('/ai/analyze-patterns', { 
      employeeId, 
      timeframe 
    });
    return response.data;
  }

  async getAIInsights(limit = 10) {
    const response = await api.get(`/ai/insights?limit=${limit}`);
    return response.data;
  }
}

export default new AIService();