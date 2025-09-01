import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Leave Management API',
      version: '1.0.0',
      description: 'AI-powered Leave Management System API'
    },
    servers: [
      {
        url: env.APP_BASE_URL,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
            managerId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        LeaveRequest: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            employeeId: { type: 'string' },
            managerId: { type: 'string' },
            type: { type: 'string', enum: ['CASUAL', 'SICK', 'EARNED', 'UNPAID'] },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            reason: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] },
            timeline: { type: 'array', items: { type: 'object' } },
            gmail: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        LoginDto: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
          }
        },
        RegisterDto: {
          type: 'object',
          required: ['email', 'password', 'name', 'role'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            name: { type: 'string', minLength: 2 },
            role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
            managerId: { type: 'string' }
          }
        },
        CreateLeaveDto: {
          type: 'object',
          required: ['type', 'startDate', 'endDate', 'reason'],
          properties: {
            type: { type: 'string', enum: ['CASUAL', 'SICK', 'EARNED', 'UNPAID'] },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            reason: { type: 'string', minLength: 10 }
          }
        },
        DecisionDto: {
          type: 'object',
          properties: {
            comment: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

export const swaggerSpec = swaggerJSDoc(options);