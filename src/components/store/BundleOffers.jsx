import React, { useState, useEffect } from 'react';
import { Product } from '@/entities/Product';

export default function BundleOffers() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const allProducts = await Product.list();
      setProducts(allProducts);
    };
    fetchProducts();
  }, []);

  return (
    <section className="py-16 sm:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Choose Your Kit</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Get started with the perfect bundle for your needs.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="p-8 bg-[rgba(255,255,255,0.05)] rounded-2xl border border-mystic-violet/30 backdrop-blur-md flex flex-col">
            <h3 className="text-2xl font-bold text-aura-lilac">{product.title}</h3>
            <p className="mt-2 text-gray-300 flex-grow">{product.description}</p>
            <div className="mt-8">
              <p className="text-4xl font-extrabold text-white">${(product.price_cents / 100).toFixed(2)}</p>
              <button className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-black bg-mystic-violet hover:bg-aura-lilac transition-colors duration-300">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}