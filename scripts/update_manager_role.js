const mongoose = require('mongoose');
require('dotenv').config();

async function updateManagerRole() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME });
    console.log("Connected to MongoDB:", process.env.DB_NAME);

    const AdminRole = mongoose.model('AdminRole', new mongoose.Schema({}, { strict: false }), 'adminroles');

    const managerPermission = {
      configs: { all: { create: true, read: true, update: false, delete: false }, isCustomized: false },
      media: { all: { create: true, read: true, update: false, delete: false }, isCustomized: false },
      category: { all: { create: true, read: true, update: false, delete: false }, isCustomized: false },
      product: { all: { create: true, read: true, update: false, delete: false }, isCustomized: false },
      pages: { all: { create: true, read: true, update: false, delete: false }, isCustomized: false },
      order: { all: { create: true, read: true, update: false, delete: false }, isCustomized: false },
      blog: { all: { create: true, read: true, update: false, delete: false }, isCustomized: false },
      customer: { all: { create: false, read: true, update: false, delete: false }, isCustomized: false },
      seller: { all: { create: false, read: true, update: false, delete: false }, isCustomized: false },
      vendor: { all: { create: true, read: true, update: false, delete: false }, isCustomized: false },
      staff: { all: { create: false, read: true, update: false, delete: false }, isCustomized: false },
      settings: {
        isCustomized: true,
        custom: {
          gmc: { create: false, read: true, update: false, delete: false },
        }
      },
      support: { all: { create: false, read: true, update: false, delete: false }, isCustomized: false },
      registrations: { all: { create: false, read: true, update: false, delete: false }, isCustomized: false },
      mobilecatgories: { all: { create: false, read: true, update: false, delete: false }, isCustomized: false },
    };

    const result = await AdminRole.updateOne(
      { label: "Manager" },
      { $set: { permission: managerPermission } }
    );

    if (result.matchedCount > 0) {
      console.log("Successfully updated Manager role permissions.");
    } else {
      console.log("Manager role not found. Creating it...");
      const newRole = new AdminRole({
        label: "Manager",
        isActive: true,
        permission: managerPermission,
        createdBy: "system",
        updatedBy: "system"
      });
      await newRole.save();
      console.log("Created Manager role.");
    }

  } catch (error) {
    console.error("Error updating role:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

updateManagerRole();
