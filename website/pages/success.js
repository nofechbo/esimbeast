import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchPlanByUniqueName } from "@/utils/fetchPlans";
import {
  ButtonGroup,
  DetailCard,
  DetailLabel,
  DetailRow,
  DetailValue,
  PrimaryButton,
  SecondaryButton,
  StatusBadgeError,
  StatusBadgePending,
  StatusBadgeSuccess,
  SuccessBox,
  SuccessContainer,
  SuccessIcon,
  SuccessSubtitle,
  SuccessTitle,
} from "@/styles/successPageStyles";

export default function SuccessPage() {
  const router = useRouter();
  const [plan, setPlan] = useState(null);
  const [intent, setIntent] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState(null); // 'pending' | 'ok' | 'error'
  const { payment_intent, session_id } = router.query;
  const intentId = payment_intent || session_id;

  useEffect(() => {
    if (!intentId) return;

    const fetchIntent = async () => {
      try {
        const res = await fetch(
          `/api/payment/get-payment-intent?payment_intent=${intentId}`
        );
        const data = await res.json();

        if (res.ok && data) {
          setIntent(data);
          setMetadata(data.metadata || null);
        } else console.error("API returned error:", data);
      } catch (err) {
        console.error("Failed to load payment intent:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIntent();
  }, [intentId]);

  useEffect(() => {
    if (!metadata?.uniqueName) return;

    const fetchPlan = async () => {
      setPlanLoading(true);
      try {
        const plan = await fetchPlanByUniqueName(intent.metadata.uniqueName);
        setPlan(plan);
      } catch (err) {
        console.error("Failed to load plan data:", err);
        setPlan(null);
      } finally {
        setPlanLoading(false);
      }
    };

    fetchPlan();
  }, [metadata?.uniqueName]);

  useEffect(() => {
    if (!intent || intent.status !== "succeeded") return;
    if (!intent.metadata?.uniqueName || !intent.metadata?.qty) return;

    const key = `ordered:${intent.id}`;
    if (sessionStorage.getItem(key)) return; // prevent duplicate redeems!

    const orderPlan = async () => {
      try {
        setOrderStatus("pending");
        const res = await fetch("/api/orderPlan/order-and-redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: intent.receipt_email,
            metadata,
          }),
        });
        const data = await res.json();

        if (res.ok && !data.error) {
          sessionStorage.setItem(key, "1");
          setOrderStatus("ok");
        } else {
          console.error(
            `order-and-redeem failed: code: ${res.status},\nerror: ${
              data.error || data
            }`
          );
          setOrderStatus("error");
        }
      } catch (e) {
        console.error("order-and-redeem error:", e);
        setOrderStatus("error");
      }
    };
    orderPlan();
  }, [intent, metadata]);

  if (loading) return <p>Loading...</p>;
  if (!intent) return <p>Could not load payment info.</p>;
  if (planLoading) return <p>Loading plan details...</p>;
  if (!plan) return <p>Could not load plan details.</p>;

  return (
    <SuccessContainer>
      <SuccessBox>
        <SuccessIcon>✓</SuccessIcon>

        <SuccessTitle>
          Payment {intent.status === "succeeded" ? "Successful" : "Received"}!
        </SuccessTitle>

        <SuccessSubtitle>
          {intent.status === "succeeded"
            ? "Thank you for your purchase! Your eSIM order is being processed."
            : "We've received your payment and will process your order shortly."}
        </SuccessSubtitle>

        {intent.status === "succeeded" && orderStatus && (
          <>
            {orderStatus === "pending" && (
              <StatusBadgePending>
                ⏳ Processing your eSIM order...
              </StatusBadgePending>
            )}
            {orderStatus === "ok" && (
              <StatusBadgeSuccess>
                🎉 eSIM order placed successfully!
              </StatusBadgeSuccess>
            )}
            {orderStatus === "error" && (
              <StatusBadgeError>
                ⚠️ Order pending - we'll process it shortly
              </StatusBadgeError>
            )}
          </>
        )}

        <DetailCard>
          <DetailRow>
            <DetailLabel>Plan</DetailLabel>
            <DetailValue>{plan.name || "Your Plan"}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Amount Paid</DetailLabel>
            <DetailValue>
              ${(intent.amount / 100).toFixed(2)}{" "}
              {(intent.currency || "usd").toUpperCase()}
            </DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Email</DetailLabel>
            <DetailValue>{intent.receipt_email || "Not provided"}</DetailValue>
          </DetailRow>
          <DetailRow>
          <DetailLabel>Order Confirmation</DetailLabel>
            <DetailValue>{intent.id}</DetailValue>
</DetailRow>
          
        </DetailCard>

        {orderStatus === "ok" && (
          <div
            style={{
              background: "#F0F9FF",
              padding: "1.25rem",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              textAlign: "left",
              border: "1px solid #BAE6FD",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#112B3C",
                marginBottom: "0.5rem",
                fontFamily: "Kanit",
              }}
            >
              📧 What's Next?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6B7280",
                margin: 0,
                lineHeight: "1.6",
                fontFamily: "Montserrat",
              }}
            >
              Your eSIM QR code and installation instructions have been sent to
              your email. Check your inbox (and spam folder) in the next few
              minutes.
            </p>
          </div>
        )}

        <ButtonGroup>
          <PrimaryButton onClick={() => router.push("/")}>
            Browse More Plans
          </PrimaryButton>
          <SecondaryButton onClick={() => window.print()}>
            Print Receipt
          </SecondaryButton>
        </ButtonGroup>
      </SuccessBox>
    </SuccessContainer>
  );
}
