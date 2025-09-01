// seed.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

// === 1. Connect to MongoDB ===
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env");
  process.exit(1);
}

await mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log("✅ Connected to MongoDB");

// === 2. Define User Schema ===
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  name: String,
  role: { type: String, enum: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  passwordHash: String,
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: Date,
  updatedAt: Date,
});

const User = mongoose.model("User", userSchema);

// === 3. Helper to create a user ===
async function createUser({ email, name, role, password, managerId = null }) {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const now = new Date();
  const user = new User({
    email,
    name,
    role,
    passwordHash,
    managerId,
    createdAt: now,
    updatedAt: now,
  });

  await user.save();
  console.log(`✅ Created ${role}: ${email}`);
  return user;
}

// === 4. Run Seeder ===
async function runSeed() {
  try {
    // Clear existing (optional)
    await User.deleteMany({
      email: { $in: ["admin@demo.io", "manager@demo.io", "employee@demo.io"] },
    });

    const admin = await createUser({
      email: "admin@demo.io",
      name: "System Admin",
      role: "ADMIN",
      password: "admin123",
    });

    const manager = await createUser({
      email: "manager@gmail.com",
      name: "Department Manager",
      role: "MANAGER",
      password: "Manager@1234",
    });

    await createUser({
      email: "employee@gmail.com",
      name: "John Employee",
      role: "EMPLOYEE",
      managerId: manager._id,
      password: "employee123",
    });

    console.log("🎉 Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
}

runSeed();
