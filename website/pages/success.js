import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchPlanByUniqueName } from "@/utils/fetchPlans";
import SEO from "@/components/SEO";
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
} from "@/styles/successPageStyles";
import { clearReferralCookie, getCookie } from "@/utils/referral";
import { formatDataSize, formatDuration } from "@/utils/formaters";
import { getCountryName } from "@/utils/homepage/codeToCountry";

export default function SuccessPage() {
  const router = useRouter();
  const [plan, setPlan] = useState(null);
  const [intent, setIntent] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null); // 'pending' | 'ok' | 'error'

  const { payment_intent, session_id } = router.query;
  const intentId = payment_intent || session_id;

  const referralCode = getCookie("ref");

  useEffect(() => {
    if (!intentId) return;

    const key = `ordered:${intentId}`;
    if (sessionStorage.getItem(key)) return; // prevent duplicate redeems!

    const orderPlan = async () => {
      try {
        sessionStorage.setItem(key, "1");
        setOrderStatus("pending");
        const res = await fetch("/api/orderPlan/order-and-redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intentId,
            referralCode
          }),
        });
        const data = await res.json();
        setIntent(data.intent);

        if (res.ok && !data.error) {
          setOrderStatus("ok");
          clearReferralCookie();
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
  }, [intentId]);

  useEffect(() => {
    if (!intent?.metadata?.uniqueName) return;

    const fetchPlan = async () => {
      try {
        const plan = await fetchPlanByUniqueName(intent.metadata.uniqueName);
        console.log('plan', plan)
        setPlan(plan);
      } catch (err) {
        console.error("Failed to load plan data:", err);
        setPlan(null);
      }
    };

    fetchPlan();
  }, [intent]);

  return (
    <SuccessContainer>
      <SEO title="Order Confirmation" path="/success" noindex />
      <SuccessBox>
        <SuccessIcon>✓</SuccessIcon>

        <SuccessSubtitle>
          Thank you for your purchase! Your eSIM order is being processed.
        </SuccessSubtitle>

        {orderStatus && (
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
                ⚠️ Error processing your order - please contact us
              </StatusBadgeError>
            )}
          </>
        )}
        {intent && plan && (
          <DetailCard>
            <DetailRow>
              <DetailLabel>Plan</DetailLabel>
              <DetailValue>
                {intent.metadata?.code
                  ? getCountryName(intent.metadata.code)
                  : plan?.name || "Your Plan"}
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Period</DetailLabel>
              <DetailValue>
                {intent.metadata?.days
                  ? formatDuration(parseInt(intent.metadata.days, 10))
                  : formatDuration(plan.days)}
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Data</DetailLabel>
              <DetailValue>
                {intent.metadata?.data
                  ? formatDataSize(parseInt(intent.metadata.data, 10))
                  : formatDataSize(plan.data)}
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Amount Paid</DetailLabel>
              <DetailValue>
                ${(intent.amount / 100).toFixed(2)}{" "}
                {intent.currency.toUpperCase()}
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Email</DetailLabel>
              <DetailValue>
                {intent.receipt_email || "Not provided"}
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Order Confirmation</DetailLabel>
              <DetailValue>{intent.id}</DetailValue>
            </DetailRow>
          </DetailCard>
        )}

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
