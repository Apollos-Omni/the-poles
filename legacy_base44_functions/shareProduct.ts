import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { url, source = 'web' } = body;

        if (!url) {
            return Response.json({ error: 'URL required' }, { status: 400 });
        }

        // Simple URL validation and parsing (for demo purposes)
        let retailerId, productId, title, price;
        
        if (url.includes('amazon.com')) {
            retailerId = 'amazon';
            const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
            productId = asinMatch ? asinMatch[1] : `demo_product_${Date.now()}`;
            title = 'Amazon Product (Demo)';
            price = Math.floor(Math.random() * 50000) + 1000;
        } else if (url.includes('walmart.com')) {
            retailerId = 'walmart';
            productId = `demo_walmart_product_${Date.now()}`;
            title = 'Walmart Product (Demo)';
            price = Math.floor(Math.random() * 30000) + 1000;
        } else {
            retailerId = 'generic';
            productId = `demo_generic_product_${Date.now()}`;
            title = 'Shared Product (Demo)';
            price = Math.floor(Math.random() * 40000) + 1000;
        }

        // Create product record
        const product = await base44.entities.Product.create({
            retailer_id: retailerId,
            product_id: productId,
            source_url: url,
            title: title,
            description: `Product shared by user ${user.id}`,
            price_cents: price,
            price_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
            image_urls: ['https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=300&fit=crop'],
            availability: 'in_stock',
            brand: retailerId.charAt(0).toUpperCase() + retailerId.slice(1)
        });

        // Create shared link record for tracking
        const urlHash = Array.from(new Uint8Array(
            await crypto.subtle.digest('SHA-256', new TextEncoder().encode(url))
        )).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);

        await base44.entities.SharedLink.create({
            user_id: user.id,
            url: url,
            canonical_url: url,
            retailer: retailerId,
            product_id: product.id,
            source: source,
            url_hash: urlHash,
            status: 'resolved'
        });

        return Response.json({ success: true, product });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});