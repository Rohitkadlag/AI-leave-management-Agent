import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { allow } from '../middleware/roleGuard.js';
import { authRateLimit } from '../middleware/rateLimit.js';
import { ROLES } from '../utils/roles.js';

const router = express.Router();

router.post('/register', authRateLimit, requireAuth, allow(ROLES.ADMIN), register);
router.post('/login', authRateLimit, login);
router.get('/me', requireAuth, getMe);
router.post('/dev-register', async (req, res, next) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Dev registration disabled in production' });
    }

    const { AuthService } = await import('../services/auth.service.js');
    
    // Parse request body with defaults for development
    const userData = {
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      role: req.body.role || 'EMPLOYEE', // Default to employee
      managerId: req.body.managerId
    };

    const user = await AuthService.register(userData);
    res.status(201).json({
      message: 'User created successfully (DEV MODE)',
      user
    });
  } catch (error) {
    next(error);
  }
});

// Seed endpoint - create all test users at once
router.post('/seed-users', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Seed disabled in production' });
    }

    const { User } = await import('../models/User.js');
    const { hashPassword } = await import('../utils/crypto.js');
    const { ROLES } = await import('../utils/roles.js');

    // Check if users exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      const users = await User.find({}, 'email role name').lean();
      return res.json({
        message: 'Users already exist',
        count: userCount,
        users: users.map(u => ({
          email: u.email,
          role: u.role,
          name: u.name
        }))
      });
    }

    // Create test users
    const testUsers = [
      {
        email: 'admin@demo.io',
        password: 'Admin@1234',
        name: 'System Admin',
        role: ROLES.ADMIN
      },
      {
        email: 'manager@demo.io',
        password: 'Manager@1234', 
        name: 'Department Manager',
        role: ROLES.MANAGER
      },
      {
        email: 'employee@demo.io',
        password: 'Employee@1234',
        name: 'John Employee', 
        role: ROLES.EMPLOYEE
      }
    ];

    const createdUsers = [];

    // Create admin and manager first
    for (const userData of testUsers.slice(0, 2)) {
      const passwordHash = await hashPassword(userData.password);
      const user = new User({
        email: userData.email,
        name: userData.name,
        role: userData.role,
        passwordHash
      });
      await user.save();
      createdUsers.push({
        email: userData.email,
        password: userData.password,
        role: userData.role
      });
    }

    // Create employee with manager reference
    const manager = await User.findOne({ role: ROLES.MANAGER });
    const employeeData = testUsers[2];
    const employeeHash = await hashPassword(employeeData.password);
    
    const employee = new User({
      email: employeeData.email,
      name: employeeData.name,
      role: employeeData.role,
      managerId: manager._id,
      passwordHash: employeeHash
    });
    await employee.save();
    
    createdUsers.push({
      email: employeeData.email,
      password: employeeData.password,
      role: employeeData.role,
      manager: manager.email
    });

    res.status(201).json({
      message: 'Test users created successfully! 🎉',
      users: createdUsers,
      instructions: {
        login: 'POST /api/auth/login',
        example: {
          email: 'employee@demo.io',
          password: 'Employee@1234'
        }
      }
    });

  } catch (error) {
    next(error);
  }
});


export default router;