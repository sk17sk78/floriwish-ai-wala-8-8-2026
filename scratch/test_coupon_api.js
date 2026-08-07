
async function test() {
  const res = await fetch('http://localhost:3000/api/admin/content/coupon', {
    method: 'GET',
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
