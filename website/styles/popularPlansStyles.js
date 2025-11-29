import styled from "@emotion/styled";

export const PopularSection = styled("div")({
  padding: "40px 0",

  "@media (max-width: 768px)": {
    padding: "30px 0",
  },
});

export const PopularTitle = styled("h2")({
  fontFamily: "Kanit",
  fontSize: "16px",
  fontWeight: 600,
  fontStyle: "normal",
  lineHeight: "normal",
  color: "#0A1A24",
  marginBottom: "10px",

  "@media (max-width: 768px)": {
    fontSize: "14px",
  },
});

export const CardGrid = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(5, 212px)",
  gap: "16px",
  marginBottom: "24px",

  "@media (max-width: 768px)": {
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
  },
});

export const PopularCard = styled("div")({
  position: "relative",
  width: "212px",
  height: "124px",
  flexShrink: 0,
  borderRadius: "22px",
  border: "1px solid #FFE4F0",
  background: "#FAEEFA",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  cursor: "pointer",
  transition: "all 0.3s ease",

  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
  },

  "@media (max-width: 768px)": {
    width: "100%",
    height: "110px",
    borderRadius: "18px",
    padding: "12px",
  },
});

export const PlanName = styled("h3")({
  fontFamily: "Kanit",
  fontSize: "20px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "20px",
  background: "linear-gradient(90deg, #8D2DF2 0%, #FF82BA 100%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  margin: 0,
  maxWidth: "calc(100% - 50px)",
  whiteSpace: "normal",

  "@media (max-width: 768px)": {
    fontSize: "16px",
    lineHeight: "18px",
  },
});

export const DetailsContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

export const DetailsText = styled("span")({
  color: "#3E484E",
  fontFamily: "Kanit",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "16px",
  margin: 0,

  "@media (max-width: 768px)": {
    fontSize: "13px",
    lineHeight: "14px",
  },
});

export const Divider = styled("span")({
  color: "#A2A8AD",
  fontFamily: "Kanit",
  fontSize: 16,
  fontStyle: "normal",
  fontWeight: 400,
  lineheight: 16,

  "@media (max-width: 768px)": {
    fontSize: 13,
  },
});

export const PriceValue = styled("span")({
  color: "#3E484E",
  fontFamily: "Kanit",
  fontSize: "14px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "14px",

  "@media (max-width: 768px)": {
    fontSize: "12px",
    lineHeight: "12px",
  },
});

export const FlagWrapper = styled("img")({
  position: "absolute",
  top: 12,
  right: 12,
  width: 32,
  height: 32,
  flexShrink: 0,
  aspectRatio: "1/1",

  "@media (max-width: 768px)": {
    width: 28,
    height: 28,
    top: 10,
    right: 10,
  },
});
