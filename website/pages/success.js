import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchPlanByUniqueName } from "@/utils/fetchPlans";
import SEO from "@/components/SEO";
import {
  ButtonGroup,
  Divider,
  GradientBanner,
  InfoCol,
  InfoLabel,
  InfoRow,
  InfoValue,
  LineItem,
  LineItemPrice,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
  StatusBadgeError,
  StatusBadgePending,
  StatusBadgeSuccess,
  SuccessBox,
  SuccessContainer,
  SuccessIllustration,
  SuccessSubtitle,
  SuccessTitle,
  TotalRow,
} from "@/styles/successPageStyles";
import { clearReferralCookie, getCookie } from "@/utils/referral";
import { formatDataSize } from "@/utils/formaters";
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

  const currency = intent?.currency ? intent.currency.toUpperCase() : "USD";

  const formatPrice = (amount) => `$${amount.toFixed(2)}`;

  const orderDate = intent?.created
    ? new Date(intent.created * 1000)
    : new Date();
  const formattedDate = orderDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Built as a list so multi-order purchases render every item; today a
  // single payment intent yields one line.
  const lineItems =
    intent && plan
      ? [
          {
            label: `${
              intent.metadata?.code
                ? getCountryName(intent.metadata.code)
                : plan?.name || "Your Plan"
            }, ${
              intent.metadata?.data
                ? formatDataSize(parseInt(intent.metadata.data, 10))
                : formatDataSize(plan.data)
            } x 1`,
            amount: intent.amount / 100,
          },
        ]
      : [];

  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

  const isError = orderStatus === "error";
  const isPending = orderStatus === "pending";

  const title = isError
    ? "Something went wrong"
    : isPending
    ? "Processing your order…"
    : "Thank you!\nYour order is confirmed!";

  const subtitle = isError
    ? "We couldn't complete your order. Please contact us and we'll sort it out."
    : isPending
    ? "Hang tight while we finalize your eSIM order."
    : "Check your inbox for details about your eSIM.";

  return (
    <SuccessContainer>
      <SEO title="Order Confirmation" path="/success" image={null} noindex />
      <GradientBanner />
      <SuccessBox>
        <SuccessIllustration
          src="/success_page_img.svg"
          alt="Order confirmed"
        />

        <SuccessTitle style={{ whiteSpace: "pre-line" }}>{title}</SuccessTitle>

        <SuccessSubtitle>{subtitle}</SuccessSubtitle>

        {isPending && (
          <StatusBadgePending>⏳ Processing your eSIM order…</StatusBadgePending>
        )}
        {isError && (
          <StatusBadgeError>
            ⚠️ Error processing your order — please contact us
          </StatusBadgeError>
        )}

        {intent && plan && !isError && (
          <>
            <InfoRow>
              <InfoCol>
                <InfoLabel>Order number</InfoLabel>
                <InfoValue>#{intent.id}</InfoValue>
              </InfoCol>
              <InfoCol>
                <InfoLabel>Date</InfoLabel>
                <InfoValue>{formattedDate}</InfoValue>
              </InfoCol>
              <InfoCol>
                <InfoLabel>Email</InfoLabel>
                <InfoValue>{intent.receipt_email || "Not provided"}</InfoValue>
              </InfoCol>
            </InfoRow>

            <Divider />

            <SectionTitle>Order details</SectionTitle>
            {lineItems.map((item, i) => (
              <LineItem key={i}>
                <span>{item.label}</span>
                <LineItemPrice>{formatPrice(item.amount)}</LineItemPrice>
              </LineItem>
            ))}
            <TotalRow>
              <span>Total</span>
              <span>
                {formatPrice(total)} {currency}
              </span>
            </TotalRow>

            <Divider />
          </>
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
