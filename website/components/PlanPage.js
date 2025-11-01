import { useEffect, useState } from "react";
import PaymentFlow from "./PaymentFlow";
import { getCountryName } from "@/utils/homepage/codeToCountry";
import {
  AmountBox,
  CompatibilityLink,
  ContentWrapper,
  ContinueShoppingLink,
  DetailLabel,
  DetailRow,
  DetailsBox,
  DetailValue,
  MainPlanFeatures,
  PageTitle,
  PanelTitle,
  PaymentFormWrapper,
  PlanDetails,
  PlanPageWrapper,
  Price,
  PurchaseButton,
  QtyButton,
  QtyDisplay,
  SeoText,
  Strong,
  SummaryDivider,
  SummaryPanel,
  SummaryPurchaseButton,
  TotalLabel,
  TotalValue,
} from "@/styles/planPageStyles";
import { Divider } from "./ContentPage";

export default function PlanPage({ plan, slug }) {
  const [showPayment, setShowPayment] = useState(false);
  const [qty, setQty] = useState(1);
  const [totalAmount, setTotalAmount] = useState(plan ? plan.price : 0);

  if (!plan) {
    return <PageTitle>Plan not found.</PageTitle>;
  }

  useEffect(() => {
    if (plan) {
      setTotalAmount(plan.price * qty);
    }
  }, [qty, plan]);

  const incrementQty = () => {
    if (qty < 30) {
      setQty(qty + 1);
    }
  };

  const decrementQty = () => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  };

  const planCoverage = plan.countryCodes.map((code) => getCountryName(code));

  return (
    <ContentWrapper>
      <PlanPageWrapper>
        <PageTitle>Your plan summary</PageTitle>
        <SeoText>
          {plan.SEOText}
          {/* placeholder for now: */}
          Get uninterrupted data at LTE/4G/5G speeds while leaving roaming fees
          and the search for local SIM cards behind. Stay connected to the web
          using your preferred messaging apps like WhatsApp while you keep your
          original SIM active. Have a stress-free journey with brand name.
        </SeoText>
        {/* check with client what this should link to */}
        <CompatibilityLink href={"/info/supported-devices"}>
          Check compatibility
        </CompatibilityLink>

        <DetailsBox>
          <Price>${plan.price}</Price>

          <MainPlanFeatures>
            {plan.name} • {plan.days} days • {plan.fup}
          </MainPlanFeatures>

          <PlanDetails>
            Service: <Strong>{plan.PlanType}PLACEHOLDER</Strong>, Speed:{" "}
            <Strong>{plan.NetworkSpeed}PLACEHOLDER</Strong>, Network:{" "}
            <Strong>{plan.Networks}PLACEHOLDER</Strong>, Hotspot:{" "}
            <Strong>{plan.HotSpot ? "Yes" : "No"}</Strong>, Local number:{" "}
            <Strong>{plan.LocalNumber ? "Yes" : "No"}</Strong>, Activation:{" "}
            <Strong>{plan.Activation}PLACEHOLDER</Strong>, eKYC (ID
            verification): <Strong>{plan.eKYC ? "" : "Not "}Required</Strong>,
            Delivery: <Strong>{plan.Delivery}PLACEHOLDER; 24/7 support.</Strong>
          </PlanDetails>

          <AmountBox>
            <QtyDisplay>{qty}</QtyDisplay>
            <QtyButton onClick={decrementQty} disabled={qty <= 1}>
              <img src="/minus.svg" alt="Decrease" width="35" height="35" />
            </QtyButton>
            <QtyButton onClick={incrementQty}>
              <img src="/plus.svg" alt="Increase" width="35" height="35" />
            </QtyButton>
          </AmountBox>

          <Divider />

          <MainPlanFeatures>More details</MainPlanFeatures>

          <PlanDetails>
            <Strong>Coverage:</Strong>
            <br />
            {planCoverage.join(", ")}
          </PlanDetails>

          {/* check -> is this really a conditional render? */}
          {plan.reducedSpeed && (
            <PlanDetails>
              {/* check with client what the real title should be */}
              <Strong>Text place:</Strong>
              <br />
              Speed reduction: if necessary, some carriers may reserve the right
              to apply a Fair Usage Policy. Hotspot: enjoy {
                plan.reducedSpeed
              }{" "}
              per day to share with others.
            </PlanDetails>
          )}
        </DetailsBox>
      </PlanPageWrapper>
      <SummaryPanel>
        <PanelTitle>Plan details</PanelTitle>

        <DetailRow>
          <DetailLabel>Period</DetailLabel>
          <DetailValue>{plan.fup}</DetailValue>
        </DetailRow>

        <DetailRow>
          <DetailLabel>Plan size</DetailLabel>
          <DetailValue>{plan.days} days</DetailValue>
        </DetailRow>

        <SummaryDivider />

        <DetailRow>
          <TotalLabel>Total price</TotalLabel>
          <TotalValue>${totalAmount.toFixed(2)}</TotalValue>
        </DetailRow>

        {!showPayment ? (
          <SummaryPurchaseButton onClick={() => setShowPayment(true)}>
            Purchase
          </SummaryPurchaseButton>
        ) : (
          <PaymentFormWrapper>
            <PaymentFlow plan={plan} qty={qty} />
          </PaymentFormWrapper>
        )}

        <ContinueShoppingLink href="/">
          See different plans
        </ContinueShoppingLink>
      </SummaryPanel>
    </ContentWrapper>
  );
}
