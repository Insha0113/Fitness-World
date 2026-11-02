"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (evt: string, cb: (r: { error?: { description?: string } }) => void) => void };
declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/**
 * Opens Razorpay Checkout for a plan price. Success in the browser only
 * triggers server verification; the confirmation page reads the result
 * from the database.
 */
export function useCheckout() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "starting" | "open" | "verifying">("idle");
  const [error, setError] = useState<string | null>(null);

  const pay = useCallback(
    async (planPriceId: string) => {
      setError(null);
      setStatus("starting");
      const ok = await loadScript();
      if (!ok || !window.Razorpay) {
        setStatus("idle");
        setError("Couldn't load the payment window. Check your connection or disable blockers and try again.");
        return;
      }
      const res = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planPriceId }),
      }).catch(() => null);
      const order = await res?.json().catch(() => null);
      if (!res?.ok || !order) {
        setStatus("idle");
        setError(order?.error ?? "Couldn't start the payment. Please try again.");
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "Fitness World",
        description: order.description,
        prefill: order.prefill,
        theme: { color: "#FF5A1A" },
        modal: {
          ondismiss: () => setStatus("idle"),
        },
        handler: async (r: RazorpayResponse) => {
          setStatus("verifying");
          await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(r),
          }).catch(() => null);
          // Whatever the verify call returned, the confirmation page shows the
          // server's truth (and keeps checking if the webhook is still pending).
          router.push(`/checkout/complete?order=${encodeURIComponent(r.razorpay_order_id)}`);
        },
      });
      rzp.on("payment.failed", (r) => {
        setError(`Payment failed: ${r.error?.description ?? "please try another method"}. Your membership was not activated; any amount debited for a failed payment is refunded by your bank.`);
      });
      setStatus("open");
      rzp.open();
    },
    [router]
  );

  return { pay, status, error };
}
