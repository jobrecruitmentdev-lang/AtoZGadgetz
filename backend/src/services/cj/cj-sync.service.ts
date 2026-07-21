import { prisma } from '../../prisma.js';
import { CjProductService } from './cj-product.service.js';
import { v4 as uuidv4 } from 'uuid';

export class CjSyncService {
  /**
   * Syncs products for all categories that have a cj_keyword defined.
   * This should be called by the background worker.
   */
  static async syncAllCategories(pagesPerCategory = 2) {
    console.log('[SyncService] Starting sync for all categories');
    const categories = await prisma.category.findMany({
      where: { cj_keyword: { not: null } },
      include: { subcategories: { take: 1 } },
    });

    for (const category of categories) {
      if (!category.cj_keyword) continue;
      
      const subcategoryId = category.subcategories.length > 0 ? category.subcategories[0].id : null;
      if (!subcategoryId) {
        console.warn(`[SyncService] Skipping category ${category.name} because it has no subcategories.`);
        continue;
      }

      console.log(`[SyncService] Syncing category ${category.name} with keyword "${category.cj_keyword}"`);
      
      for (let page = 1; page <= pagesPerCategory; page++) {
        try {
          const raw = await CjProductService.searchProducts(category.cj_keyword, page, 20);
          
          let list: any[] = [];
          if (Array.isArray(raw)) list = raw;
          else if (Array.isArray(raw?.list)) list = raw.list;
          else if (Array.isArray(raw?.content)) {
            for (const group of raw.content) {
              if (Array.isArray(group?.productList)) list.push(...group.productList);
            }
          }

          if (list.length === 0) break;

          for (const item of list) {
            await this.upsertCJProduct(item, category.id, subcategoryId);
          }
        } catch (error) {
          console.error(`[SyncService] Failed to sync page ${page} for category ${category.name}`, error);
        }
      }
    }
    console.log('[SyncService] Finished syncing categories');
  }

  /**
   * Upserts a raw CJ product item into the local database as a Product.
   */
  static async upsertCJProduct(item: any, categoryId: number, subcategoryId: number) {
    const pid = item.id || item.pid;
    if (!pid) return;

    try {
      const existingCjProduct = await prisma.cjProduct.findUnique({
        where: { cj_pid: String(pid) },
        include: { product: true }
      });

      const supplierPrice = parseFloat(item.sellPrice || item.nowPrice || item.price || '0');
      const markupPercentage = 2.0; // 100% markup
      const finalPrice = supplierPrice * markupPercentage;
      
      const name = String(item.nameEn || item.name || '').substring(0, 200);
      const imageUrl = item.bigImage || item.imageUrl || '';

      if (existingCjProduct && existingCjProduct.product) {
        // Update price and basic details
        await prisma.product.update({
          where: { id: existingCjProduct.product.id },
          data: {
            price: finalPrice,
            name: name,
            thumbnail_image: imageUrl,
          }
        });
      } else {
        // Create new
        await prisma.$transaction(async (tx) => {
          const product = await tx.product.create({
            data: {
              category: { connect: { id: categoryId } },
              subcategory: { connect: { id: subcategoryId } },
              name: name,
              slug: `${String(pid).substring(0, 50)}-${uuidv4().substring(0, 8)}`,
              sku: String(pid),
              price: finalPrice,
              stock_quantity: 0,
              weight: 0,
              fulfillment_type: 'cj',
              creator: { connect: { id: 1 } },
              thumbnail_image: imageUrl,
              is_active: true,
            }
          });

          await tx.cjProduct.create({
            data: {
              cj_pid: String(pid),
              supplier_price: supplierPrice,
              product: { connect: { id: product.id } },
            }
          });
        });
      }
    } catch (error) {
      console.error(`[SyncService] Failed to upsert product ${pid}`, error);
    }
  }
}
