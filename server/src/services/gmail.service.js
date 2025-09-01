import { google } from 'googleapis';
import { createGmailAuth, GMAIL_SCOPES } from '../config/gmail.js';
import { GmailToken } from '../models/GmailToken.js';
import { logger } from '../config/logger.js';

export class GmailService {
  static async getAuthUrl() {
    const auth = createGmailAuth();
    if (!auth) {
      throw new Error('Gmail OAuth not configured');
    }

    return auth.generateAuthUrl({
      access_type: 'offline',
      scope: GMAIL_SCOPES,
      prompt: 'consent'
    });
  }

  static async exchangeCodeStoreTokens({ userId, mailbox, code }) {
    const auth = createGmailAuth();
    if (!auth) {
      throw new Error('Gmail OAuth not configured');
    }

    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);

    await GmailToken.findOneAndUpdate(
      { userId, mailbox },
      { userId, mailbox, tokens },
      { upsert: true, new: true }
    );

    return { success: true };
  }

  static async getAuthClient(userId, mailbox) {
    const tokenDoc = await GmailToken.findOne({ userId, mailbox });
    if (!tokenDoc) {
      throw new Error('Gmail not connected for this user');
    }

    const auth = createGmailAuth();
    if (!auth) {
      throw new Error('Gmail OAuth not configured');
    }

    auth.setCredentials(tokenDoc.tokens);

    // Check if token needs refresh
    if (tokenDoc.tokens.expiry_date && Date.now() >= tokenDoc.tokens.expiry_date) {
      try {
        const { credentials } = await auth.refreshAccessToken();
        tokenDoc.tokens = credentials;
        await tokenDoc.save();
        auth.setCredentials(credentials);
      } catch (error) {
        logger.error('Token refresh failed:', error);
        throw new Error('Gmail token refresh failed');
      }
    }

    return auth;
  }

  static async sendHtml({ userId, mailbox, to, subject, html, threadId }) {
    try {
      const auth = await this.getAuthClient(userId, mailbox);
      const gmail = google.gmail({ version: 'v1', auth });

      const messageParts = [
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        html
      ];

      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const requestBody = {
        raw: encodedMessage
      };

      if (threadId) {
        requestBody.threadId = threadId;
      }

      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody
      });

      logger.info(`Email sent successfully: ${result.data.id}`);
      return result.data;
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  static async listMessages({ userId, mailbox, query, max = 10 }) {
    try {
      const auth = await this.getAuthClient(userId, mailbox);
      const gmail = google.gmail({ version: 'v1', auth });

      const result = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: max
      });

      return result.data.messages || [];
    } catch (error) {
      logger.error('Message listing failed:', error);
      throw new Error('Failed to list messages');
    }
  }

  static async getMessage({ userId, mailbox, messageId }) {
    try {
      const auth = await this.getAuthClient(userId, mailbox);
      const gmail = google.gmail({ version: 'v1', auth });

      const result = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      return result.data;
    } catch (error) {
      logger.error('Message retrieval failed:', error);
      throw new Error('Failed to get message');
    }
  }
}