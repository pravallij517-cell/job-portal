import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const seedAdminUser = async () => {
  try {
    const adminUsername = 'admin';
    const adminEmail = 'admin@jobportal.com';
    const adminPassword = 'admin@123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Look for existing user with email, name or role admin
    let admin = await User.findOne({
      $or: [
        { email: adminEmail },
        { name: adminUsername },
        { role: 'admin' },
      ],
    });

    if (admin) {
      // Ensure name, email, password, and role are explicitly configured
      admin.name = adminUsername;
      admin.email = adminEmail;
      admin.role = 'admin';
      admin.password = hashedPassword;
      await admin.save();
      console.log('✅ Admin user verified & updated (Username: admin | Password: admin@123)');
    } else {
      admin = await User.create({
        name: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        profile: {
          professionalSummary: 'Platform Super Administrator with authority to manage and publish jobs',
          location: 'HQ Command Center',
        },
      });
      console.log('✅ Admin user created successfully (Username: admin | Password: admin@123)');
    }
    return admin;
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
  }
};
