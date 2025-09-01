// TODO: Add component content here
import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { 
  BoltIcon, 
  ChartBarIcon, 
  LightBulbIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';
import AIChat from '../components/ai/AIChat';
import PatternAnalysis from '../components/ai/PatternAnalysis';
import AIInsights from '../components/leaves/AIInsights';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/constants';

const AIAssistant = () => {
  const { user } = useAuth();
  
  const tabs = [
    {
      name: 'Chat Assistant',
      icon: ChatBubbleLeftRightIcon,
      component: AIChat,
      description: 'Ask questions about leave policies and procedures',
      roles: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN]
    },
    {
      name: 'Pattern Analysis',
      icon: ChartBarIcon,
      component: PatternAnalysis,
      description: 'Analyze leave taking patterns and trends',
      roles: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN]
    },
    {
      name: 'AI Insights',
      icon: LightBulbIcon,
      component: AIInsights,
      description: 'Get AI-powered insights on pending requests',
      roles: [ROLES.MANAGER, ROLES.ADMIN]
    }
  ];

  const availableTabs = tabs.filter(tab => tab.roles.includes(user?.role));

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <BoltIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
            <p className="text-gray-600">Powered by advanced AI to help with leave management</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <BoltIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">AI-Powered Features</h3>
              <div className="mt-2 text-sm text-blue-800">
                <ul className="list-disc list-inside space-y-1">
                  <li>Intelligent leave request analysis and recommendations</li>
                  <li>Natural language chat for policy questions</li>
                  <li>Pattern recognition for better workforce planning</li>
                  <li>Automated insights and priority suggestions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
          {availableTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                   ${selected
                     ? 'bg-white text-primary-700 shadow'
                     : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-900'
                   }`
                }
              >
                <div className="flex items-center justify-center">
                  <IconComponent className="h-4 w-4 mr-2" />
                  {tab.name}
                </div>
              </Tab>
            );
          })}
        </Tab.List>

        <Tab.Panels>
          {availableTabs.map((tab) => {
            const Component = tab.component;
            return (
              <Tab.Panel
                key={tab.name}
                className="rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <div className="mb-4">
                  <p className="text-gray-600">{tab.description}</p>
                </div>
                <Component />
              </Tab.Panel>
            );
          })}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default AIAssistant;