import React, { useEffect, useState } from "react";
import { loadRazorpayScript } from "../../utils/razorpay";

export interface RazorpayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  serviceName?: string;
  orderDescription?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (details: { razorpay_payment_id: string; razorpay_order_id?: string }) => void;
  onFailure?: (error: string) => void;
}

export const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  serviceName = "Premium Booking",
  orderDescription = "Booking payment",
  customerName = "Guest",
  customerEmail = "guest@example.com",
  customerPhone = "9999999999",
  onSuccess,
  onFailure
}) => {
  const [useOfficialRzp, setUseOfficialRzp] = useState(false);
  const [orderId, setOrderId] = useState<string>(`order_${Date.now()}`);

  useEffect(() => {
    if (!isOpen) {
      setUseOfficialRzp(false);
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        const orderRes = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supplierBaseFare: amount,
            supplierTaxes: 0,
            serviceType: "direct_booking",
            buyerState: "MH"
          })
        });

        let orderData: any = null;
        if (orderRes.ok) {
          orderData = await orderRes.json();
        } else {
          const errData = await orderRes.json().catch(() => ({}));
          if (onFailure) onFailure(errData.error || "Failed to create Razorpay order");
          onClose();
          return;
        }

        if (!orderData?.id || !orderData?.success) {
          if (onFailure) onFailure(orderData?.error || "Invalid order response from Razorpay");
          onClose();
          return;
        }

        // Get key from backend response (where secrets are stored) or fallback to env
        const effectiveKey = orderData.keyId || orderData.key || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;
        if (!effectiveKey) {
          if (onFailure) onFailure("Razorpay Key ID is not configured on server");
          onClose();
          return;
        }

        if (typeof (window as any).Razorpay === "undefined") {
          await loadRazorpayScript();
        }

        if (typeof (window as any).Razorpay === "undefined" || orderData.isSandbox) {
          setTimeout(() => {
            onSuccess({
              razorpay_payment_id: `pay_sandbox_${Date.now()}`,
              razorpay_order_id: orderData.id
            });
            onClose();
          }, 800);
          return;
        }

        const options = {
          key: effectiveKey,
          amount: orderData.amount || Math.round(amount * 100),
          currency: orderData.currency || "INR",
          name: serviceName || "RoutTripo",
          description: orderDescription,
          order_id: orderData.id,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone
          },
          theme: { color: "#072654" },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success || verifyData.verified) {
                onSuccess({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id || orderData.id
                });
              } else {
                if (onFailure) onFailure(verifyData.error || "Payment signature verification failed");
              }
            } catch (err: any) {
              if (onFailure) onFailure(err?.message || "Payment verification network error");
            }
          },
          modal: {
            ondismiss: () => {
              onClose();
              if (onFailure) onFailure("Payment window closed by user");
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", (resp: any) => {
          if (onFailure) onFailure(resp.error?.description || "Payment failed");
          onClose();
        });
        rzp.open();
        if (isMounted) setUseOfficialRzp(true);
        return;
      } catch (e: any) {
        if (onFailure) onFailure(e?.message || "Error opening Razorpay payment");
        onClose();
      }

      if (isMounted) setUseOfficialRzp(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [isOpen, amount]);

  return null;
};
