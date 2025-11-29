import styled from "@emotion/styled";

export const PaymentWrapper = styled("div")({
  maxWidth: "600px",
  margin: "0 auto",
  padding: "2rem 1rem",
  fontFamily: "Kanit",
  textAlign: "left",
  color: "#112B3C",

  h2: {
    textAlign: "center",
    fontSize: "32px",
    fontWeight: 700,
    marginBottom: "2rem",
  },
});

export const EmailVerification = styled("div")({
  width: "450px",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  marginBottom: "2rem",
  background: "#FFFFFF",
  border: "1px solid #E8E8E8",
  borderRadius: "16px",
  padding: "2rem",
  boxShadow: "0px 4px 12px rgba(17, 43, 60, 0.06)",
});

export const VerificationInput = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",

  input: {
    width: "100%",
    padding: "12px 20px",
    fontSize: "16px",
    fontFamily: "Montserrat",
    border: "1px solid #D4D4D4",
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.2s",
    backgroundColor: "#FAFAFA",
    "&:focus": {
      borderColor: "#8D2DF2",
      backgroundColor: "#FFFFFF",
      boxShadow: "0 0 0 3px rgba(141,45,242,0.1)",
    },
    "&::placeholder": {
      color: "#9CA3AF",
    },
  },
});

export const VerificationButton = styled("button")({
  width: "100%",
  height: "52px",
  padding: "0 24px",
  fontSize: "16px",
  fontFamily: "Kanit",
  fontWeight: 600,
  color: "#FFF",
  background: "linear-gradient(90deg, #8D2DF2 0%, #C77DFF 100%)",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: "0 6px 20px rgba(141,45,242,0.3)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
});
export const Info = styled("p")({
  color: "#6B7280",
  fontFamily: "Montserrat",
  fontSize: "14px",
  margin: "0.5rem 0 0 0",
  lineHeight: "1.5",
});

export const Success = styled("p")({
  color: "#059669",
  fontFamily: "Montserrat",
  fontSize: "14px",
  fontWeight: 600,
  margin: "0.5rem 0 0 0",
  padding: "12px 16px",
  backgroundColor: "#ECFDF5",
  borderRadius: "8px",
  border: "1px solid #A7F3D0",
});

export const Error = styled("p")({
  color: "#DC2626",
  fontFamily: "Montserrat",
  fontSize: "14px",
  fontWeight: 600,
  margin: "0.5rem 0 0 0",
  padding: "12px 16px",
  backgroundColor: "#FEF2F2",
  borderRadius: "8px",
  border: "1px solid #FECACA",
});

export const PaymentTitle = styled("h3")({
  color: "#112B3C",
  fontFamily: "Kanit",
  fontSize: "22px",
  fontWeight: 600,
  lineHeight: "30px",
  marginTop: "2rem",
  marginBottom: "1rem",
});
