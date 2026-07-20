import { prisma } from '../../prisma.js';
import { CjProductService } from './cj-product.service.js';

export class CjInventoryService {
  /**
   * Re-fetch a single imported product's CJ detail and refresh local stock.
   * Variants are matched back by name+value since no CJ variant id is stored
   * at import time — this is a best-effort match, not a guaranteed key.
   */
  static async syncProductInventory(productId: number) {
    const cjProduct = await prisma.cjProduct.findUnique({ where: { product_id: productId } });
    if (!cjProduct) throw new Error(`No CJ product record for product ID ${productId}`);

    const detail = await CjProductService.getProductDetail(cjProduct.cj_pid);
    if (!detail) throw new Error(`CJ product ${cjProduct.cj_pid} not found`);

    const variants: any[] = Array.isArray(detail.variants) ? detail.variants : [];
    let totalStock = 0;

    if (variants.length) {
      const localVariants = await prisma.productVariant.findMany({ where: { product_id: productId } });
      for (const v of variants) {
        const name = String(v.variantName || 'Default').substring(0, 100);
        const value = String(v.variantValue || 'Default').substring(0, 100);
        const stock = parseInt(v.variantInventory || v.variantStock || '0', 10) || 0;
        totalStock += stock;

        const match = localVariants.find((lv) => lv.variant_name === name && lv.variant_value === value);
        if (match) {
          await prisma.productVariant.update({ where: { id: match.id }, data: { stock } });
        }
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

    const results = await Promise.allSettled(
      cjProducts.map((cp) => this.syncProductInventory(cp.product_id as number)),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - succeeded;
    return { succeeded, failed };
  }
}
