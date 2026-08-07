
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://floriwish:hsiwirolfkey8080@cluster0.t5qqqkd.mongodb.net/Flowrish';

async function fixCouponDates() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        
        // Extend fwnew validity to 2028
        const result = await db.collection('coupons').updateOne(
            { code: 'fwnew' },
            { 
                $set: { 
                    'valid.till': new Date('2028-12-31T23:59:59.999Z'),
                    isActive: true,
                    isDeleted: false
                } 
            }
        );

        console.log(`Updated ${result.modifiedCount} coupon(s)`);

        // Also make Wedding2000 active for testing visibility of multiple coupons
        const result2 = await db.collection('coupons').updateOne(
            { code: 'Wedding2000' },
            { 
                $set: { 
                    isActive: true, 
                    isDeleted: false,
                    'valid.till': new Date('2028-12-31T23:59:59.999Z')
                } 
            }
        );
        console.log(`Updated Wedding2000: ${result2.modifiedCount} coupon(s)`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

fixCouponDates();
