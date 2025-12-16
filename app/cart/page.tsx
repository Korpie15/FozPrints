'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { getCart, updateCartLines, removeFromCart } from '@/lib/shopify';
import { ShopifyCart } from '@/types/shopify';
import { formatPrice } from '@/lib/utils';
import '../../styles/cart.css';

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
      <div className="cart-page">
        <div className="cart-empty">
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.lines.edges.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <ShoppingCart size={64} style={{ margin: '0 auto 1rem', color: '#9ca3af' }} />
          <h2>Your cart is empty</h2>
          <p>
            Start adding some Subaru Forester prints to your cart!
          </p>
          <Link href="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Shopping Cart</h1>

      <div className="cart-container">
        {/* Cart Items */}
        <div className="cart-items">
          {cart.lines.edges.map(({ node: line }) => {
            const image = line.merchandise.product.images.edges[0]?.node;
            
            return (
              <div key={line.id} className="cart-item">
                <div className="cart-item-image">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.altText || line.merchandise.product.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.75rem' }}>
                      No image
                    </div>
                  )}
                </div>

                <div className="cart-item-details">
                  <Link 
                    href={`/products/${line.merchandise.product.handle}`}
                    className="cart-item-title"
                  >
                    {line.merchandise.product.title}
                  </Link>
                  {line.merchandise.title !== 'Default Title' && (
                    <p className="cart-item-variant">
                      {line.merchandise.title}
                    </p>
                  )}

                  <div className="cart-item-actions">
                    <div className="cart-item-quantity">
                      <button
                        onClick={() => handleUpdateQuantity(line.id, Math.max(1, line.quantity - 1))}
                        className="cart-quantity-button"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="cart-quantity-value">
                        {line.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(line.id, line.quantity + 1)}
                        className="cart-quantity-button"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <span className="cart-item-price">
                      {formatPrice(
                        (parseFloat(line.merchandise.price.amount) * line.quantity).toString(),
                        line.merchandise.price.currencyCode
                      )}
                    </span>

                    <button
                      onClick={() => handleRemoveItem(line.id)}
                      className="cart-item-remove"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <h2>Order Summary</h2>
          
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>
              {formatPrice(
                cart.cost.subtotalAmount.amount,
                cart.cost.subtotalAmount.currencyCode
              )}
            </span>
          </div>
          <div className="cart-summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>

          <div className="cart-summary-row">
            <span>Total</span>
            <span>
              {formatPrice(
                cart.cost.totalAmount.amount,
                cart.cost.totalAmount.currencyCode
              )}
            </span>
          </div>

          <a href={cart.checkoutUrl} className="cart-checkout-button">
            Proceed to Checkout
          </a>

          <Link href="/products" style={{ display: 'block', textAlign: 'center', color: '#0284c7', padding: '0.75rem', fontWeight: 500, marginTop: '1rem' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
