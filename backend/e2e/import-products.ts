import axios from 'axios';
import { API_URL, ADMIN_USER } from './api/test-data';

async function importProducts() {
  console.log('Logging in as admin...');
  const loginRes = await axios.post(`${API_URL}/auth/login`, ADMIN_USER);
  const token = loginRes.data?.data?.access_token;
  if (!token) {
    console.error('Failed to get admin token');
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };

  console.log('Fetching categories to get a valid category ID...');
  const catRes = await axios.get(`${API_URL}/categories`);
  const categories = catRes.data?.data;
  let categoryId = 1;
  let subcategoryId = null;

  if (categories && categories.length > 0) {
    categoryId = categories[0].id;
    if (categories[0].subcategories && categories[0].subcategories.length > 0) {
      subcategoryId = categories[0].subcategories[0].id;
    }
  }
  console.log(`Using Category ID: ${categoryId}, Subcategory ID: ${subcategoryId}`);

  console.log('Searching for products on CJ Dropshipping...');
  const searchRes = await axios.get(`${API_URL}/cj/browse?keyword=&page=1&size=20`, { headers });
  console.log('Search Response Data:', JSON.stringify(searchRes.data, null, 2).substring(0, 500));
  
  // CJ browse API usually returns { data: { list: [...] } } or something similar
  // Let's print the structure first or just try to extract list
  let productList = searchRes.data?.data?.list || searchRes.data?.data?.content || searchRes.data?.data || [];
  if (!Array.isArray(productList)) {
      console.log('Could not find product array in response', Object.keys(searchRes.data?.data || {}));
      return;
  }

  console.log(`Found ${productList.length} products. Importing...`);

  for (const product of productList) {
    const cjPid = product.pid || product.id; // usually 'pid'
    console.log(`Importing product ${cjPid}...`);
    try {
      const importRes = await axios.post(
        `${API_URL}/cj/products/import`,
        { cjPid, categoryId, subcategoryId },
        { headers }
      );
      console.log(`Imported ${cjPid} successfully!`);
    } catch (err: any) {
      console.error(`Failed to import ${cjPid}:`, err.response?.data?.message || err.message);
    }
  }
  console.log('Done importing products.');
}

importProducts().catch(console.error);
