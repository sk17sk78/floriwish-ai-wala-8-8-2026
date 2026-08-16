const mongoose = require('mongoose');
require('dotenv').config();

async function deleteInactiveAdmins() {
  try {
    console.log("Connecting to MongoDB:", process.env.DB_NAME);
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME });

    const Admin = mongoose.model('Admin', new mongoose.Schema({}, { strict: false }), 'admins');

    const allAdmins = await Admin.find({});
    console.log(`Total admin users found in database: ${allAdmins.length}`);

    const inactiveAdmins = allAdmins.filter(admin => admin.status !== 'active');

    if (inactiveAdmins.length === 0) {
      console.log("No inactive admin users found. All current admin accounts are active!");
    } else {
      console.log(`Found ${inactiveAdmins.length} inactive admin users to delete:`);
      inactiveAdmins.forEach(admin => {
        console.log(` - Username: ${admin.userName || admin.name || admin._id} (Status: ${admin.status || 'undefined'})`);
      });

      const deleteResult = await Admin.deleteMany({ status: { $ne: 'active' } });
      console.log(`Successfully deleted ${deleteResult.deletedCount} inactive admin user(s) from the database!`);
    }

    const remainingAdmins = await Admin.find({}, { userName: 1, name: 1, status: 1 });
    console.log("Remaining Active Admins in Database:");
    remainingAdmins.forEach(admin => {
      console.log(` - Username: ${admin.userName || admin.name || admin._id} (Status: ${admin.status})`);
    });

  } catch (error) {
    console.error("Error deleting inactive admins:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

deleteInactiveAdmins();
