// @ts-nocheck
import { useEffect, useState } from "react";
import { getCountryName } from "@/utils/homepage/codeToCountry";
import {
  AmountBox,
  CompatibilityLink,
  CompatibilityTextWrapper,
  CompatibilityUnderline,
  CompatibilityWrapper,
  ContentWrapper,
  ContinueShoppingLink,
  CountryFlag,
  DetailLabel,
  DetailRow,
  DetailsBox,
  DetailValue,
  FlagsContainer,
  MainPlanFeatures,
  PageTitle,
  PanelTitle,
  PlanDetails,
  PlanHeaderRow,
  PlanPageWrapper,
  Price,
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
import { useRouter } from "next/router";
import FlagIcons from "./common/FlagIcons";
import { handleReferral } from "@/utils/referral";

const MAX_FLAGS_DISPLAY = 12;

export default function PlanPage({ plan, slug }) {
  const [qty, setQty] = useState(1);
  const [totalAmount, setTotalAmount] = useState(plan ? plan.price : 0);
  const router = useRouter();

  const { code, days, data } = router.query;
  const country = code ? getCountryName(code) : null;

  useEffect(() => {
    handleReferral(router);
  }, [router.isReady]);

  useEffect(() => {
    if (plan) {
      setTotalAmount(plan.price * qty);
    }
  }, [qty, plan]);

  if (!plan) {
    return <PageTitle>Plan not found.</PageTitle>;
  }

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

  const handlePurchase = () => {
    router.push({
      pathname: "/payment/checkout",
      query: { uniqueName: plan.uniqueName, qty },
    });
  };

  const planCoverage = plan.countryCodes.map((code) => getCountryName(code));
  
  const formatDataSize = (d) => d === 0 ? "Unlimited" : d < 1 ? `${d * 1000} MB` : `${d} GB`;
  const displayDataNumber = data ? Number(data) : plan.data;
  const displayDataText = formatDataSize(displayDataNumber);

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
        <CompatibilityWrapper>
          <img
            src="/icons/phone.svg"
            alt="phone"
            style={{ width: "9.862px", height: "16px", flexShrink: 0 }}
          />
          <CompatibilityTextWrapper>
            <CompatibilityLink href={"/info/supported-devices"}>
              Check compatibility
            </CompatibilityLink>
            <CompatibilityUnderline />
          </CompatibilityTextWrapper>
        </CompatibilityWrapper>

        <DetailsBox>
          <Price>${plan.price}</Price>

          <PlanHeaderRow>
            <MainPlanFeatures>
              <span>{country ?? plan.name}</span> •{" "}
              <span>{days ?? plan.days} days</span> •{" "}
              <span>{displayDataText}</span>
            </MainPlanFeatures>
            <FlagIcons
              countryCodes={
                code ? [code] : plan.countryCodes.slice(0, MAX_FLAGS_DISPLAY)
              }
              Wrapper={FlagsContainer}
              Flag={CountryFlag}
            />
          </PlanHeaderRow>

          <PlanDetails>
            Service: <Strong>{plan.planType}</Strong>, Speed:{" "}
            <Strong>{plan.networkSpeed}</Strong>, Network:{" "}
            <Strong>{plan.networks.join(", ")}</Strong>, Hotspot:{" "}
            <Strong>{plan.hotSpot ? "Yes" : "No"}</Strong>, Local number:{" "}
            <Strong>{plan.localNumber ? "Yes" : "No"}</Strong>, Activation:{" "}
            <Strong>{plan.activation}</Strong>, eKYC (ID verification):{" "}
            <Strong>{plan.eKYC ? "" : "Not "}Required</Strong>, Delivery:{" "}
            <Strong>{plan.delivery}; 24/7 support.</Strong>
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

          <MainPlanFeatures>
            <span>More details</span>
          </MainPlanFeatures>

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

        <SummaryPurchaseButton onClick={handlePurchase}>
          Purchase
        </SummaryPurchaseButton>

        <ContinueShoppingLink href="/">
          See different plans
        </ContinueShoppingLink>
      </SummaryPanel>
    </ContentWrapper>
  );
}
