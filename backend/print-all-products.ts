import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      name: true,
      slug: true,
    }
  });

  let md = '# Live Server Product Links\n\n| # | Product Name | Frontend Link (Live) | API Link (Live) |\n|---|---|---|---|\n';
  
  products.forEach((p, index) => {
    // Escape pipes in name
    const name = p.name.replace(/\|/g, '-');
    md += `| ${index + 1} | ${name} | [View Frontend](https://atozgadgetz.com/product/${p.slug}) | [View API](https://bucksheet.atozgadgetz.com/api/products/${p.slug}) |\n`;
  });

  const artifactPath = 'C:\\Users\\Dell\\.gemini\\antigravity-cli\\brain\\842c671f-b60b-4d5a-8393-c561c3f4ccd5\\products_list.md';
  fs.writeFileSync(artifactPath, md);
  console.log('Successfully wrote artifact to ' + artifactPath);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
