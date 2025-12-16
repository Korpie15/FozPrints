'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { ShopifyProduct } from '@/types/shopify';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { createCart, addToCart } from '@/lib/shopify';

interface ProductDetailsProps {
  product: ShopifyProduct;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(product.variants.edges[0]?.node);
  const [isAdding, setIsAdding] = useState(false);
  
  const { cartId, setCartId, setItemCount } = useCartStore();

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    setIsAdding(true);
    
    try {
      let currentCartId = cartId;
      
      // Create cart if it doesn't exist
      if (!currentCartId) {
        const newCart = await createCart();
        currentCartId = newCart.id;
        setCartId(newCart.id);
      }

      // Add item to cart
      const updatedCart = await addToCart(currentCartId!, [
        {
          merchandiseId: selectedVariant.id,
          quantity,
        },
      ]);

      // Update cart count
      const totalItems = updatedCart.lines.edges.reduce(
        (sum: number, edge: any) => sum + edge.node.quantity,
        0
      );
      setItemCount(totalItems);

      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const image = product.images.edges[0]?.node;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText || product.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No image available
            </div>
          )}
        </div>
        
        {/* Additional images could go here */}
        <div className="grid grid-cols-4 gap-4">
          {product.images.edges.slice(1, 5).map((edge, index) => (
            <div key={index} className="relative aspect-square overflow-hidden rounded-md bg-gray-100 cursor-pointer hover:opacity-75">
              <Image
                src={edge.node.url}
                alt={edge.node.altText || `${product.title} ${index + 2}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {product.title}
        </h1>
        
        <div className="mb-6">
          <span className="text-3xl font-bold text-primary-600">
            {formatPrice(
              selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount,
              selectedVariant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode
            )}
          </span>
        </div>

        <div className="mb-6">
          <div 
            className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        </div>

        {/* Variants */}
        {product.variants.edges.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Options
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              onChange={(e) => {
                const variant = product.variants.edges.find(
                  (edge) => edge.node.id === e.target.value
                )?.node;
                if (variant) {
                  setSelectedVariant(variant);
                }
              }}
              value={selectedVariant?.id}
            >
              {product.variants.edges.map((edge) => (
                <option key={edge.node.id} value={edge.node.id}>
                  {edge.node.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quantity */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Quantity
          </label>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-100"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding || !selectedVariant?.availableForSale}
          className="w-full bg-primary-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="h-5 w-5" />
          {isAdding ? 'Adding...' : selectedVariant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}
        </button>

        {/* Additional Info */}
        <div className="mt-8 space-y-4 border-t pt-8">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">SKU:</span>
            <span className="font-medium">{selectedVariant?.id.split('/').pop()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Availability:</span>
            <span className="font-medium text-green-600">
              {selectedVariant?.availableForSale ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
