const mongoose = require('mongoose');
require('dotenv').config();

const adminEmail = 'admin@floriwish76decorwish.com';

async function setSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME });
    console.log("Connected to MongoDB:", process.env.DB_NAME);

    // Dynamic model structure based on AdminSchema
    const Admin = mongoose.model('Admin', new mongoose.Schema({}, { strict: false }), 'admins');

    const admin = await Admin.findOne({ userName: adminEmail });

    if (!admin) {
      console.error(`Admin user with email ${adminEmail} not found!`);
      const allAdmins = await Admin.find({}, { userName: 1 });
      console.log("Available admins:", allAdmins.map(a => a.userName));
    } else {
      console.log(`Found admin: ${admin.userName}. Marking as isSuperAdmin = true...`);
      admin.isSuperAdmin = true;
      admin.status = 'active'; // ensure it's active
      await admin.save();
      console.log(`Success! Admin ${adminEmail} is now a Super Admin.`);
    }

  } catch (error) {
    console.error("Error setting super admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

setSuperAdmin();
