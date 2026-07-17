import { prisma } from '../../prisma.js';
import { CjAuthService } from './cj-auth.service.js';
import { cjHttp } from './cj-http.js';

export class CjShipmentService {
  private static readonly API_BASE_URL =
    process.env.CJ_API_BASE_URL || 'https://developers.cjdropshipping.com/api2.0/v1';

  static async syncShipment(orderId: number) {
    const cjOrder = await prisma.cjOrder.findUnique({ where: { order_id: orderId } });
    if (!cjOrder) throw new Error(`No CJ order found for order ID ${orderId}`);

    const headers = await CjAuthService.getAuthHeaders();
    const response = await cjHttp.get(`${this.API_BASE_URL}/logistic/order/list`, {
      headers,
      params: { orderNum: cjOrder.cj_order_id },
    });

    if (response.data.code !== 200 || !response.data.data?.length) return null;

    const tracking = response.data.data[0];

    await prisma.cjOrder.update({
      where: { order_id: orderId },
      data: { cj_status: tracking.orderStatus || 'in_transit' },
    });

    const shipment = await prisma.shipment.findUnique({ where: { order_id: orderId } });
    if (!shipment) return null;

    const cjShipment = await prisma.cjShipment.upsert({
      where: { shipment_id: shipment.id },
      update: {
        cj_tracking_id: tracking.trackingNumber,
        carrier_name: tracking.carrierName || 'CJPacket',
        tracking_url: tracking.trackingUrl,
        cj_status: tracking.orderStatus,
      },
      create: {
        cj_tracking_id: tracking.trackingNumber,
        carrier_name: tracking.carrierName || 'CJPacket',
        tracking_url: tracking.trackingUrl,
        cj_status: tracking.orderStatus,
        shipment: { connect: { id: shipment.id } },
      },
    });

    await prisma.shipment.update({
      where: { id: shipment.id },
      data: {
        tracking_number: tracking.trackingNumber,
        courier_name: tracking.carrierName || 'CJPacket',
        shipping_status: tracking.orderStatus === 'delivered' ? 'delivered' : 'shipped',
        shipped_at: tracking.shippedAt ? new Date(tracking.shippedAt) : undefined,
        delivered_at: tracking.orderStatus === 'delivered' ? new Date() : undefined,
      },
    });

    return cjShipment;
  }

  static async syncAllActiveShipments() {
    const cjOrders = await prisma.cjOrder.findMany({
      where: { cj_status: { notIn: ['delivered', 'cancelled'] } },
    });

    const results = await Promise.allSettled(
      cjOrders.map((co) => this.syncShipment(co.order_id)),
    );
    return results;
  }

  static async handleWebhook(payload: any) {
    const { orderNumber, orderStatus, trackingNumber, carrierName, trackingUrl } =
      payload;

    const order = await prisma.order.findFirst({ where: { order_number: orderNumber } });
    if (!order) return;

    const cjOrder = await prisma.cjOrder.findUnique({ where: { order_id: order.id } });
    if (!cjOrder) return;

    await prisma.cjOrder.update({
      where: { id: cjOrder.id },
      data: { cj_status: orderStatus },
    });

    if (trackingNumber) {
      const shipment = await prisma.shipment.findUnique({ where: { order_id: order.id } });
      if (shipment) {
        await prisma.cjShipment.upsert({
          where: { shipment_id: shipment.id },
          update: {
            cj_tracking_id: trackingNumber,
            carrier_name: carrierName,
            tracking_url: trackingUrl,
            cj_status: orderStatus,
          },
          create: {
            cj_tracking_id: trackingNumber,
            carrier_name: carrierName,
            tracking_url: trackingUrl,
            cj_status: orderStatus,
            shipment: { connect: { id: shipment.id } },
          },
        });

        await prisma.shipment.update({
          where: { id: shipment.id },
          data: {
            tracking_number: trackingNumber,
            courier_name: carrierName,
            shipping_status: orderStatus === 'delivered' ? 'delivered' : 'shipped',
            delivered_at: orderStatus === 'delivered' ? new Date() : undefined,
          },
        });
      }
    }

    const statusMap: Record<string, string> = {
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };

    if (statusMap[orderStatus]) {
      await prisma.order.update({
        where: { id: order.id },
        data: { order_status: statusMap[orderStatus] },
      });
    }
  }

  static async getTrackingInfo(orderId: number) {
    const shipment = await prisma.shipment.findUnique({
      where: { order_id: orderId },
      include: { cj_shipment: true },
    });
    return shipment;
  }
}
