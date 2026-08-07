
// Clear all localStorage
try {
  console.log('Clearing localStorage...');
  localStorage.clear();
  console.log('✅ localStorage cleared');
} catch (error) {
  console.error('Error clearing localStorage:', error);
}

// Clear all sessionStorage
try {
  console.log('Clearing sessionStorage...');
  sessionStorage.clear();
  console.log('✅ sessionStorage cleared');
} catch (error) {
  console.error('Error clearing sessionStorage:', error);
}

// Clear specific problematic keys
const problematicKeys = [
  'cart', 'cartItems', 'checkout', 'deliveryDetails', 'cartPrice', 
  'cartCoupon', 'customerDetails', 'auth', 'profile', 'location'
];

problematicKeys.forEach(key => {
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
  }
});

console.log('🎉 Cache clearing completed!');
console.log('Please refresh the page to see the changes.');

// Auto-refresh after 2 seconds
setTimeout(() => {
  window.location.reload();
}, 2000);
