
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
    const Cart = mongoose.model('Cart', new mongoose.Schema({}, { strict: false }));

    const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
    console.log(`Found ${orders.length} recent orders:`);

    for (const order of orders) {
      console.log(`Order ID: ${order.id}, _id: ${order._id}, cart: ${order.cart}, status: ${order.payment?.status}`);
      const cart = await Cart.findById(order.cart);
      if (cart) {
        console.log(`  Cart _id: ${cart._id}, isOrdered: ${cart.isOrdered}`);
        if (cart.items) {
          cart.items.forEach((item, i) => {
            console.log(`    Item ${i}: status=${item.status}, content=${item.content}`);
          });
        }
      } else {
        console.log(`  Cart not found!`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrders();
