import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { debounce } from 'lodash';
import { searchPrizes } from '@/functions/searchPrizes';

export default function EbayPrizeBrowser({ onPrizeSelect, onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('RELEVANCE');

  const limit = 20;

  const performSearch = useCallback(async (query, searchOffset = 0) => {
    if (query.length < 2) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data } = await searchPrizes({
        provider: 'ebay',
        q: query,
        limit,
        offset: searchOffset,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort,
      });

      if (data.success) {
        setResults(data.prizes || []);
        setTotalResults(data.totalResults || 0);
        setOffset(searchOffset);
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('eBay search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [minPrice, maxPrice, sort]);

  const debouncedSearch = useMemo(
    () => debounce((query) => performSearch(query, 0), 500),
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

  const handleFilterChange = () => {
    // Re-run search with current filters
    performSearch(searchTerm, 0);
  };

  const handleNextPage = () => {
    performSearch(searchTerm, offset + limit);
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      performSearch(searchTerm, Math.max(0, offset - limit));
    }
  };

  // Convert eBay prize to product format compatible with existing flow
  const convertToProduct = (prize) => ({
    id: prize.externalId,
    title: prize.title,
    price_cents: prize.price,
    images: [prize.imageUrl],
    image_url: prize.imageUrl,
    brand: 'eBay',
    category: prize.category,
    condition: prize.condition,
    offers: [
      {
        retailer: 'eBay',
        price_cents: prize.price,
        availability: prize.availability === 'AVAILABLE' ? 'in_stock' : 'out_of_stock',
        product_url: prize.productUrl,
      },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-600 hover:text-slate-800"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        )}
        <h2 className="text-xl font-bold text-slate-800">Search eBay for Prizes</h2>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search eBay — Nintendo Switch, PS5, Airpods, laptops..."
          value={searchTerm}
          onChange={handleInputChange}
          className="pl-10 text-lg bg-white border-slate-300 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-slate-600 block mb-1">Min Price ($)</label>
          <Input
            type="number"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="text-sm bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-600 block mb-1">Max Price ($)</label>
          <Input
            type="number"
            placeholder="999"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="text-sm bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-600 block mb-1">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full text-sm bg-white border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
          >
            <option value="RELEVANCE">Relevance</option>
            <option value="PRICE_LOWEST_FIRST">Price: Low to High</option>
            <option value="PRICE_HIGHEST_FIRST">Price: High to Low</option>
            <option value="NEWLY_LISTED">Newly Listed</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button
            onClick={handleFilterChange}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
            disabled={!searchTerm || isLoading}
          >
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="ml-4 text-slate-600">Searching eBay...</p>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-semibold text-sm">Search Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && searchTerm.length > 1 && results.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No items found for "{searchTerm}" on eBay</p>
          <p className="text-slate-400 text-sm mt-2">Try different keywords or adjust your price filter.</p>
        </div>
      )}

      {/* Results grid */}
      {!isLoading && results.length > 0 && (
        <>
          <div className="text-sm text-slate-600">
            Found <strong>{totalResults}</strong> items • Showing {offset + 1}–{Math.min(offset + limit, totalResults)}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((prize) => (
              <Card
                key={prize.externalId}
                className="bg-white/80 border-slate-200 hover:border-blue-300 transition-all duration-300 flex flex-col"
              >
                <CardContent className="p-4 flex flex-col flex-grow">
                  {/* Image */}
                  <div className="h-40 bg-slate-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                    {prize.imageUrl ? (
                      <img
                        src={prize.imageUrl}
                        alt={prize.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300?text=eBay+Item';
                        }}
                      />
                    ) : (
                      <div className="text-slate-400">No image</div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2 text-sm flex-grow">
                    {prize.title}
                  </h3>

                  {/* Category & Condition */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-500 text-xs">{prize.category}</span>
                    <Badge variant="outline" className="text-xs">
                      {prize.condition}
                    </Badge>
                  </div>

                  {/* Price & Availability */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-green-600">
                      ${(prize.price / 100).toFixed(2)}
                    </span>
                    <Badge
                      className={`text-xs ${
                        prize.availability === 'AVAILABLE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {prize.availability === 'AVAILABLE' ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>

                  {/* Select button */}
                  <Button
                    onClick={() => {
                      const product = convertToProduct(prize);
                      onPrizeSelect(product);
                    }}
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700"
                    disabled={prize.availability !== 'AVAILABLE'}
                  >
                    Select This Prize
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              onClick={handlePrevPage}
              disabled={offset === 0 || isLoading}
              variant="outline"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {Math.floor(offset / limit) + 1}
            </span>
            <Button
              onClick={handleNextPage}
              disabled={offset + limit >= totalResults || isLoading}
              variant="outline"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </>
      )}

      {/* Empty initial state */}
      {!isLoading && searchTerm.length === 0 && results.length === 0 && !error && (
        <div className="text-center py-12 text-slate-500">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p>Enter search keywords to browse eBay prizes</p>
        </div>
      )}
    </div>
  );
}