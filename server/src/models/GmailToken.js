import mongoose from 'mongoose';

const gmailTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mailbox: {
    type: String,
    required: true
  },
  tokens: {
    access_token: String,
    refresh_token: String,
    scope: String,
    token_type: String,
    expiry_date: Number
  }
}, {
  timestamps: true
});

gmailTokenSchema.index({ userId: 1, mailbox: 1 }, { unique: true });

export const GmailToken = mongoose.model('GmailToken', gmailTokenSchema);