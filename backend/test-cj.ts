import { CjAuthService } from './src/services/cj/cj-auth.service.js';
import { cjHttp } from './src/services/cj/cj-http.js';
import 'dotenv/config';

async function main() {
  console.log('Testing CJ API directly...');
  try {
    const headers = await CjAuthService.getAuthHeaders();
    console.log('Headers acquired.');
    
    const API_BASE_URL = process.env.CJ_API_BASE_URL || 'https://developers.cjdropshipping.com/api2.0/v1';
    console.log('Using API Base URL:', API_BASE_URL);

    const response = await cjHttp.get(`${API_BASE_URL}/product/listV2`, {
      headers,
      params: {
        keyWord: 'earbuds',
        pageNum: 1,
        pageSize: 5,
      },
    });
    
    console.log('Raw Response Data:');
    console.log(JSON.stringify(response.data, null, 2).substring(0, 800));
  } catch (err: any) {
    console.error('Error Details:', err.response?.data || err.message);
  }
}

main();
