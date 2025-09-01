import mongoose from 'mongoose';
import { ROLES } from '../utils/roles.js';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    required: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.role === ROLES.EMPLOYEE;
    }
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ managerId: 1 });

export const User = mongoose.model('User', userSchema);