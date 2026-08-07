
const mongoose = require('mongoose');

async function checkContentCoupons() {
    try {
        await mongoose.connect('mongodb://localhost:27017/floriwish');
        console.log('Connected to MongoDB');

        const Content = mongoose.model('Content', new mongoose.Schema({
            name: String,
            _coupons: [mongoose.Schema.Types.ObjectId]
        }));

        const contents = await Content.find({});
        console.log(`Found ${contents.length} content documents`);

        contents.forEach(c => {
            if (c._coupons && c._coupons.length > 0) {
                console.log(`- Content: ${c.name}, Coupons: ${c._coupons.join(', ')}`);
            }
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkContentCoupons();
