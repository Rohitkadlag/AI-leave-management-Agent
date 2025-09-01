import { User } from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';
import { signJWT } from '../middleware/auth.js';
import { ROLES } from '../utils/roles.js';

export class AuthService {
  static async register(userData) {
    const { email, password, name, role, managerId } = userData;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate manager exists if role is EMPLOYEE
    if (role === ROLES.EMPLOYEE && managerId) {
      const manager = await User.findById(managerId);
      if (!manager || manager.role !== ROLES.MANAGER) {
        throw new Error('Invalid manager ID');
      }
    }

    const passwordHash = await hashPassword(password);
    
    const user = new User({
      email,
      name,
      role,
      managerId: role === ROLES.EMPLOYEE ? managerId : undefined,
      passwordHash
    });

    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.passwordHash;
    
    return userResponse;
  }

  static async login(email, password) {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const token = await signJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    });

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    return { user: userResponse, token };
  }

  static async getProfile(userId) {
    const user = await User.findById(userId).populate('managerId', 'name email');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}