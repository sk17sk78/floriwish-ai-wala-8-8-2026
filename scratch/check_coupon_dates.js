
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://floriwish:hsiwirolfkey8080@cluster0.t5qqqkd.mongodb.net/Flowrish';

async function checkCouponDates() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const coupons = await db.collection('coupons').find({}).toArray();

        console.log('Coupons with validity dates:');
        coupons.forEach(coupon => {
            console.log(`- Code: ${coupon.code}`);
            console.log(`  isActive: ${coupon.isActive}`);
            console.log(`  isDeleted: ${coupon.isDeleted}`);
            if (coupon.valid) {
                console.log(`  Valid From: ${coupon.valid.from}`);
                console.log(`  Valid Till: ${coupon.valid.till}`);
                const now = new Date();
                const till = new Date(coupon.valid.till);
                console.log(`  Current Date: ${now.toISOString()}`);
                console.log(`  Is Expired: ${till < now}`);
            } else {
                console.log('  No validity info');
            }
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkCouponDates();
