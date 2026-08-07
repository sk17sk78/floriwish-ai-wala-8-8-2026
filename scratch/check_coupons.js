
const mongoose = require('mongoose');
const { Schema } = mongoose;

async function checkCoupons() {
  const MONGODB_URI = "mongodb+srv://floriwish:hsiwirolfkey8080@cluster0.t5qqqkd.mongodb.net/Flowrish?retryWrites=true&w=majority";
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const CouponSchema = new Schema({}, { strict: false });
    const Coupon = mongoose.models.Coupons || mongoose.model('Coupons', CouponSchema, 'coupons');

    const count = await Coupon.countDocuments();
    console.log(`Total coupons in database: ${count}`);

    const coupons = await Coupon.find({});
    console.log('Coupons details:');
    coupons.forEach(c => {
      console.log(`- Code: ${c.code}, isActive: ${c.isActive}, isDeleted: ${c.isDeleted}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCoupons();
