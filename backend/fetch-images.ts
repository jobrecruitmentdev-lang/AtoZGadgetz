async function checkImages() {
  const LOCAL_API_URL = 'http://127.0.0.1:8080/api';
  
  try {
    const response = await fetch(`${LOCAL_API_URL}/products`);
    const body = await response.json();
    
    let productsList = [];
    if (body.data && body.data.products) {
       productsList = body.data.products;
    } else if (body.data) {
       productsList = body.data;
    }

    console.log(`\nFound ${productsList.length} products on the server.`);
    console.log('Cross-checking the first 5 newly imported CJ products for multiple images...\n');

    // Get products 5 to 10 (which are CJ products, skipping the 5 seeded dummy products)
    const sampleProducts = productsList.slice(5, 10);
    let productsWithMultipleImages = 0;

    for (const p of sampleProducts) {
      const detailResponse = await fetch(`${LOCAL_API_URL}/products/${p.slug}`);
      const detailBody = await detailResponse.json();
      
      const product = detailBody.data;
      const imageCount = product.images ? product.images.length : 0;
      
      console.log(`Product: ${product.name}`);
      console.log(`Live Link: https://atozgadgetz.com/product/${product.slug}`);
      console.log(`Images found: ${imageCount}`);
      
      if (product.images) {
        product.images.forEach((img: any, idx: number) => {
          console.log(`  - Image ${idx + 1}: ${img.url}`);
        });
      }
      console.log('---');

      if (imageCount > 1) {
        productsWithMultipleImages++;
      }
    }

    console.log(`\nResult: ${productsWithMultipleImages} out of ${sampleProducts.length} checked products had multiple images.`);
  } catch (err: any) {
    console.error('Error fetching data:', err.message);
  }
}

checkImages();
