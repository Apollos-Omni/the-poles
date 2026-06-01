import crypto from 'crypto';

const addDays = (date, days) => {
  const out = new Date(date);
  out.setDate(out.getDate() + days);
  return out;
};

export class MockProvider {
  constructor({ env = process.env } = {}) {
    this.env = env;
    this.name = 'mock';
  }

  async createOrder({ fulfillment, order }) {
    console.log('[fulfillment:mock] createOrder:start', {
      fulfillmentId: fulfillment?.id,
      matchId: fulfillment?.match_id,
      prizeTitle: order?.prize_title,
      mode: order?.mode,
    });

    const idPart = crypto.randomUUID().split('-')[0].toUpperCase();
    const trackingPart = crypto.randomUUID().replace(/-/g, '').slice(0, 14).toUpperCase();
    const estimatedDeliveryDays = Number(this.env.MOCK_FULFILLMENT_DELIVERY_DAYS || 7);

    const result = {
      retailer_order_id: `MOCK-${idPart}`,
      tracking_number: `MOCKTRACK${trackingPart}`,
      provider_status: 'mock_order_created',
      estimated_delivery: addDays(new Date(), Number.isFinite(estimatedDeliveryDays) ? estimatedDeliveryDays : 7).toISOString(),
      provider: this.name,
      provider_reference: fulfillment.id,
      order_preview: order,
    };

    console.log('[fulfillment:mock] createOrder:success', {
      fulfillmentId: fulfillment?.id,
      retailerOrderId: result.retailer_order_id,
      trackingNumber: result.tracking_number,
      estimatedDelivery: result.estimated_delivery,
    });

    return result;
  }
}

export default MockProvider;
