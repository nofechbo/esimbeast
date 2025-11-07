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

export default function CheckoutPage() {
  const router = useRouter();
  const { uniqueName, qty } = router.query;
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    if (!uniqueName) return;
    fetchPlanByUniqueName(uniqueName).then(setPlan);
  }, [uniqueName]);

  if (!plan || !qty) return <div>Missing plan info</div>;

  const quantity = Number(qty);
  const total = plan.price * quantity;

  return (
    <ContentWrapper>
      <PlanPageWrapper>
        <PageTitle>Confirm and pay</PageTitle>

        {plan ? (
          <PaymentFlow plan={plan} qty={quantity} />
        ) : (
          <p>Loading payment form…</p>
        )}
      </PlanPageWrapper>

      <SummaryPanel>
        <PanelTitle>Plan details</PanelTitle>

        {plan ? (
          <>
            <DetailRow>
              <DetailLabel>Plan</DetailLabel>
              <DetailValue>{plan.name}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Period</DetailLabel>
              <DetailValue>{plan.days} days</DetailValue>
            </DetailRow>

            <SummaryDivider />

            <DetailRow>
              <TotalLabel>Total price</TotalLabel>
              <TotalValue>${total.toFixed(2)}</TotalValue>
            </DetailRow>
          </>
        ) : (
          <p>Loading summary…</p>
        )}
      </SummaryPanel>
    </ContentWrapper>
  );
}
