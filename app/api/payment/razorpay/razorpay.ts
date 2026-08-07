import Razorpay from "razorpay";

const ID: string | undefined = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const SECRET: string | undefined = process.env.RAZORPAY_KEY_SECRET;

if (!ID) {
  throw new Error("Please add your RAZORPAY_KEY_ID to .env");
}

if (!SECRET) {
  throw new Error("Please add your RAZORPAY_KEY_SECRET to .env");
}

let cachedInstance: Razorpay | null = null;

const getRazorpay = () => {
  // Only initialize on server side
  if (typeof window !== 'undefined') {
    throw new Error('Razorpay should only be used on server side');
  }

  if (!cachedInstance) {
    try {
      cachedInstance = new Razorpay({
        key_id: ID,
        key_secret: SECRET
      });
    } catch (error) {
      throw error;
    }
  }

  return cachedInstance;
};

export default getRazorpay;
