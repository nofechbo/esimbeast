import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PaymentFlow from "@/components/PaymentFlow";
import { fetchPlanByUniqueName } from "@/utils/fetchPlans";
import {
  ContentWrapper,
  DetailLabel,
  DetailRow,
  DetailValue,
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

  return (
    <ContentWrapper>
      <PlanPageWrapper>
        <PageTitle>Confirm and pay</PageTitle>

        {plan ? (
          <PaymentFlow plan={plan} qty={quantity} days={displayDays} data={displayDataNumber} countryCode={code} />
        ) : (
          <p>Loading payment form…</p>
        )}
      </PlanPageWrapper>

      <SummaryPanel>
        <PanelTitle>Plan details</PanelTitle>

        {plan ? (
          <>
            <DetailRow>
              <DetailLabel>Plan size</DetailLabel>
              <DetailValue>{formatDataSize(displayDataNumber)}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Period</DetailLabel>
              <DetailValue>{formatDuration(displayDays)}</DetailValue>
            </DetailRow>

            <SummaryDivider />

            <DetailRow>
              <TotalLabel>Total price</TotalLabel>
              <TotalValue>${(total / 100).toFixed(2)}</TotalValue>
            </DetailRow>
          </>
        ) : (
          <p>Loading summary…</p>
        )}
      </SummaryPanel>
    </ContentWrapper>
  );
}
