const mongoose = require('mongoose');
require('dotenv').config();

const rolesData = [
  {
    label: "Manager",
    isActive: true,
    permission: {
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
    }
  },
  {
    label: "Supervisor",
    isActive: true,
    permission: {
      preset: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      media: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      category: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      content: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      page: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      order: { all: { create: false, read: true, update: true, delete: false }, isCustomized: false },
      blog: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      customer: { all: { create: false, read: true, update: false, delete: false }, isCustomized: false },
      seller: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      vendor: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      admin: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      setting: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      cache: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
    }
  },
  {
    label: "Vendor",
    isActive: true,
    permission: {
      content: { all: { create: true, read: true, update: true, delete: false }, isCustomized: false },
      order: { all: { create: false, read: true, update: true, delete: false }, isCustomized: false },
      // Minimal vendor access (requires backend scoping by vendorId as well)
      preset: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      media: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      category: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      page: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      blog: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      customer: { all: { create: false, read: true, update: false, delete: false }, isCustomized: false },
      seller: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      vendor: { all: { create: false, read: true, update: true, delete: false }, isCustomized: false },
      admin: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      setting: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
      cache: { all: { create: false, read: false, update: false, delete: false }, isCustomized: false },
    }
  }
];

async function seedAdminRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME });
    console.log("Connected to MongoDB:", process.env.DB_NAME);

    // Using untyped schema to avoid TS config overhead in raw node execution
    const AdminRole = mongoose.model('AdminRole', new mongoose.Schema({}, { strict: false }), 'adminroles');

    for (const roleData of rolesData) {
      const existing = await AdminRole.findOne({ label: roleData.label });
      if (existing) {
        console.log(`Role [${roleData.label}] already exists.`); // optionally update it here
        await AdminRole.updateOne({ _id: existing._id }, { $set: { permission: roleData.permission } });
        console.log(`Updated permissions for [${roleData.label}].`);
      } else {
        const newRole = new AdminRole({
          ...roleData,
          createdBy: "system",
          updatedBy: "system"
        });
        await newRole.save();
        console.log(`Created new role: [${roleData.label}]`);
      }
    }
    
    console.log("Admin roles seeded successfully!");

  } catch (error) {
    console.error("Error seeding roles:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

seedAdminRoles();
