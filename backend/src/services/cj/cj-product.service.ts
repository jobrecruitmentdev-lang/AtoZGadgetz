import { PrismaClient } from '@prisma/client';
import { CjAuthService } from './cj-auth.service';
import { cjHttp } from './cj-http';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class CjProductService {
  private static readonly API_BASE_URL = process.env.CJ_API_BASE_URL || 'https://developers.cjdropshipping.com/api2.0/v1';

  /**
   * Search for products in CJ Dropshipping catalog
   */
  static async searchProducts(keyword: string, pageNum = 1, pageSize = 20) {
    const headers = await CjAuthService.getAuthHeaders();
    try {
      const response = await cjHttp.get(`${this.API_BASE_URL}/product/listV2`, {
        headers,
        params: {
          keyWord: keyword,
          pageNum,
          pageSize,
        },
      });
      // CJ API returns an array containing the pagination object for listV2
      return Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
    } catch (error: any) {
      console.error('CJ Search Error:', error.response?.data || error.message);
      throw new Error('Failed to search CJ products.');
    }
  }

  /**
   * Get product details by CJ Product ID
   */
  static async getProductDetail(cjPid: string) {
    const headers = await CjAuthService.getAuthHeaders();
    try {
      const response = await cjHttp.get(`${this.API_BASE_URL}/product/query`, {
        headers,
        params: { pid: cjPid },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('CJ Product Detail Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch CJ product details.');
    }
  }

  /**
   * Import a product from CJ Dropshipping into our database
   */
  static async importProduct(cjPid: string, categoryId: number, subcategoryId: number, markupPercentage: number = 2.0) {
    const cjProductDetails = await this.getProductDetail(cjPid);
    if (!cjProductDetails) {
      throw new Error(`Product not found on CJ: ${cjPid}`);
    }

    const { productName, productSku, productWeight, productPrice, productEnName, productDescription, productType, variants, productImages } = cjProductDetails;

    // Use a transaction to ensure all related data is imported together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the main product
      const product = await tx.product.create({
        data: {
          category: { connect: { id: categoryId } },
          subcategory: { connect: { id: subcategoryId } },
          name: String(productEnName || productName).substring(0, 200),
          slug: `${String(productSku).substring(0, 50)}-${uuidv4().substring(0, 8)}`, // Ensure unique slug
          short_description: String(productType || '').substring(0, 200),
          description: productDescription || '',
          sku: String(productSku),
          price: (parseFloat(productPrice || cjProductDetails.sellPrice || '0') * markupPercentage), // Apply markup
          stock_quantity: 0, // Will be updated by inventory sync
          weight: parseFloat(productWeight || '0'),
          fulfillment_type: 'cj',
          creator: { connect: { id: 1 } }, // System admin or current user
          handle: String(productSku).substring(0, 255),
          title: String(productEnName || productName).substring(0, 255),
          country_of_origin: 'CN',
          available: cjProductDetails.listedNum ? parseInt(cjProductDetails.listedNum, 10) : 0,
        }
      });

      // 2. Create the CJ Product record for metadata
      await tx.cjProduct.create({
        data: {
          cj_pid: cjPid,
          supplier_price: parseFloat(productPrice || cjProductDetails.sellPrice || '0'),
          product: { connect: { id: product.id } },
        }
      });

      // 3. Import images
      if (productImages && Array.isArray(productImages)) {
        const imagePromises = productImages.map((imgUrl: string, index: number) => {
          return tx.productImage.create({
            data: {
              product: { connect: { id: product.id } },
              image: imgUrl,
              sort_order: index,
            }
          });
        });
        await Promise.all(imagePromises);
      }

      // 4. Import variants (if any)
      if (variants && Array.isArray(variants)) {
        const variantPromises = variants.map((variant: any) => {
          return tx.productVariant.create({
            data: {
              product: { connect: { id: product.id } },
              variant_name: String(variant.variantName || 'Default').substring(0, 100),
              variant_value: String(variant.variantValue || 'Default').substring(0, 100),
              additional_price: (parseFloat(variant.variantSellPrice || variant.variantPrice || '0') * markupPercentage) - (parseFloat(productPrice || cjProductDetails.sellPrice || '0') * markupPercentage),
              stock: parseInt(variant.variantInventory || variant.variantStock || '0', 10) || 0,
            }
          });
        });
        await Promise.all(variantPromises);
      }

      return product;
    });

    return result;
  }
}
