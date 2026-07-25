import { prisma } from '../../prisma.js';
import { CjProductService } from './cj-product.service.js';

export class CjInventoryService {
  /**
   * Re-fetch a single imported product's CJ detail and refresh local stock.
   * Variants are matched back by name+value since no CJ variant id is stored
   * at import time — this is a best-effort match, not a guaranteed key.
   */
  static async syncProductInventory(productId: number, cjProductObj?: any) {
    let cjProduct = cjProductObj;
    if (!cjProduct) {
      cjProduct = await prisma.cjProduct.findUnique({ where: { product_id: productId } });
      if (!cjProduct) throw new Error(`No CJ product record for product ID ${productId}`);
    }

    const detail = await CjProductService.getProductDetail(cjProduct.cj_pid);
    if (!detail) throw new Error(`CJ product ${cjProduct.cj_pid} not found`);

    const variants: any[] = Array.isArray(detail.variants) ? detail.variants : [];
    let totalStock = 0;

    if (variants.length) {
      const localVariants = await prisma.productVariant.findMany({ where: { product_id: productId } });
      
      // O(1) lookup Map instead of O(n) .find() inside the loop
      const variantMap = new Map(
        localVariants.map((lv) => [`${lv.variant_name}|${lv.variant_value}`, lv.id])
      );

      const updateOperations: any[] = [];

      for (const v of variants) {
        const name = String(v.variantName || 'Default').substring(0, 100);
        const value = String(v.variantValue || 'Default').substring(0, 100);
        const stock = parseInt(v.variantInventory || v.variantStock || '0', 10) || 0;
        totalStock += stock;

        const variantId = variantMap.get(`${name}|${value}`);
        if (variantId) {
          updateOperations.push(
            prisma.productVariant.update({ where: { id: variantId }, data: { stock } })
          );
        }
      }

      // Batch all variant updates into a single transaction
      if (updateOperations.length > 0) {
        await prisma.$transaction(updateOperations);
      }
    } else if (detail.listedNum) {
      totalStock = parseInt(detail.listedNum, 10) || 0;
    }

    await prisma.product.update({
      where: { id: productId },
      data: { stock_quantity: totalStock, available: totalStock },
    });

    return { productId, stock_quantity: totalStock };
  }

  static async syncAllInventory() {
    const cjProducts = await prisma.cjProduct.findMany({ where: { product_id: { not: null } } });
    
    let succeeded = 0;
    let failed = 0;

    // Process sequentially (or in small batches) to avoid Prisma Connection Pool / Memory exhaustion
    // and CJ API Rate limits, rather than a massive Promise.allSettled
    for (const cp of cjProducts) {
      try {
        await this.syncProductInventory(cp.product_id as number, cp);
        succeeded++;
      } catch (err) {
        console.error(`Failed to sync inventory for product ${cp.product_id}:`, err);
        failed++;
      }
    }

    return { succeeded, failed };
  }
}
