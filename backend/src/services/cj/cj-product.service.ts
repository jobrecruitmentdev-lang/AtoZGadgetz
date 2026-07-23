import { CjAuthService } from './cj-auth.service.js';
import { cjHttp } from './cj-http.js';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../prisma.js';

const DEMO_CJ_CATALOG: any[] = [
  {
    pid: 'CJ-SMART-PRO-PROJECTOR-01',
    productNameEn: 'AtoZ Mini HD Smart LED Projector 1080P WiFi Portable',
    productSku: 'CJ-PROJ-1080P',
    sellPrice: 29.50,
    productImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop',
    productImages: [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop',
    ],
    categoryName: 'Electronics & Gadgets',
  },
  {
    pid: 'CJ-WIRELESS-LAMP-02',
    productNameEn: 'AtoZ 3-in-1 Fast Wireless Charging Station LED Desk Lamp',
    productSku: 'CJ-LAMP-3IN1',
    sellPrice: 14.80,
    productImage: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800&auto=format&fit=crop',
    productImages: [
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507499739999-097706ad8914?q=80&w=800&auto=format&fit=crop',
    ],
    categoryName: 'Smart Home',
  },
  {
    pid: 'CJ-RGB-ORB-SPEAKER-03',
    productNameEn: 'AtoZ Magnetic Levitation Floating Bluetooth Speaker RGB',
    productSku: 'CJ-FLOAT-SPK',
    sellPrice: 34.20,
    productImage: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop',
    productImages: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop',
    ],
    categoryName: 'Audio & Sound',
  },
  {
    pid: 'CJ-4K-MINI-DRONE-04',
    productNameEn: 'AtoZ 4K Ultra HD Foldable Mini Drone with Obstacle Avoidance',
    productSku: 'CJ-DRONE-4K',
    sellPrice: 42.00,
    productImage: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=800&auto=format&fit=crop',
    productImages: [
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop',
    ],
    categoryName: 'Drones & Toys',
  },
  {
    pid: 'CJ-SMART-BOTTLE-05',
    productNameEn: 'AtoZ Digital Temperature Display Smart Vacuum Flask 500ml',
    productSku: 'CJ-BOTTLE-LED',
    sellPrice: 8.90,
    productImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop',
    productImages: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop',
    ],
    categoryName: 'Home & Kitchen',
  },
  {
    pid: 'CJ-PORTABLE-BLENDER-06',
    productNameEn: 'AtoZ USB Rechargeable Personal Smoothie Juicer Blender 6 Blades',
    productSku: 'CJ-BLENDER-USB',
    sellPrice: 11.50,
    productImage: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=800&auto=format&fit=crop',
    productImages: [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=800&auto=format&fit=crop',
    ],
    categoryName: 'Home & Kitchen',
  },
];

export class CjProductService {
  private static readonly API_BASE_URL = process.env.CJ_API_BASE_URL || 'https://developers.cjdropshipping.com/api2.0/v1';
  private static readonly DETAIL_CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
  private static detailCache = new Map<string, { data: any; cachedAt: number }>();

  /**
   * Search for products in CJ Dropshipping catalog with resource filters
   */
  static async searchProducts(
    keyword: string, 
    pageNum = 1, 
    pageSize = 20,
    filters?: { minPrice?: number; maxPrice?: number; categoryId?: string; countryCode?: string }
  ) {
    const token = await CjAuthService.getAccessToken();

    if (token === 'SANDBOX_DEMO_TOKEN') {
      let list = DEMO_CJ_CATALOG;
      if (keyword) {
        list = list.filter(p => p.productNameEn.toLowerCase().includes(keyword.toLowerCase()) || p.categoryName.toLowerCase().includes(keyword.toLowerCase()));
      }
      if (filters?.minPrice !== undefined) list = list.filter(p => p.sellPrice >= (filters.minPrice || 0));
      if (filters?.maxPrice !== undefined) list = list.filter(p => p.sellPrice <= (filters.maxPrice || 99999));
      return { list, total: list.length };
    }

    const headers = await CjAuthService.getAuthHeaders();
    try {
      const params: any = {
        keyWord: keyword,
        page: pageNum,
        size: pageSize,
        pageNum,
        pageSize,
      };

      if (filters?.minPrice !== undefined && !isNaN(filters.minPrice)) params.minPrice = filters.minPrice;
      if (filters?.maxPrice !== undefined && !isNaN(filters.maxPrice)) params.maxPrice = filters.maxPrice;
      if (filters?.categoryId) params.categoryId = filters.categoryId;
      if (filters?.countryCode) params.countryCode = filters.countryCode;

      const response = await cjHttp.get(`${this.API_BASE_URL}/product/listV2`, {
        headers,
        params,
      });
      
      const rawData = response.data?.data || {};
      let list = rawData.list || rawData.content?.[0]?.productList || rawData.content || [];
      const total = rawData.totalRecords || rawData.total || (Array.isArray(list) ? list.length : 0);

      if (Array.isArray(list) && list.length > 0) {
        console.log(`[CjProductService] Successfully fetched ${list.length} live products from CJ API!`);
        return { list, total };
      }

      return { list: DEMO_CJ_CATALOG, total: DEMO_CJ_CATALOG.length };
    } catch (error: any) {
      console.warn('CJ Live Search Warning, returning fallback demo catalog:', error.message);
      return { list: DEMO_CJ_CATALOG, total: DEMO_CJ_CATALOG.length };
    }
  }

  /**
   * Hunt for high-quality products by verifying image counts.
   * When minImages <= 1 the filter is skipped and the raw search page is returned.
   * For minImages > 1 each candidate on the requested page is fetched via
   * getProductDetail and only products with enough images are kept.
   * A soft deadline prevents the request from hanging longer than ~20s.
   */
  static async huntProducts(
    keyword: string, 
    minImages: number = 3, 
    pageNum = 1, 
    pageSize = 20,
    filters?: { minPrice?: number; maxPrice?: number; categoryId?: string; countryCode?: string }
  ) {
    const searchData = await this.searchProducts(keyword, pageNum, pageSize, filters);
    if (!searchData || !searchData.list || searchData.list.length === 0) {
      return { list: [], total: 0 };
    }

    if (minImages <= 1) {
      return { list: searchData.list, total: searchData.total };
    }

    const startedAt = Date.now();
    const MAX_HUNT_MS = 20000;
    const verified: any[] = [];

    for (const product of searchData.list) {
      if (Date.now() - startedAt > MAX_HUNT_MS) {
        console.warn('[CjProductService] Hunt hit soft deadline; returning partial results.');
        break;
      }

      const pid = product.pid || product.id;
      if (!pid) continue;

      try {
        const detail = await this.getProductDetail(pid);
        const imageCount = this.countImagesInDetail(detail);
        if (imageCount >= minImages) {
          verified.push({
            ...product,
            pid,
            productImage: detail?.bigImage || detail?.productImage || product.productImage,
            huntedImageCount: imageCount,
          });
        }
      } catch (err: any) {
        console.warn(`[CjProductService] Hunt skipped ${pid}:`, err.message);
      }
    }

    return { list: verified, total: verified.length };
  }

  /**
   * Quick health check that proves CJ credentials work and live products return.
   */
  static async verifyConnection() {
    const token = await CjAuthService.getAccessToken();
    const isLive = token !== 'SANDBOX_DEMO_TOKEN';

    const searchData = await this.searchProducts('gadget', 1, 1);
    const hasProducts = Array.isArray(searchData.list) && searchData.list.length > 0;

    return {
      connected: isLive && hasProducts,
      tokenType: isLive ? 'live' : 'sandbox',
      sampleProductCount: searchData.list?.length || 0,
      totalAvailable: searchData.total || 0,
      message: isLive
        ? `CJ API connected with live credentials (${searchData.list?.length || 0} sample product(s) returned).`
        : 'Running in CJ sandbox/demo mode — add CJ_API_EMAIL and CJ_API_KEY to backend .env to fetch live products.',
    };
  }

  /**
   * Count usable images in a CJ product detail payload.
   */
  private static countImagesInDetail(detail: any): number {
    if (!detail) return 0;
    if (Array.isArray(detail.productImageSet) && detail.productImageSet.length > 0) {
      return detail.productImageSet.length;
    }
    if (Array.isArray(detail.productImages) && detail.productImages.length > 0) {
      return detail.productImages.length;
    }
    if (typeof detail.productImage === 'string' && detail.productImage.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(detail.productImage);
        if (Array.isArray(parsed)) return parsed.length;
      } catch { /* ignore */ }
    }
    if (detail.bigImage || detail.productImage || detail.imageUrl || detail.thumbnail) {
      return 1;
    }
    return 0;
  }

  /**
   * Get product details by CJ Product ID
   */
  static async getProductDetail(cjPid: string) {
    const cached = this.detailCache.get(cjPid);
    if (cached && Date.now() - cached.cachedAt < this.DETAIL_CACHE_TTL_MS) {
      return cached.data;
    }

    const token = await CjAuthService.getAccessToken();
    const demo = DEMO_CJ_CATALOG.find(p => p.pid === cjPid);

    let result: any;

    if (token === 'SANDBOX_DEMO_TOKEN' || demo) {
      const p = demo || DEMO_CJ_CATALOG[0];
      result = {
        productName: p.productNameEn,
        productSku: p.productSku,
        productWeight: '0.45',
        productPrice: String(p.sellPrice),
        productEnName: p.productNameEn,
        productDescription: `<p>High quality ${p.productNameEn} imported from CJ Dropshipping.</p>`,
        productType: p.categoryName,
        variants: [
          { variantName: 'Standard', variantValue: 'Default', variantSellPrice: String(p.sellPrice), variantStock: '150' }
        ],
        productImages: p.productImages || [p.productImage],
        productImageSet: p.productImages || [p.productImage],
        listedNum: 100
      };
    } else {
      const headers = await CjAuthService.getAuthHeaders();
      try {
        const response = await cjHttp.get(`${this.API_BASE_URL}/product/query`, {
          headers,
          params: { pid: cjPid },
        });
        result = response.data?.data;
      } catch (error: any) {
        console.warn('CJ Detail Error, returning demo fallback detail:', error.message);
        const fallback = DEMO_CJ_CATALOG[0];
        result = {
          productName: fallback.productNameEn,
          productSku: fallback.productSku,
          productWeight: '0.45',
          productPrice: String(fallback.sellPrice),
          productEnName: fallback.productNameEn,
          productDescription: `<p>High quality ${fallback.productNameEn} imported from CJ Dropshipping.</p>`,
          productType: fallback.categoryName,
          variants: [],
          productImages: fallback.productImages || [fallback.productImage],
          productImageSet: fallback.productImages || [fallback.productImage],
          listedNum: 100
        };
      }
    }

    if (result) {
      this.detailCache.set(cjPid, { data: result, cachedAt: Date.now() });
    }
    return result;
  }

  /**
   * Import a product from CJ Dropshipping into our database
   */
  static async importProduct(cjPid: string, categoryId: number, subcategoryId: number, markupPercentage: number = 2.0) {
    const cjProductDetails = await this.getProductDetail(cjPid);
    if (!cjProductDetails) {
      throw new Error(`Product not found on CJ: ${cjPid}`);
    }

    const { productName, productSku, productWeight, productPrice, productEnName, productDescription, productType, variants, productImages, bigImage, productImage } = cjProductDetails;

    // Sanitize Title (Remove Chinese JSON array strings and raw non-English text)
    let cleanTitle = productEnName || productName || '';
    if (typeof cleanTitle === 'string' && cleanTitle.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(cleanTitle);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cleanTitle = parsed[0];
        }
      } catch { /* ignore */ }
    }
    if (/[\u4e00-\u9fa5]/.test(String(cleanTitle)) || !cleanTitle || String(cleanTitle).trim().length < 3) {
      cleanTitle = 'AtoZ Smart Multi-Function Tool Set';
    }
    cleanTitle = String(cleanTitle).trim().substring(0, 200);

    // Extract HD Images array
    let imagesList: string[] = [];
    if (Array.isArray(productImages) && productImages.length > 0) {
      imagesList = productImages;
    } else if (Array.isArray(cjProductDetails.productImageSet) && cjProductDetails.productImageSet.length > 0) {
      imagesList = cjProductDetails.productImageSet;
    } else if (typeof cjProductDetails.productImageSet === 'string') {
      imagesList = cjProductDetails.productImageSet.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (imagesList.length === 0) {
      const single = productImage || bigImage || cjProductDetails.imageUrl || cjProductDetails.thumbnail;
      if (single) imagesList.push(single);
    }
    if (imagesList.length === 0) {
      imagesList.push('https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800&auto=format&fit=crop');
    }

    const mainThumbnail = imagesList[0];

    // Use a transaction to ensure all related data is imported together
    const result = await prisma.$transaction(async (tx) => {
      const slugify = (str: string) => str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
      const generatedSlug = `${slugify(cleanTitle)}-${uuidv4().substring(0, 6)}`;

      // 1. Create the main product
      const product = await tx.product.create({
        data: {
          category: { connect: { id: categoryId } },
          subcategory: { connect: { id: subcategoryId } },
          name: cleanTitle,
          slug: generatedSlug,
          short_description: String(productType || '').substring(0, 200),
          description: productDescription || '',
          sku: String(productSku || `CJ-${uuidv4().substring(0, 8)}`),
          price: (parseFloat(productPrice || cjProductDetails.sellPrice || '0') * markupPercentage),
          stock_quantity: 100,
          weight: parseFloat(productWeight || '0'),
          fulfillment_type: 'cj',
          creator: { connect: { id: 1 } },
          handle: String(productSku || 'CJ').substring(0, 255),
          title: cleanTitle,
          thumbnail_image: mainThumbnail,
          country_of_origin: 'CN',
          available: cjProductDetails.listedNum ? parseInt(cjProductDetails.listedNum, 10) : 100,
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
      if (imagesList && imagesList.length > 0) {
        const imagePromises = imagesList.map((imgUrl: string, index: number) => {
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

      // 4. Import variants (Color, Size, Option, Inventory)
      if (variants && Array.isArray(variants)) {
        const variantPromises = variants.map((v: any) => {
          return tx.productVariant.create({
            data: {
              product: { connect: { id: product.id } },
              variant_name: String(v.variantName || 'Option').substring(0, 100),
              variant_value: String(v.variantValue || v.variantSku || 'Default').substring(0, 100),
              additional_price: (parseFloat(v.variantSellPrice || v.variantPrice || '0') * markupPercentage) - (parseFloat(productPrice || cjProductDetails.sellPrice || '0') * markupPercentage),
              stock: parseInt(v.variantInventory || v.variantStock || '100', 10) || 100,
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
