import { prisma } from '../../prisma.js';
import { CjAuthService } from './cj-auth.service.js';
import { cjHttp } from './cj-http.js';

export class CjOrderService {
  private static readonly API_BASE_URL =
    process.env.CJ_API_BASE_URL || 'https://developers.cjdropshipping.com/api2.0/v1';

  static async placeOrder(orderId: number): Promise<{ cjOrderId: string }> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { include: { cj_product: true } },
            variant: true,
          },
        },
        user: true,
        address: true,
      },
    });

    if (!order) throw new Error(`Order ${orderId} not found`);

    const headers = await CjAuthService.getAuthHeaders();

    const products = order.items
      .filter(
        (item) =>
          item.product.fulfillment_type === 'cj' && item.product.cj_product?.cj_vid,
      )
      .map((item) => ({
        vid: item.product.cj_product!.cj_vid,
        quantity: item.quantity,
      }));

    if (products.length === 0) {
      throw new Error('No CJ-fulfillable items in this order.');
    }

    const countryCode =
      order.address.country?.toLowerCase().includes('india') ? 'IN' : 'US';

    const payload = {
      orderNumber: order.order_number,
      shippingCountryCode: countryCode,
      shippingAddress: order.address.address_line1,
      shippingAddress2: order.address.address_line2 || '',
      shippingZip: order.address.postal_code,
      shippingPhone: order.user.mobile,
      shippingCustomerName: `${order.user.first_name} ${order.user.last_name || ''}`.trim(),
      shippingCity: order.address.city,
      shippingProvince: order.address.state,
      products,
    };

    const response = await cjHttp.post(
      `${this.API_BASE_URL}/shopping/order/createOrder`,
      payload,
      { headers },
    );

    if (response.data.code !== 200) {
      throw new Error(`CJ order creation failed: ${JSON.stringify(response.data)}`);
    }

    const cjOrderId: string = response.data.data.orderId;

    await prisma.cjOrder.create({
      data: {
        cj_order_id: cjOrderId,
        cj_status: 'created',
        order: { connect: { id: orderId } },
      },
    });

    // Immediately submit so CJ begins fulfilment
    await this.submitOrder(cjOrderId, headers);

    return { cjOrderId };
  }

  private static async submitOrder(cjOrderId: string, headers: Record<string, string>) {
    const response = await cjHttp.post(
      `${this.API_BASE_URL}/shopping/order/submitOrder`,
      { orderId: cjOrderId },
      { headers },
    );
    return response.data;
  }

  static async cancelOrder(cjOrderId: string): Promise<boolean> {
    const headers = await CjAuthService.getAuthHeaders();
    const response = await cjHttp.post(
      `${this.API_BASE_URL}/shopping/order/cancelOrder`,
      { orderId: cjOrderId },
      { headers },
    );
    return response.data.code === 200;
  }

  static async getOrderDetail(cjOrderId: string) {
    const headers = await CjAuthService.getAuthHeaders();
    const response = await cjHttp.get(`${this.API_BASE_URL}/shopping/order/getOrderDetail`, {
      headers,
      params: { orderId: cjOrderId },
    });
    return response.data.data;
  }
}
