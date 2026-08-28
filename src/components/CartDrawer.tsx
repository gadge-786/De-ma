import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, Check, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Order } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckoutSuccess: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutSuccess,
}) => {
  if (!isOpen) return null;

  const [isProcessing, setIsProcessing] = useState(false);
  const [address, setAddress] = useState('742 Evergreen Terrace, Daikanyama Delivery Hub');

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 4.99;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      // Trigger festive celebration confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FF2442', '#ffffff', '#ffd700'],
      });

      const newOrder: Order = {
        id: `ord-${Date.now().toString().slice(-6)}`,
        items: [...cart],
        totalAmount: total,
        status: 'PROCESSING',
        createdAt: new Date().toISOString(),
        shippingAddress: address,
        paymentMethod: 'Instant 1-Click RED Pay (Zero-Cost Escrow)',
        trackingNumber: `RED-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      onCheckoutSuccess(newOrder);
      setIsProcessing(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FF2442] text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-[#111111]">
                Shopping Bag ({cart.reduce((sum, i) => sum + i.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-red-50 text-[#FF2442] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-[#111111]">Your bag is empty</h4>
                <p className="text-xs text-[#666666] max-w-xs mx-auto">
                  Browse community lifestyle notes and tap product hotspot pins to add authentic pieces to your bag.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100"
                  >
                    <img
                      src={item.product.coverImage}
                      alt={item.product.title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#111111] line-clamp-1">{item.product.title}</h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-neutral-400 hover:text-red-500 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-black text-[#FF2442]">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>

                        <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-lg border border-neutral-200">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="text-neutral-500 hover:text-black cursor-pointer p-0.5"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-[#111111] w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            className="text-neutral-500 hover:text-black cursor-pointer p-0.5"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Free Shipping Progress */}
                <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 flex items-center gap-2 text-xs text-[#FF2442] font-semibold">
                  <Truck className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {subtotal >= 50
                      ? '🎉 Free Standard Delivery Unlocked!'
                      : `Add $${(50 - subtotal).toFixed(2)} more for Free Shipping`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Footer */}
          {cart.length > 0 && (
            <div className="p-5 bg-white border-t border-neutral-100 space-y-3">
              {/* Delivery Address Preview */}
              <div className="text-xs space-y-1">
                <span className="font-bold text-[#666666]">Deliver To:</span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-neutral-200 text-[#111111] font-medium"
                />
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#666666]">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#111111] pt-1 border-t border-neutral-100">
                  <span>Total</span>
                  <span className="text-[#FF2442]">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* 1-Click Express Checkout Button */}
              <button
                id="cart-express-checkout-btn"
                disabled={isProcessing}
                onClick={handleCheckout}
                className="w-full py-3 bg-[#FF2442] hover:bg-[#e01e38] disabled:opacity-60 text-white text-sm font-black rounded-xl shadow-md shadow-[#FF2442]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Instant Escrow...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>1-Click Express Checkout (${total.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
