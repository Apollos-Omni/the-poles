import { MockProvider } from './providers/MockProvider.js';
import { EbayProvider } from './providers/EbayProvider.js';

const now = () => new Date().toISOString();

function providerForName(name, env) {
  switch (String(name || 'mock').toLowerCase()) {
    case 'mock':
      return new MockProvider({ env });
    case 'ebay':
      return new EbayProvider({ env });
    default:
      throw new Error(`Unsupported fulfillment provider: ${name}`);
  }
}

export class FulfillmentEngine {
  constructor({
    store,
    env = process.env,
    createFulfillment,
    normalizePrize,
    audit = async () => {},
  }) {
    this.store = store;
    this.env = env;
    this.createFulfillment = createFulfillment;
    this.normalizePrize = normalizePrize;
    this.audit = audit;
    this.providerName = env.FULFILLMENT_PROVIDER || 'mock';
    this.mode = env.FULFILLMENT_MODE || 'ai_assisted';
    this.provider = providerForName(this.providerName, env);
  }

  async fulfillVerifiedWinner({ match, userId }) {
    try {
      console.log('[fulfillment:engine] fulfillVerifiedWinner:start', {
        matchId: match?.match_id || match?.id,
        userId,
        provider: this.providerName,
        mode: this.mode,
        demoMode: match?.demo_mode === true,
        testOrder: match?.test_order === true,
      });

      const fulfillment = await this.createFulfillment(this.store, match, userId);
      console.log('[fulfillment:engine] fulfillVerifiedWinner:created_or_existing', {
        fulfillmentId: fulfillment?.id,
        matchId: fulfillment?.match_id,
        status: fulfillment?.status,
        retailerOrderId: fulfillment?.retailer_order_id,
        trackingNumber: fulfillment?.tracking_number,
      });

      if (fulfillment.status === 'ordered' && fulfillment.retailer_order_id && fulfillment.tracking_number) {
        console.log('[fulfillment:engine] fulfillVerifiedWinner:already_ordered', {
          fulfillmentId: fulfillment.id,
          retailerOrderId: fulfillment.retailer_order_id,
          trackingNumber: fulfillment.tracking_number,
        });
        return fulfillment;
      }

      const reviewed = await this.runFulfillmentReview({ match, fulfillment, userId });
      const order = this.preparePrizeOrder({ match, fulfillment, reviewed });
      console.log('[fulfillment:engine] fulfillVerifiedWinner:prepared_order', {
        fulfillmentId: reviewed?.id,
        prizeTitle: order.prize_title,
        provider: order.provider,
        purchaseEnabled: order.purchase_enabled,
      });

      const providerResult = await this.provider.createOrder({ fulfillment: reviewed, order });

      console.log('[fulfillment:engine] store.update prize_fulfillments:start', {
        fulfillmentId: fulfillment.id,
        status: 'ordered',
        retailerOrderId: providerResult.retailer_order_id,
        trackingNumber: providerResult.tracking_number,
      });

      const updated = await this.store.update('prize_fulfillments', fulfillment.id, {
        status: 'ordered',
        shipping_status: 'ordered',
        admin_approved: true,
        retailer_order_id: providerResult.retailer_order_id,
        tracking_number: providerResult.tracking_number,
        provider_status: providerResult.provider_status,
        provider: providerResult.provider,
        provider_reference: providerResult.provider_reference,
        estimated_delivery: providerResult.estimated_delivery,
        fulfillment_mode: this.mode,
        order_prepared_at: order.prepared_at,
        ordered_at: now(),
        admin_notes: [
          fulfillment.admin_notes,
          `Mock order prepared by ${this.mode} fulfillment mode. No real purchase was made.`,
        ].filter(Boolean).join('\n'),
      });

      console.log('[fulfillment:engine] store.update prize_fulfillments:success', {
        fulfillmentId: updated?.id,
        status: updated?.status,
        retailerOrderId: updated?.retailer_order_id,
        trackingNumber: updated?.tracking_number,
      });

      await this.audit({
        entityType: 'PrizeFulfillment',
        entityId: updated.id,
        matchId: updated.match_id,
        userId,
        action: 'PRIZE_FULFILLMENT_ORDERED',
        metadata: {
          provider: providerResult.provider,
          providerStatus: providerResult.provider_status,
          mode: this.mode,
          retailerOrderId: providerResult.retailer_order_id,
          autoPurchase: false,
        },
      });

      return updated;
    } catch (error) {
      console.error('[fulfillment:engine] fulfillVerifiedWinner:failed', {
        matchId: match?.match_id || match?.id,
        userId,
        provider: this.providerName,
        mode: this.mode,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async runFulfillmentReview({ match, fulfillment, userId }) {
    console.log('[fulfillment:engine] runFulfillmentReview:start', {
      fulfillmentId: fulfillment?.id,
      matchId: fulfillment?.match_id,
      provider: this.provider.name,
      mode: this.mode,
    });

    const reviewed = await this.store.update('prize_fulfillments', fulfillment.id, {
      status: 'ready_to_order',
      shipping_status: 'ready_to_order',
      admin_approved: true,
      fulfillment_mode: this.mode,
      provider: this.provider.name,
      provider_status: 'review_passed',
      reviewed_at: now(),
      reviewed_by: userId || 'system',
    });

    console.log('[fulfillment:engine] runFulfillmentReview:success', {
      fulfillmentId: reviewed?.id,
      status: reviewed?.status,
      shippingStatus: reviewed?.shipping_status,
      adminApproved: reviewed?.admin_approved,
    });

    await this.audit({
      entityType: 'PrizeFulfillment',
      entityId: reviewed.id,
      matchId: reviewed.match_id,
      userId,
      action: 'PRIZE_FULFILLMENT_REVIEWED',
      metadata: {
        mode: this.mode,
        provider: this.provider.name,
        matchStatus: match?.status || '',
        autoPurchase: false,
      },
    });

    return reviewed;
  }

  preparePrizeOrder({ match, fulfillment }) {
    const prize = this.normalizePrize(match);
    return {
      match_id: fulfillment.match_id,
      fulfillment_id: fulfillment.id,
      winner_id: fulfillment.winner_id,
      winner_name: fulfillment.winner_name,
      winner_email: fulfillment.winner_email,
      prize_title: fulfillment.prize_title || prize.title,
      prize_url: fulfillment.prize_url || prize.productUrl || '',
      prize_image: fulfillment.prize_image || prize.image || '',
      prize_source: fulfillment.prize_source || prize.productSource || 'manual',
      shipping_name: fulfillment.shipping_name || fulfillment.winner_name || '',
      shipping_address_line1: fulfillment.shipping_address_line1 || '',
      shipping_address_line2: fulfillment.shipping_address_line2 || '',
      shipping_city: fulfillment.shipping_city || '',
      shipping_state: fulfillment.shipping_state || '',
      shipping_zip: fulfillment.shipping_zip || '',
      shipping_country: fulfillment.shipping_country || 'US',
      prepared_at: now(),
      mode: this.mode,
      provider: this.provider.name,
      purchase_enabled: false,
    };
  }
}

export default FulfillmentEngine;
