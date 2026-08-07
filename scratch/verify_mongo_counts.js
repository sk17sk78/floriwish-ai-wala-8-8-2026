const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://floriwish:hsiwirolfkey8080@cluster0.t5qqqkd.mongodb.net/Flowrish?retryWrites=true&w=majority';

async function checkCounts() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const Coupon = mongoose.model('Coupon', new mongoose.Schema({}, { strict: false }), 'coupons');

        const total = await Coupon.countDocuments({});
        const nonDeleted = await Coupon.countDocuments({ isDeleted: false });
        const deleted = await Coupon.countDocuments({ isDeleted: true });
        const active = await Coupon.countDocuments({ isDeleted: false, isActive: true });
        const inactive = await Coupon.countDocuments({ isDeleted: false, isActive: false });

        console.log('Total coupons:', total);
        console.log('Non-deleted coupons:', nonDeleted);
        console.log('Deleted coupons:', deleted);
        console.log('Active coupons:', active);
        console.log('Inactive coupons:', inactive);

        const coupons = await Coupon.find({ isDeleted: false }).select('code isActive isDeleted');
        console.log('Non-deleted coupons list:', JSON.stringify(coupons, null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkCounts();
