import axios from 'axios';

const API_URL = 'https://bukcsheet.atozgadgetz.com/api';
const ADMIN_EMAIL = `admin_${Date.now()}@atozgadgetz.com`;
const ADMIN_PASS = 'SecureAdmin123!';
const ADMIN_MOBILE = `${Math.floor(1000000000 + Math.random() * 9000000000)}`;

async function run() {
  try {
    console.log(`[1] Registering Admin User... (${ADMIN_EMAIL})`);
    
    // role_id 1 is usually SuperAdmin, 2 Admin. Let's try 1.
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      first_name: 'Store',
      last_name: 'Admin',
      email: ADMIN_EMAIL,
      mobile: ADMIN_MOBILE,
      password: ADMIN_PASS,
      role_id: 1 // Admin
    });
    console.log("Admin registered:", registerResponse.data.message);

    console.log(`[2] Logging in...`);
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASS
    });
    
    const token = loginResponse.data.data.access_token;
    console.log("Login successful! Got token.");

    console.log(`[3] Hunting for products (Keyword: "drone")...`);
    const huntResponse = await axios.get(`${API_URL}/cj/browse/hunt?keyword=drone`);
    const products = huntResponse.data.data.list.slice(0, 3); // Get first 3 products
    
    if (products.length === 0) {
      console.log("No products found to import.");
    }

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      console.log(`\n[4.${i+1}] Importing Product: ${p.name} (ID: ${p.pid})`);
      
      try {
        const importResponse = await axios.post(`${API_URL}/cj/products/auto-import`, {
          cjPid: p.pid
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Success! Imported to local DB with ID: ${importResponse.data.data.productId}`);
      } catch (err: any) {
         console.log(`❌ Failed to import:`, err.response?.data?.message || err.message);
      }
    }

    console.log(`\n==============================================`);
    console.log(`All Done! Here are your Admin Credentials:`);
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASS}`);
    console.log(`==============================================\n`);
    
  } catch(e: any) {
    console.error("Error during execution:", e.response?.data || e.message);
  }
}

run();
