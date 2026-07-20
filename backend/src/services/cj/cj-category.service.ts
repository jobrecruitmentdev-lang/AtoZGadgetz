import { prisma } from '../../prisma.js';
import { CjAuthService } from './cj-auth.service.js';
import { cjHttp } from './cj-http.js';

export class CjCategoryService {
  private static readonly API_BASE_URL =
    process.env.CJ_API_BASE_URL || 'https://developers.cjdropshipping.com/api2.0/v1';

  /**
   * Fetch CJ's category tree and upsert it into cj_categories.
   * CJ's response shape nests first/second/third-level lists; flatten defensively
   * since the exact key names have drifted across CJ API versions.
   */
  static async syncCategories() {
    const headers = await CjAuthService.getAuthHeaders();
    const response = await cjHttp.get(`${this.API_BASE_URL}/product/getCategory`, { headers });

    const firstList: any[] = response.data?.data || [];
    const rows: { cj_category_id: string; parent_cj_category_id: string | null; name: string; level: number }[] = [];

    for (const first of firstList) {
      const firstId = String(first.categoryFirstId ?? first.categoryId ?? '');
      const firstName = String(first.categoryFirstName ?? first.categoryName ?? '');
      if (!firstId) continue;
      rows.push({ cj_category_id: firstId, parent_cj_category_id: null, name: firstName, level: 1 });

      const secondList: any[] = first.categorySecondList || first.children || [];
      for (const second of secondList) {
        const secondId = String(second.categorySecondId ?? second.categoryId ?? '');
        const secondName = String(second.categorySecondName ?? second.categoryName ?? '');
        if (!secondId) continue;
        rows.push({ cj_category_id: secondId, parent_cj_category_id: firstId, name: secondName, level: 2 });

        const thirdList: any[] = second.categoryThirdList || second.children || [];
        for (const third of thirdList) {
          const thirdId = String(third.categoryThirdId ?? third.categoryId ?? '');
          const thirdName = String(third.categoryThirdName ?? third.categoryName ?? '');
          if (!thirdId) continue;
          rows.push({ cj_category_id: thirdId, parent_cj_category_id: secondId, name: thirdName, level: 3 });
        }
      }
    }

    for (const row of rows) {
      await prisma.cjCategory.upsert({
        where: { cj_category_id: row.cj_category_id },
        update: { name: row.name, parent_cj_category_id: row.parent_cj_category_id, level: row.level },
        create: row,
      });
    }

    return { synced: rows.length };
  }

  static async getCachedCategories() {
    return prisma.cjCategory.findMany({ orderBy: [{ level: 'asc' }, { name: 'asc' }] });
  }
}
