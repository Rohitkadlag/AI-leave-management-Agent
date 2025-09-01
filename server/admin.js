// Create this file as: create-admin.js in your server root directory

import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import { hashPassword } from './src/utils/crypto.js';
import { ROLES } from './src/utils/roles.js';
import { env } from './src/config/env.js';

async function createInitialUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if managers or employees already exist
    const existingManagers = await User.countDocuments({ role: { $in: [ROLES.MANAGER, ROLES.EMPLOYEE] } });
    if (existingManagers > 0) {
      console.log('❌ Managers or employees already exist in the system');
      const users = await User.find({ role: { $in: [ROLES.MANAGER, ROLES.EMPLOYEE] } }, 'email role name').lean();
      console.log('Existing managers/employees:');
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ${user.role}`);
      });
      process.exit(0);
    }

    // Show existing admins (if any)
    const existingAdmins = await User.find({ role: ROLES.ADMIN }, 'email role name').lean();
    if (existingAdmins.length > 0) {
      console.log('ℹ️  Existing admins in system:');
      existingAdmins.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ${user.role}`);
      });
      console.log('');
    }

    // Create test users with Gmail addresses (no admin)
    const users = [
      {
        email: 'manager@gmail.com',
        name: 'Department Manager',
        role: ROLES.MANAGER, 
        password: 'Manager@1234'
      },
      {
        email: 'hr.manager@gmail.com',
        name: 'HR Manager',
        role: ROLES.MANAGER, 
        password: 'HRManager@1234'
      },
      {
        email: 'john.employee@gmail.com',
        name: 'John Employee',
        role: ROLES.EMPLOYEE,
        password: 'Employee@1234'
      },
      {
        email: 'jane.employee@gmail.com',
        name: 'Jane Employee',
        role: ROLES.EMPLOYEE,
        password: 'Employee@1234'
      }
    ];

    const createdUsers = [];

    // Create managers first
    const adminAndManagers = users.filter(u => u.role === ROLES.MANAGER);
    for (const userData of adminAndManagers) {
      const passwordHash = await hashPassword(userData.password);
      
      const user = new User({
        email: userData.email,
        name: userData.name,
        role: userData.role,
        passwordHash
      });

      await user.save();
      createdUsers.push(userData);
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    // Create employees with manager reference
    const manager = await User.findOne({ role: ROLES.MANAGER }).sort({ createdAt: 1 }); // Get first manager
    const employees = users.filter(u => u.role === ROLES.EMPLOYEE);
    
    for (const employeeData of employees) {
      const employeePasswordHash = await hashPassword(employeeData.password);

      const employee = new User({
        email: employeeData.email,
        name: employeeData.name,
        role: employeeData.role,
        managerId: manager._id,
        passwordHash: employeePasswordHash
      });

      await employee.save();
      createdUsers.push(employeeData);
      console.log(`✅ Created ${employeeData.role}: ${employeeData.email} (Manager: ${manager.name})`);
    }

    console.log('\n🎉 All test users created successfully!\n');
    
    console.log('Login credentials:');
    console.log('==================');
    createdUsers.forEach(user => {
      console.log(`${user.role} - ${user.name}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log('');
    });

    console.log('Next steps:');
    console.log('1. Start your frontend: bun run dev');
    console.log('2. Login with any of the above credentials');
    console.log('3. Test the AI-powered leave management system');
    console.log('4. Admins can be created separately through your admin registration endpoint');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create users:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

createInitialUsers();