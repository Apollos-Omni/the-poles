export class EbayProvider {
  constructor({ env = process.env } = {}) {
    this.env = env;
    this.name = 'ebay';
  }

  async createOrder() {
    const error = new Error('Real eBay ordering is disabled. Set FULFILLMENT_PROVIDER=mock for launch fulfillment.');
    error.code = 'EBAY_ORDERING_DISABLED';
    error.status = 501;
    throw error;
  }
}

export default EbayProvider;
