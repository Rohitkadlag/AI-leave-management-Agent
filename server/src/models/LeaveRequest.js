import mongoose from 'mongoose';
import { LEAVE_TYPES, LEAVE_STATUS } from '../utils/roles.js';

const timelineSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['CREATED', 'APPROVED', 'REJECTED', 'CANCELLED'],
    required: true
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const gmailSchema = new mongoose.Schema({
  threadId: String,
  requestMsgId: String,
  decisionMsgId: String
}, { _id: false });

// AI Analysis Schema
const aiAnalysisSchema = new mongoose.Schema({
  urgency: { type: Number, min: 1, max: 5 },
  category: { type: String },
  sentiment: { type: String },
  riskScore: { type: Number, min: 1, max: 5 },
  recommendation: { type: String },
  reasoning: { type: String },
  suggestedQuestions: [String],
  confidence: { type: Number, min: 0, max: 100 },
  processedAt: { type: Date, default: Date.now }
}, { _id: false });

const leaveRequestSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: Object.values(LEAVE_TYPES),
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(LEAVE_STATUS),
    default: LEAVE_STATUS.PENDING
  },
  timeline: [timelineSchema],
  gmail: gmailSchema,
  // AI Analysis Data
  aiAnalysis: aiAnalysisSchema,
  managerAIRecommendation: {
    recommendation: String,
    confidence: Number,
    reasoning: String,
    processedAt: Date
  }
}, {
  timestamps: true
});

leaveRequestSchema.index({ employeeId: 1, status: 1 });
leaveRequestSchema.index({ managerId: 1, status: 1 });
leaveRequestSchema.index({ startDate: 1, endDate: 1 });
leaveRequestSchema.index({ 'aiAnalysis.urgency': 1 });
leaveRequestSchema.index({ 'aiAnalysis.category': 1 });

leaveRequestSchema.pre('validate', function() {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
});

export const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);