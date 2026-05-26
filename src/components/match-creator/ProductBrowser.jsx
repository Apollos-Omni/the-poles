import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Search, ShoppingCart, Loader2 } from 'lucide-react';
import { debounce } from 'lodash';
import { searchProducts } from '@/functions/searchProducts';
import { VideoBackgroundCard, mediaImages } from '@/components/media/MediaPrimitives';

const buyInForPlayers = (P_cents, N) => {
    const uplift = { marginPct: 0.05, feesPct: 0.03, bufferPct: 0.02 };
    const totalNeeded = P_cents * (1 + uplift.marginPct + uplift.feesPct + uplift.bufferPct);
    return Math.ceil(totalNeeded / N) / 100;
};

export default function ProductBrowser({ onProductSelect }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [providerMessage, setProviderMessage] = useState('');

    const performSearch = useCallback(async (query) => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        setIsLoading(true);
            setError('');
            setProviderMessage('');
            try {
            const { data } = await searchProducts({ query, limit: 24 });
            if (data.success) {
                setResults(data.products || []);
                setProviderMessage(data.providerMessage || '');
            } else {
                throw new Error(data.error || 'Search failed');
            }
        } catch (err) {
            setError(err.message || 'Product search failed. Please try again.');
            console.error('Search error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const debouncedSearch = useMemo(
        () => debounce(performSearch, 400),
        [performSearch]
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);


    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
    };
    
    const getBestOffer = (offers = []) => {
        const inStock = offers.filter(o => o.availability === 'in_stock');
        if (inStock.length > 0) {
            return inStock.sort((a, b) => a.price_cents - b.price_cents)[0];
        }
        // If no items are in stock, return the cheapest overall
        return offers.sort((a, b) => a.price_cents - b.price_cents)[0];
    };

    const normalizeProduct = (product) => {
        const offers = Array.isArray(product.offers) ? product.offers : [];
        const bestOffer = getBestOffer(offers);
        const images = product.images || product.image_urls || [product.image_url || product.imageUrl].filter(Boolean);
        return {
            ...product,
            id: product.id || product.product_id,
            title: product.title || 'Selected Prize',
            brand: product.brand || product.category || product.merchant || '',
            images,
            image_url: product.image_url || images[0] || '',
            price_cents: bestOffer?.price_cents || product.price_cents || 0,
            currency: product.currency || bestOffer?.currency || 'USD',
            merchant: product.merchant || bestOffer?.retailer || product.source_label || product.source || '',
            product_url: product.product_url || bestOffer?.product_url || null,
            affiliate_url: product.affiliate_url || bestOffer?.affiliate_url || null,
            offers,
        };
    };

    return (
        <div>
            <div className="mb-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <VideoBackgroundCard title="Prize discovery" description="Let players see the reward before they commit to the room." image={mediaImages.catalogShelf} label="Prize browser" metric="Pick" />
                <VideoBackgroundCard title="Sponsor-ready cards" description="Product images, stock state, and retailer context make the prize path feel trustworthy." image={mediaImages.sponsorMarket} label="Marketplace" metric="Gear" />
            </div>
            <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-200/60" />
                <Input
                    placeholder="Search products by name or brand..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    className="pl-10 text-lg bg-black/40 border-purple-700/40 text-white placeholder:text-purple-200/40 focus:border-cyan-400"
                />
            </div>

            {isLoading && (
                 <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="ml-4 text-slate-600">Searching across retailers...</p>
                 </div>
            )}
            
            {!isLoading && error && (
                <div className="rounded-xl border border-red-700/40 bg-red-950/30 p-4 text-red-200">{error}</div>
            )}

            {!isLoading && !error && providerMessage && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-yellow-600/40 bg-yellow-950/25 p-4 text-sm text-yellow-100">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{providerMessage}</span>
                </div>
            )}

            {!isLoading && !error && searchTerm.length > 1 && results.length === 0 && (
                 <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-slate-400/50 mx-auto mb-4" />
                    <p className="text-slate-500">No products found for "{searchTerm}"</p>
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((rawProduct) => {
                    const product = normalizeProduct(rawProduct);
                    const bestOffer = getBestOffer(product.offers) || { price_cents: product.price_cents, availability: 'in_stock', retailer: product.merchant };
                    return (
                        <Card key={product.id} className="overflow-hidden border-purple-700/25 bg-black/40 text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/50 flex flex-col">
                            <CardContent className="p-4 flex flex-col flex-grow">
                                <div className="h-40 bg-slate-100 rounded-lg mb-4 overflow-hidden">
                                    <img 
                                        src={product.images[0] || product.image_url || 'https://via.placeholder.com/300'} 
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                <h3 className="font-semibold text-white mb-2 line-clamp-2 text-sm flex-grow">
                                    {product.title}
                                </h3>

                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-purple-100/55 text-sm">{product.brand}</span>
                                    {product.offers.length > 1 && (
                                        <Badge variant="outline">{product.offers.length} offers</Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xl font-bold text-green-300">
                                        ${(bestOffer.price_cents / 100).toFixed(2)}
                                    </span>
                                     <Badge className={`text-xs ${bestOffer.availability === 'in_stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {bestOffer.availability === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                                    </Badge>
                                </div>

                                <div className="mt-auto">
                                    <Button 
                                        onClick={() => onProductSelect(product)}
                                        className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700"
                                        disabled={bestOffer.availability !== 'in_stock'}
                                    >
                                        Select Prize
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
