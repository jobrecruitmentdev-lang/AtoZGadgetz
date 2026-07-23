async function check() {
  try {
    const categoriesRes = await fetch('https://bukcsheet.atozgadgetz.com/api/categories');
    const categoriesJson = await categoriesRes.json();
    const categories = categoriesJson.data || [];

    const productsRes = await fetch('https://bukcsheet.atozgadgetz.com/api/products');
    const productsJson = await productsRes.json();
    const products = productsJson.data || [];

    console.log(`Total Products Loaded: ${products.length}`);
    console.log(`Total Categories Loaded: ${categories.length}\n`);

    const productsByCategory: Record<string, string[]> = {};
    for (const cat of categories) {
       productsByCategory[cat.name] = [];
    }
    productsByCategory['Uncategorized'] = [];

    for (const prod of products) {
       let catName = 'Uncategorized';
       if (prod.category && prod.category.name) {
           catName = prod.category.name;
       } else if (prod.category_id) {
           const cat = categories.find((c: any) => c.id === prod.category_id);
           if (cat) catName = cat.name;
       }
       
       if (!productsByCategory[catName]) {
           productsByCategory[catName] = [];
       }
       productsByCategory[catName].push(prod.name);
    }

    for (const [catName, prods] of Object.entries(productsByCategory)) {
       if (prods.length > 0) {
          console.log(`=== Category: ${catName} (${prods.length} products) ===`);
          prods.forEach(p => console.log(`- ${p}`));
          console.log();
       }
    }
  } catch(e: any) {
    console.error("Error fetching data:", e.message);
  }
}

check();
