import React, { useEffect, useState } from "react";
import { loadRazorpayScript } from "../../utils/razorpay";
import { RazorpayCheckoutModal } from "../../components/common/RazorpayCheckoutModal";

export interface RazorpayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  serviceName?: string;
  title?: string;
  orderDescription?: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (details: { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string }) => void;
  onFailure?: (error: string) => void;
}

export const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  serviceName,
  title,
  orderDescription,
  description,
  customerName = "Guest Traveler",
  customerEmail = "guest@routripo.com",
  customerPhone = "9999999999",
  onSuccess,
  onFailure
}) => {
  const effectiveServiceName = serviceName || title || "RoutTripo Travel";
  const effectiveDescription = orderDescription || description || "Travel Booking Payment";
  const [orderId, setOrderId] = useState<string>(`order_${Date.now()}`);
  const [showInteractiveModal, setShowInteractiveModal] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setShowInteractiveModal(false);
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
          if (orderData?.id || orderData?.orderId) {
            setOrderId(orderData?.id || orderData?.orderId);
          }
        }

        const effectiveKey = orderData?.keyId || orderData?.key || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;
        const hasLiveMerchantKey = Boolean(
          effectiveKey && 
          effectiveKey.length > 8 && 
          !effectiveKey.includes("dummy") && 
          !effectiveKey.includes("Mock") && 
          !orderData?.isSandbox
        );

        // Try loading Razorpay script
        if (typeof (window as any).Razorpay === "undefined") {
          await loadRazorpayScript();
        }

        // If official Razorpay is available with a verified live merchant key, open standard checkout popup
        if (hasLiveMerchantKey && typeof (window as any).Razorpay !== "undefined") {
          const options = {
            key: effectiveKey,
            amount: orderData?.amount || Math.round(amount * 100),
            currency: orderData?.currency || "INR",
            name: effectiveServiceName,
            description: effectiveDescription,
            order_id: orderData?.id || orderId,
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
                    razorpay_order_id: response.razorpay_order_id || orderData?.id,
                    razorpay_signature: response.razorpay_signature
                  });
                  onClose();
                } else {
                  if (onFailure) onFailure(verifyData.error || "Payment signature verification failed");
                  onClose();
                }
              } catch (err: any) {
                if (onFailure) onFailure(err?.message || "Payment verification network error");
                onClose();
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
          return;
        }

        // If in dev/test/sandbox mode or official popup cannot run, launch the interactive Razorpay modal!
        // Payment will STRICTLY require user interaction in the Razorpay UI (UPI QR, Card, Netbanking, Wallet).
        // It NEVER automatically completes without user action!
        if (isMounted) {
          setShowInteractiveModal(true);
        }
      } catch (err: any) {
        console.warn("Falling back to interactive Razorpay UI:", err?.message);
        if (isMounted) {
          setShowInteractiveModal(true);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isOpen, amount]);

  if (!isOpen) return null;

  if (showInteractiveModal) {
    return (
      <RazorpayCheckoutModal
        isOpen={isOpen}
        onClose={() => {
          setShowInteractiveModal(false);
          onClose();
        }}
        amount={amount}
        orderId={orderId}
        serviceName={effectiveServiceName}
        orderDescription={effectiveDescription}
        customerName={customerName}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        onSuccess={(details) => {
          setShowInteractiveModal(false);
          onSuccess({
            razorpay_payment_id: details.razorpay_payment_id,
            razorpay_order_id: details.razorpay_order_id || orderId,
            razorpay_signature: details.razorpay_signature
          });
        }}
        onFailure={(err) => {
          setShowInteractiveModal(false);
          if (onFailure) onFailure(err);
          onClose();
        }}
      />
    );
  }

  return null;
};
