import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PaymentFlow from "@/components/PaymentFlow";
import { fetchPlanByUniqueName } from "@/utils/fetchPlans";
import SEO from "@/components/SEO";
import {
  ContentWrapper,
  DetailLabel,
  DetailRow,
  DetailValue,
  MobileSummaryPanel,
  PageTitle,
  PanelTitle,
  PlanPageWrapper,
  SummaryDivider,
  SummaryPanel,
  TotalLabel,
  TotalValue,
} from "@/styles/planPageStyles";
import { formatDataSize, formatDuration } from "@/utils/formaters";

export default function CheckoutPage() {
  const router = useRouter();
  const { uniqueName, qty, days, data, code } = router.query;
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    if (!uniqueName) return;
    fetchPlanByUniqueName(uniqueName).then(setPlan);
  }, [uniqueName]);

  if (!plan || !qty) return <div>Missing plan info</div>;

  const quantity = Number(qty);
  const total = plan.price * quantity;

  // Use query params if available, otherwise fall back to plan defaults
  const displayDataNumber = data ? Number(data) : plan.data;
  const displayDays = days ? Number(days) : plan.days;

  const summaryContent = (
    <>
      <PanelTitle>Plan details</PanelTitle>

      <DetailRow>
        <DetailLabel>Plan size</DetailLabel>
        <DetailValue>{formatDataSize(displayDataNumber)}</DetailValue>
      </DetailRow>

      <DetailRow>
        <DetailLabel>Period</DetailLabel>
        <DetailValue>{formatDuration(displayDays)}</DetailValue>
      </DetailRow>

      <DetailRow>
        <DetailLabel>Quantity</DetailLabel>
        <DetailValue>{quantity}</DetailValue>
      </DetailRow>

      <SummaryDivider />

      <DetailRow>
        <TotalLabel>Total price</TotalLabel>
        <TotalValue>${(total / 100).toFixed(2)}</TotalValue>
      </DetailRow>
    </>
  );

  return (
    <ContentWrapper>
      <SEO title="Checkout" path="/payment/checkout" noindex />
      <PlanPageWrapper>
        <PageTitle>Confirm and pay</PageTitle>

        <PaymentFlow
          plan={plan}
          qty={quantity}
          days={displayDays}
          data={displayDataNumber}
          countryCode={code}
          summary={<MobileSummaryPanel>{summaryContent}</MobileSummaryPanel>}
        />
      </PlanPageWrapper>

      <SummaryPanel>{summaryContent}</SummaryPanel>
    </ContentWrapper>
  );
}
