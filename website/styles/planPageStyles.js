import styled from "@emotion/styled";
import Link from "next/link";

export const ContentWrapper = styled("div")({
  display: "flex",
  gap: 115,
  alignItems: "flex-start",
  maxWidth: "1320px",
  margin: "0 auto",
  padding: "40px 8px",
});

export const PlanPageWrapper = styled("div")({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  paddingTop: 40,
  fontFamily: "Kanit",
  textAlign: "left",
  width: 800,
  flex: "0 0 auto",
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

export const CompatibilityWrapper = styled("div")({
  display: "flex",
  alignItems: "flex-start",
  gap: "8px",
  marginBottom: "30px",
});

export const CompatibilityTextWrapper = styled("div")({
  display: "inline-block",
});

export const CompatibilityUnderline = styled("div")({
  width: "170px",
  height: "1px",
  background: "#8D2DF2",
  marginTop: "0.5px",
  marginLeft: "-18px",
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

export const PlanHeaderRow = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
});

export const FlagsContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "flex-end",
  flexDirection: "row-reverse",
  marginTop: "-12px",
});

export const CountryFlag = styled("img")({
  width: 46,
  height: 46,
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid #FFF",
  marginRight: "-8px",
  "&:first-of-type": {
    marginLeft: 0,
  },
});


export const MainPlanFeatures = styled("p")({
  fontFamily: "Kanit",
  fontSize: "22px",
  fontWeight: 600,
  lineHeight: "36px",
  letterSpacing: "0.4px",
  marginBottom: "12px",
  color: "#9B38EB",
  "& > span": {
    background: "linear-gradient(90deg, #8D2DF2 0%, #D946EF 40%, #FF82BA 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
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

export const SummaryPanel = styled("div")({
  width: "458px",
  minHeight: "445px",
  flexShrink: 0,
  borderRadius: "38px",
  border: "1px solid #E8EFF4",
  background: "#FFF",
  boxShadow: "2px 6px 38px 0 rgba(17, 43, 60, 0.12)",
  padding: "32px 58px",
  display: "flex",
  flexDirection: "column",
  gap: 40,
  position: "sticky",
  top: 100,
  alignSelf: "flex-start",
});

export const PanelTitle = styled("h3")({
  color: "#3E484E",
  fontFamily: "Kanit",
  fontSize: "20px",
  fontWeight: 700,
  lineHeight: "18px",
  margin: 0,
});

export const DetailRow = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export const DetailLabel = styled("span")({
  color: "#3E484E",
  fontFamily: "Kanit",
  fontSize: "16px",
  fontWeight: 400,
  lineHeight: "16px",
});

export const DetailValue = styled("span")({
  color: "#3E484E",
  textAlign: "right",
  fontFamily: "Kanit",
  fontSize: "16px",
  fontWeight: 400,
  lineHeight: "16px",
  letterSpacing: "0.6px",
});

export const SummaryDivider = styled("div")({
  width: "342px",
  height: "1px",
  flexShrink: 0,
  background: "#E2DFE7",
  margin: "4px 0",
});

export const TotalLabel = styled("span")({
  color: "#3E484E",
  fontFamily: "Kanit",
  fontSize: "16px",
  fontWeight: 700,
  lineHeight: "16px",
});

export const TotalValue = styled("span")({
  color: "#3E484E",
  textAlign: "right",
  fontFamily: "Kanit",
  fontSize: "16px",
  fontWeight: 700,
  lineHeight: "16px",
  letterSpacing: "0.6px",
});

export const SummaryPurchaseButton = styled("button")({
  display: "flex",
  width: "342px",
  height: "58px",
  padding: "12px 38px",
  justifyContent: "center",
  alignItems: "center",
  gap: "10px",
  flexShrink: 0,
  borderRadius: "100px",
  background: "linear-gradient(90deg, #8D2DF2 0%, #FF82BA 100%)",
  border: "none",
  cursor: "pointer",
  color: "#FFF",
  textAlign: "center",
  fontFamily: "Montserrat",
  fontSize: "18px",
  fontWeight: 700,
  lineHeight: "16px",
  "&:hover": {
    opacity: 0.9,
  },
});

export const ContinueShoppingLink = styled(Link)({
  width: "216px",
  textAlign: "center",
  fontFamily: "Montserrat",
  fontSize: "18px",
  fontWeight: 700,
  lineHeight: "16px",
  background: "linear-gradient(90deg, #8D2DF2 0%, #D94BE5 100%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  textDecoration: "none",
  margin: "0 auto",
  display: "block",
  "&:hover": {
    opacity: 0.8,
  },
});
