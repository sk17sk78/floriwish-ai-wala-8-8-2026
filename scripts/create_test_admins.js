const mongoose = require('mongoose');
require('dotenv').config();

const users = [
  {
    userName: 'manager@floriwish76decorwish.com',
    password: 'Password@Manager',
    roleLabel: 'Manager',
    status: 'active',
    isSuperAdmin: false,
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    userName: 'supervisor@floriwish76decorwish.com',
    password: 'Password@Supervisor',
    roleLabel: 'Supervisor',
    status: 'active',
    isSuperAdmin: false,
    createdBy: 'system',
    updatedBy: 'system'
  },
  {
    userName: 'vendor@floriwish76decorwish.com',
    password: 'Password@Vendor',
    roleLabel: 'Vendor',
    status: 'active',
    isSuperAdmin: false,
    createdBy: 'system',
    updatedBy: 'system'
  }
];

async function seedTestAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME });
    console.log("Connected to MongoDB:", process.env.DB_NAME);

    const AdminRole = mongoose.model('AdminRole', new mongoose.Schema({}, { strict: false }), 'adminroles');
    const Admin = mongoose.model('Admin', new mongoose.Schema({}, { strict: false }), 'admins');

    for (const user of users) {
      const existingUser = await Admin.findOne({ userName: user.userName });
      
      const role = await AdminRole.findOne({ label: user.roleLabel });
      if (!role) {
        console.warn(`Role ${user.roleLabel} not found! Run create_admin_roles.js first.`);
        continue;
      }

      if (existingUser) {
        console.log(`User ${user.userName} exists. Updating Role reference.`);
        existingUser.role = role._id;
        existingUser.status = 'active';
        existingUser.password = user.password;
        await Admin.updateOne({ _id: existingUser._id }, { $set: { role: role._id, status: 'active', password: user.password } });
      } else {
        const adminData = {
          ...user,
          role: role._id
        };
        delete adminData.roleLabel;
        
        const newAdmin = new Admin(adminData);
        await newAdmin.save();
        console.log(`Created new Admin User: ${user.userName} [${user.roleLabel}]`);
      }
    }
  } catch (error) {
    console.error("Error creating test admins:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

seedTestAdmins();
