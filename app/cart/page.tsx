'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { getCart, updateCartLines, removeFromCart } from '@/lib/shopify';
import { ShopifyCart } from '@/types/shopify';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { cartId, setItemCount } = useCartStore();

  useEffect(() => {
    async function loadCart() {
      if (!cartId) {
        setIsLoading(false);
        return;
      }

      try {
        const cartData = await getCart(cartId);
        setCart(cartData);
        
        // Update item count
        const totalItems = cartData.lines.edges.reduce(
          (sum: number, edge: { node: { quantity: number } }) => sum + edge.node.quantity,
          0
        );
        setItemCount(totalItems);
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCart();
  }, [cartId, setItemCount]);

  const handleUpdateQuantity = async (lineId: string, quantity: number) => {
    if (!cartId || !cart) return;

    try {
      const updatedCart = await updateCartLines(cartId, [
        { id: lineId, quantity },
      ]);
      setCart(updatedCart);
      
      // Update item count
      const totalItems = updatedCart.lines.edges.reduce(
        (sum: number, edge: { node: { quantity: number } }) => sum + edge.node.quantity,
        0
      );
      setItemCount(totalItems);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const handleRemoveItem = async (lineId: string) => {
    if (!cartId || !cart) return;

    try {
      const updatedCart = await removeFromCart(cartId, [lineId]);
      setCart(updatedCart);
      
      // Update item count
      const totalItems = updatedCart.lines.edges.reduce(
        (sum: number, edge: { node: { quantity: number } }) => sum + edge.node.quantity,
        0
      );
      setItemCount(totalItems);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="text-lg text-gray-600">Loading cart...</div>
        </div>
      </div>
    );
  }

  if (!cart || cart.lines.edges.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Start adding some Subaru Forester prints to your cart!
          </p>
          <Link
            href="/products"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Browse Parts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.lines.edges.map(({ node: line }) => {
            const image = line.merchandise.product.images.edges[0]?.node;
            
            return (
              <div key={line.id} className="flex gap-4 bg-white p-4 rounded-lg border">
                <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.altText || line.merchandise.product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link 
                      href={`/products/${line.merchandise.product.handle}`}
                      className="font-semibold text-gray-900 hover:text-primary-600"
                    >
                      {line.merchandise.product.title}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">
                      {line.merchandise.title !== 'Default Title' && line.merchandise.title}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() => handleUpdateQuantity(line.id, Math.max(1, line.quantity - 1))}
                        className="p-1 hover:bg-gray-100"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 py-1 min-w-[2rem] text-center text-sm">
                        {line.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(line.id, line.quantity + 1)}
                        className="p-1 hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-gray-900">
                        {formatPrice(
                          (parseFloat(line.merchandise.price.amount) * line.quantity).toString(),
                          line.merchandise.price.currencyCode
                        )}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(line.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 border sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">
                  {formatPrice(
                    cart.cost.subtotalAmount.amount,
                    cart.cost.subtotalAmount.currencyCode
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t pt-3 mb-6">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>
                  {formatPrice(
                    cart.cost.totalAmount.amount,
                    cart.cost.totalAmount.currencyCode
                  )}
                </span>
              </div>
            </div>

            <a
              href={cart.checkoutUrl}
              className="block w-full bg-primary-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Proceed to Checkout
            </a>

            <Link
              href="/products"
              className="block w-full text-center text-primary-600 hover:text-primary-700 py-3 font-medium mt-4"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
