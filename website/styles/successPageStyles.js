import styled from "@emotion/styled";

export const SuccessContainer = styled("div")({
  position: "relative",
  minHeight: "100vh",
  background: "#FFFFFF",
  fontFamily: "Kanit",
  paddingTop: "110px",
  paddingBottom: "80px",
  overflow: "hidden",
  "@media (max-width: 768px)": {
    paddingTop: "64px",
    paddingBottom: "40px",
  },
});

export const GradientBanner = styled("div")({
  position: "absolute",
  top: "104px",
  left: 0,
  right: 0,
  height: "150px",
  background: "linear-gradient(90deg, #8D2DF2 0%, #A64DF0 42%, #E58FC2 100%)",
  zIndex: 0,
  "@media (max-width: 768px)": {
    top: "52px",
    height: "104px",
  },
});

export const SuccessBox = styled("div")({
  position: "relative",
  zIndex: 1,
  width: "650px",
  maxWidth: "calc(100% - 32px)",
  margin: "40px auto 0",
  padding: "28px",
  background: "#FFFFFF",
  borderRadius: "28px",
  border: "1px solid #E8EFF4",
  boxShadow: "2px 6px 38px 0 rgba(19, 7, 55, 0.12)",
  textAlign: "center",
  "@media (max-width: 768px)": {
    margin: "16px 16px 0",
    padding: "20px",
    borderRadius: "20px",
  },
});

export const SuccessIllustration = styled("img")({
  display: "block",
  width: "118px",
  height: "auto",
  margin: "0 auto 18px",
});

export const SuccessTitle = styled("h1")({
  fontFamily: "Kanit",
  fontWeight: 800,
  fontSize: "30px",
  lineHeight: 1.18,
  color: "#112B3C",
  margin: 0,
  "@media (max-width: 768px)": {
    fontSize: "24px",
  },
});

export const SuccessSubtitle = styled("p")({
  fontSize: "13px",
  color: "#6B7280",
  margin: "10px 0 30px",
  fontFamily: "Montserrat",
  lineHeight: 1.6,
});

export const InfoRow = styled("div")({
  display: "flex",
  alignItems: "stretch",
  textAlign: "left",
  marginBottom: "8px",
  "@media (max-width: 560px)": {
    flexDirection: "column",
    gap: "16px",
  },
});

export const InfoCol = styled("div")({
  flex: 1,
  padding: "0 20px",
  "&:first-of-type": { paddingLeft: 0 },
  "&:last-of-type": { paddingRight: 0 },
  "& + &": {
    borderLeft: "1px solid #ECECEC",
  },
  "@media (max-width: 560px)": {
    padding: 0,
    "& + &": { borderLeft: "none" },
  },
});

export const InfoLabel = styled("div")({
  fontFamily: "Montserrat",
  fontWeight: 700,
  fontSize: "13px",
  color: "#112B3C",
  marginBottom: "5px",
});

export const InfoValue = styled("div")({
  fontFamily: "Montserrat",
  fontWeight: 400,
  fontSize: "13px",
  color: "#6B7280",
  wordBreak: "break-word",
});

export const Divider = styled("hr")({
  border: "none",
  borderTop: "1px solid #ECECEC",
  margin: "26px 0",
});

export const SectionTitle = styled("div")({
  fontFamily: "Montserrat",
  fontWeight: 700,
  fontSize: "14px",
  color: "#112B3C",
  textAlign: "left",
  marginBottom: "14px",
});

export const LineItem = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
  fontFamily: "Montserrat",
  fontSize: "13px",
  color: "#6B7280",
  padding: "7px 0",
});

export const LineItemPrice = styled("span")({
  fontFamily: "Montserrat",
  fontSize: "13px",
  color: "#112B3C",
  fontWeight: 500,
  whiteSpace: "nowrap",
  marginLeft: "16px",
});

export const TotalRow = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontFamily: "Montserrat",
  fontWeight: 700,
  fontSize: "14px",
  color: "#112B3C",
  padding: "10px 0 0",
  textAlign: "right",
  wordBreak: "break-word",
  minWidth: 0,

  "@media (max-width: 768px)": {
    textAlign: "left",
    fontSize: "15px",
  },
});

export const StatusBadgeBase = styled("div")({
  display: "inline-flex",
  alignItems: "center",
  padding: "0.7rem 1rem",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: "Montserrat",
  marginBottom: "8px",
});

export const StatusBadgeSuccess = styled(StatusBadgeBase)({
  background: "#ECFDF5",
  color: "#059669",
  border: "1px solid #A7F3D0",
});

export const StatusBadgePending = styled(StatusBadgeBase)({
  background: "#FEF3C7",
  color: "#D97706",
  border: "1px solid #FCD34D",
});

export const StatusBadgeError = styled(StatusBadgeBase)({
  background: "#FEF2F2",
  color: "#DC2626",
  border: "1px solid #FECACA",
});

export const ButtonGroup = styled("div")({
  display: "flex",
  gap: "12px",
  marginTop: "30px",
  "@media (max-width: 480px)": {
    flexDirection: "column",
  },
});

export const PrimaryButton = styled("button")({
  flex: 1,
  padding: "13px 28px",
  fontSize: "15px",
  fontWeight: 600,
  fontFamily: "Kanit",
  background: "linear-gradient(90deg, #8D2DF2 0%, #C77DFF 100%)",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(141, 45, 242, 0.35)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
});

export const SecondaryButton = styled("button")({
  flex: 1,
  padding: "13px 28px",
  fontSize: "15px",
  fontWeight: 600,
  fontFamily: "Kanit",
  background: "#FFFFFF",
  color: "#8D2DF2",
  border: "2px solid #8D2DF2",
  borderRadius: "12px",
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    background: "#FAEEFA",
    transform: "translateY(-2px)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
});
