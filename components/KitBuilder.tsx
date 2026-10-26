'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, ShoppingCart, Truck } from 'lucide-react';
import { Product } from '@/types/product';
import { formatPrice, formatDescriptionToHtml } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import {
  allowsPersonalisation,
  cleanPersonalisation,
  componentKey,
  componentLabel,
  componentType,
  isCompatible,
  personalisationMaxLength,
  PersonalisationError,
} from '@/lib/kit';
import { LEAD_TIME } from '@/lib/site';
import { LAUNCH_OFFER } from '@/lib/promo';
import { Toast } from './Toast';
import '../styles/product-details.css';

interface KitBuilderProps {
  /** The kit page itself (title, description, photos) */
  product: Product;
  /** Every part sold in this kit, each with its own price and stock */
  parts: Product[];
}

/** Choose an arm and a holder, then add both to the cart as one bundle. */
export function KitBuilder({ product, parts }: KitBuilderProps) {
  const arms = useMemo(() => parts.filter((p) => componentType(p) === 'arm'), [parts]);
  const holders = useMemo(() => parts.filter((p) => componentType(p) === 'holder'), [parts]);

  const inStock = (part: Product) => part.variants[0]?.availableForSale ?? false;

  const [armKey, setArmKey] = useState(() => componentKey(arms.find(inStock) ?? arms[0]));
  const arm = arms.find((a) => componentKey(a) === armKey) ?? arms[0];

  const [holderKey, setHolderKey] = useState(() => {
    const first = holders.find((h) => inStock(h) && isCompatible(arm, h)) ?? holders.find((h) => isCompatible(arm, h));
    return first ? componentKey(first) : '';
  });
  const holder = holders.find((h) => componentKey(h) === holderKey && isCompatible(arm, h));

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const { addItem } = useCartStore();

  const maxLength = arm ? personalisationMaxLength(arm) : 12;
  let cleanName: string | undefined;
  let nameError = '';
  try {
    cleanName = cleanPersonalisation(name, maxLength);
  } catch (err) {
    if (!(err instanceof PersonalisationError)) throw err;
    nameError = err.message;
  }

  if (!arm || holders.length === 0) {
    return <p>This kit isn&apos;t available right now.</p>;
  }

  const armVariant = arm.variants[0];
  const holderVariant = holder?.variants[0];
  const maxQuantity = Math.max(1, Math.min(armVariant?.quantityAvailable ?? 1, holderVariant?.quantityAvailable ?? 1));
  const isAvailable = Boolean(armVariant?.availableForSale && holderVariant?.availableForSale);
  const unitCents = (armVariant?.priceCents ?? 0) + (holderVariant?.priceCents ?? 0);
  const currency = armVariant?.price.currencyCode ?? product.currencyCode;
  const image = product.images[0];

  const selectArm = (key: string) => {
    setArmKey(key);
    const nextArm = arms.find((a) => componentKey(a) === key);
    // Keep the holder if it still fits the new arm; otherwise pick one that does
    if (nextArm && !(holder && isCompatible(nextArm, holder))) {
      const fallback = holders.find((h) => inStock(h) && isCompatible(nextArm, h)) ?? holders.find((h) => isCompatible(nextArm, h));
      setHolderKey(fallback ? componentKey(fallback) : '');
    }
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!holder || !holderVariant || !armVariant || !isAvailable || nameError) return;

    const common = { currencyCode: currency, quantity, kit: product.handle };
    addItem({
      ...common,
      id: armVariant.id,
      productId: arm.id,
      title: arm.title,
      variantTitle: armVariant.title,
      price: armVariant.priceCents / 100,
      priceCents: armVariant.priceCents,
      image: arm.images[0]?.url ?? image?.url,
      handle: arm.handle,
      maxQuantity: armVariant.quantityAvailable,
      componentType: 'arm',
      personalisation: cleanName,
    });
    addItem({
      ...common,
      id: holderVariant.id,
      productId: holder.id,
      title: holder.title,
      variantTitle: holderVariant.title,
      price: holderVariant.priceCents / 100,
      priceCents: holderVariant.priceCents,
      image: holder.images[0]?.url ?? image?.url,
      handle: holder.handle,
      maxQuantity: holderVariant.quantityAvailable,
      componentType: 'holder',
    });

    setMessage('Arm and cup holder added to cart!');
    setShowToast(true);
  };

  return (
    <>
      {showToast && <Toast message={message} onClose={() => setShowToast(false)} />}
      <p className="sr-only" aria-live="polite">{message}</p>
      <div className="product-details">
        <div className="product-images">
          <div className="product-main-image">
            {image ? (
              <Image
                src={image.url}
                alt={image.altText || product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                priority
              />
            ) : (
              <div className="product-no-image">No image available</div>
            )}
          </div>
        </div>

        <div className="product-info">
          <h1 className="product-title">{product.title}</h1>

          <div className="product-price-container">
            <span className="product-price">{formatPrice((unitCents / 100).toFixed(2), currency)}</span>
            <span className="product-free-shipping-tag">
              <Truck size={13} /> {LAUNCH_OFFER.freeShipping}
            </span>
          </div>

          <p className="product-lead-time">{LEAD_TIME}</p>

          <fieldset className="kit-group">
            <legend>1. Choose your arm</legend>
            {arms.map((a) => {
              const key = componentKey(a);
              return (
                <label key={key} className={`kit-option ${key === armKey ? 'kit-option-selected' : ''} ${inStock(a) ? '' : 'kit-option-disabled'}`}>
                  <input type="radio" name="kit-arm" value={key} checked={key === armKey} disabled={!inStock(a)} onChange={() => selectArm(key)} />
                  <span>{componentLabel(a)}{inStock(a) ? '' : ' (out of stock)'}</span>
                </label>
              );
            })}
          </fieldset>

          <fieldset className="kit-group">
            <legend>2. Choose your cup holder layout</legend>
            {holders.map((h) => {
              const key = componentKey(h);
              const fits = isCompatible(arm, h);
              const disabled = !fits || !inStock(h);
              return (
                <label key={key} className={`kit-option ${key === holderKey ? 'kit-option-selected' : ''} ${disabled ? 'kit-option-disabled' : ''}`}>
                  <input type="radio" name="kit-holder" value={key} checked={key === holderKey} disabled={disabled} onChange={() => { setHolderKey(key); setQuantity(1); }} />
                  <span>
                    {componentLabel(h)}
                    {!fits ? ` (doesn't fit the ${componentLabel(arm).toLowerCase()})` : !inStock(h) ? ' (out of stock)' : ''}
                  </span>
                </label>
              );
            })}
          </fieldset>

          {allowsPersonalisation(arm) && (
            <div className="product-variants">
              <label htmlFor="kit-name">{arm.metadata?.personalisation_label || 'Name to engrave (optional)'}</label>
              <input
                id="kit-name"
                type="text"
                className="kit-name-input"
                value={name}
                maxLength={maxLength}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(nameError)}
                aria-describedby="kit-name-help"
                autoComplete="off"
              />
              <p id="kit-name-help" className={nameError ? 'kit-help kit-help-error' : 'kit-help'}>
                {nameError || `Up to ${maxLength} characters. Engraved on the arm.`}
              </p>
            </div>
          )}

          <div className="product-quantity">
            <label>Quantity</label>
            <div className="product-purchase-row">
              <div className="quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={!isAvailable || quantity <= 1} className="quantity-button" aria-label="Decrease quantity">
                  <Minus size={16} />
                </button>
                <span className="quantity-value">{isAvailable ? quantity : 0}</span>
                <button onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))} disabled={!isAvailable || quantity >= maxQuantity} className="quantity-button" aria-label="Increase quantity">
                  <Plus size={16} />
                </button>
              </div>
              <button onClick={handleAddToCart} disabled={!isAvailable || Boolean(nameError)} className="product-add-to-cart">
                <ShoppingCart size={20} />
                {!isAvailable ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>

          <div className="product-description">
            <div
              className="product-description-content"
              dangerouslySetInnerHTML={{ __html: formatDescriptionToHtml(product.description) }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
