import styled from "@emotion/styled";

export const DetailCard = styled("div")({
  background: "linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%)",
  borderRadius: "16px",
  padding: "2rem",
  marginBottom: "1.5rem",
  textAlign: "left",
  border: "2px solid #E8E8E8",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
});

export const DetailRow = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1.2rem 0",
  borderBottom: "1px solid #E8E8E8",
  "&:last-child": {
    borderBottom: "none",
    paddingBottom: 0,
  },
  "&:first-of-type": {
    paddingTop: 0,
  },
});

export const DetailLabel = styled("span")({
  fontSize: "15px",
  color: "#374151",
  fontFamily: "Montserrat",
  fontWeight: 600,
});

export const DetailValue = styled("span")({
  fontSize: "16px",
  color: "#112B3C",
  fontFamily: "Montserrat",
  fontWeight: 700,
});
