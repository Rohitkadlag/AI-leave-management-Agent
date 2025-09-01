// TODO: Add component content here
import { useState, useCallback } from 'react';
import aiService from '../services/ai.service';
import { useApi } from './useApi';

export const useAI = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const { loading, execute } = useApi();

  const sendChatMessage = useCallback(async (message, context = {}) => {
    // Add user message to history immediately
    const userMessage = { 
      role: 'user', 
      content: message, 
      timestamp: new Date().toISOString() 
    };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      const response = await execute(
        () => aiService.chatWithAI(message, context),
        { showErrorToast: true }
      );

      // Add AI response to history
      const aiMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp || new Date().toISOString(),
        helpful: response.helpful
      };
      setChatHistory(prev => [...prev, aiMessage]);

      return response;
    } catch (error) {
      // Remove user message if AI response failed
      setChatHistory(prev => prev.slice(0, -1));
      throw error;
    }
  }, [execute]);

  const analyzePatterns = useCallback(async (employeeId, timeframe = 90) => {
    return await execute(
      () => aiService.analyzePatterns(employeeId, timeframe),
      { 
        showSuccessToast: true, 
        successMessage: 'Pattern analysis completed!' 
      }
    );
  }, [execute]);

  const getAIInsights = useCallback(async (limit = 10) => {
    try {
      const data = await aiService.getAIInsights(limit);
      setInsights(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      throw error;
    }
  }, []);

  const clearChatHistory = useCallback(() => {
    setChatHistory([]);
  }, []);

  return {
    chatHistory,
    insights,
    loading,
    sendChatMessage,
    analyzePatterns,
    getAIInsights,
    clearChatHistory
  };
};