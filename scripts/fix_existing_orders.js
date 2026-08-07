
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function fixExistingDocuments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Dynamically register models to avoid schema issues in this script
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
    const Cart = mongoose.model('Cart', new mongoose.Schema({}, { strict: false }));

    console.log('Updating Orders...');
    const orderResult = await Order.updateMany(
      { $or: [ { isActive: { $exists: false } }, { isDeleted: { $exists: false } } ] },
      { $set: { isActive: true, isDeleted: false } }
    );
    console.log(`Updated ${orderResult.modifiedCount} orders.`);

    console.log('Updating Carts...');
    const cartResult = await Cart.updateMany(
      { $or: [ { isActive: { $exists: false } }, { isDeleted: { $exists: false } } ] },
      { $set: { isActive: true, isDeleted: false } }
    );
    console.log(`Updated ${cartResult.modifiedCount} carts.`);

    console.log('Fixing complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixExistingDocuments();
