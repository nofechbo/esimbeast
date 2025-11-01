import styled from "@emotion/styled";
import Link from "next/link";

export const PlanPageWrapper = styled("div")({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  paddingTop: 80,
  fontFamily: "Kanit",
  textAlign: "left",
});

export const PageTitle = styled("h2")({
  color: "#112B3C",
  fontFamily: "Kanit",
  fontSize: "48px",
  fontWeight: 800,
  lineHeight: "52px",
  letterSpacing: "0.4px",
  marginBottom: "20px",
});

export const SeoText = styled("p")({
  color: "#3E484E",
  fontFamily: "Kanit",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "26px",
  width: "744px",
  marginBottom: "10px",
});

export const CompatibilityLink = styled(Link)({
  fontFamily: "Kanit",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "16px",
  background: "linear-gradient(90deg, #8D2DF2 0%, #FF82BA 100%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  display: "inline-block",
  marginBottom: "30px",
  textDecoration: "none",
});

export const DetailsBox = styled("div")({
  width: "800px",
  minHeight: "683px",
  borderRadius: "22px",
  border: "1px solid #FFE4F0",
  background: "#FAEEFA",
  padding: "32px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
});

export const Price = styled("p")({
  color: "#112B3C",
  fontFamily: "Kanit",
  fontSize: "28px",
  fontWeight: 600,
  lineHeight: "36px",
  letterSpacing: "0.4px",
  marginBottom: "8px",
});

export const MainPlanFeatures = styled("p")({
  fontFamily: "Kanit",
  fontSize: "22px",
  fontWeight: 600,
  lineHeight: "36px",
  letterSpacing: "0.4px",
  background: "linear-gradient(90deg, #8D2DF2 0%, #FF82BA 132.58%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: "12px",
});

export const PlanDetails = styled("p")({
  color: "#0A1A24",
  fontFamily: "Montserrat",
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: "24px",
  marginBottom: "8px",
});

export const Strong = styled("strong")({
  fontWeight: 700,
});

export const Divider = styled("div")({
  width: "744px",
  height: "1px",
  background: "#E2DFE7",
  margin: "24px 0",
});

export const MoreDetailsTitle = styled("p")({
  fontFamily: "Kanit",
  fontSize: "22px",
  fontWeight: 600,
  lineHeight: "22px",
  letterSpacing: "0.4px",
  background: "linear-gradient(90deg, #8D2DF2 0%, #FF82BA 132.58%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: 10,
});

export const AmountBox = styled("div")({
  width: 180,
  height: 58,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 16,
  border: "1px solid #E2DFE7",
  borderRadius: 50,
  backgroundColor: "#fff",
});

export const QtyButton = styled("button")({
  border: "none",
  background: "transparent",
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    opacity: 0.7,
  },
  "&:disabled": {
    opacity: 0.3,
    cursor: "not-allowed",
  },
});

export const QtyDisplay = styled("span")({
  fontFamily: "Montserrat",
  fontSize: "16px",
  fontWeight: 600,
  color: "#0A1A24",
  minWidth: "30px",
  textAlign: "center",
});

export const QtySelect = styled("select")({
  fontSize: 16,
  padding: "5px 10px",
  borderRadius: 4,
  border: "1px solid #ccc",
  width: "100%",
  height: "100%",
});

export const PurchaseButton = styled("button")({
  marginTop: "1.5rem",
  padding: "10px 20px",
  fontSize: 16,
  borderRadius: 6,
  border: "none",
  backgroundColor: "#8D2DF2",
  color: "white",
  cursor: "pointer",
});

export const PaymentFormWrapper = styled("div")({
  marginTop: "2rem",
  width: "100%",
});