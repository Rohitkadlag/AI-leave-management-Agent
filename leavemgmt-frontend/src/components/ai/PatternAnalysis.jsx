// TODO: Add component content here
import React, { useState } from 'react';
import {
  ChartBarIcon,
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useAI } from '../../hooks/useAI';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const PatternAnalysis = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [timeframe, setTimeframe] = useState(90);
  const [analysis, setAnalysis] = useState(null);
  const { analyzePatterns, loading } = useAI();
  const { user } = useAuth();

  const handleAnalyze = async () => {
    try {
      const employeeId = selectedEmployeeId || user.userId;
      const result = await analyzePatterns(employeeId, timeframe);
      setAnalysis(result);
    } catch (error) {
      console.error('Pattern analysis failed:', error);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <ChartBarIcon className="h-6 w-6 text-primary-600 mr-2" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Leave Pattern Analysis</h2>
          <p className="text-sm text-gray-600">AI-powered insights into leave taking patterns</p>
        </div>
      </div>

      {/* Analysis Form */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Analysis</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee (Optional)</label>
              <input
                type="text"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                placeholder="Enter employee ID (leave blank for yourself)"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank to analyze your own patterns</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe (Days)</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(Number(e.target.value))}
              className="input-field"
            >
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
              <option value={180}>Last 6 months</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>

        <button onClick={handleAnalyze} disabled={loading} className="btn-primary">
          {loading ? (
            <LoadingSpinner size="small" text="" />
          ) : (
            <>
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Analyze Patterns
            </>
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis ? (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Risk Level</p>
                  <p
                    className={`text-lg font-bold px-3 py-1 rounded-full ${getRiskColor(
                      analysis.analysis?.riskLevel
                    )}`}
                  >
                    {(analysis.analysis?.riskLevel || 'UNKNOWN').toUpperCase()}
                  </p>
                </div>
                <ExclamationTriangleIcon className="h-8 w-8 text-gray-400" />
              </div>
            </div>

            {typeof analysis.analysis?.healthScore === 'number' && (
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Health Score</p>
                    <p
                      className={`text-2xl font-bold ${getHealthScoreColor(
                        analysis.analysis.healthScore
                      )}`}
                    >
                      {analysis.analysis.healthScore}/10
                    </p>
                  </div>
                  <UserIcon className="h-8 w-8 text-gray-400" />
                </div>
              </div>
            )}

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Analysis Period</p>
                <p className="text-lg font-bold text-gray-900">{analysis.timeframe} days</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Patterns */}
          {Array.isArray(analysis.analysis?.patterns) && analysis.analysis.patterns.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Observed Patterns</h3>
              <div className="space-y-3">
                {analysis.analysis.patterns.map((pattern, index) => (
                  <div key={index} className="flex items-start">
                    <div className="h-2 w-2 bg-primary-500 rounded-full mt-2 mr-3" />
                    <p className="text-gray-700">{pattern}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Predictions */}
          {Array.isArray(analysis.analysis?.predictions) && analysis.analysis.predictions.length > 0 && (
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">🔮</span>
                <h3 className="text-lg font-semibold text-blue-900">AI Predictions</h3>
              </div>
              <div className="space-y-4">
                {analysis.analysis.predictions.map((prediction, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border">
                    <p className="text-blue-900 font-medium">
                      {prediction.period || `Prediction ${index + 1}`}
                    </p>
                    <p className="text-blue-800 mt-1">
                      {prediction.reasoning || prediction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {Array.isArray(analysis.analysis?.recommendations) &&
            analysis.analysis.recommendations.length > 0 && (
              <div className="card bg-green-50 border-green-200">
                <div className="flex items-center mb-4">
                  <InformationCircleIcon className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-green-900">Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {analysis.analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start">
                      <div className="h-2 w-2 bg-green-500 rounded-full mt-2 mr-3" />
                      <p className="text-green-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Analysis Metadata */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Analysis generated on{' '}
              {new Date(analysis.analyzedAt).toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="card text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Yet</h3>
            <p className="text-gray-600">
              Generate an AI-powered pattern analysis to see insights.
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default PatternAnalysis;
