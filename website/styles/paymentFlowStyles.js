import styled from "@emotion/styled";

export const PaymentWrapper = styled("div")({
  maxWidth: "600px",
  margin: "0 auto",
  padding: "2rem 1rem",
  fontFamily: "Kanit",
  textAlign: "left",
  color: "#112B3C",
});

export const EmailVerification = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  marginBottom: "2.5rem",
  background: "#FAEEFA",
  border: "1px solid #FFE4F0",
  borderRadius: "22px",
  padding: "2rem",
  boxShadow: "2px 6px 20px rgba(17, 43, 60, 0.08)",
});

export const VerificationInput = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",

  input: {
    flex: 1,
    padding: "14px 18px",
    fontSize: "16px",
    fontFamily: "Montserrat",
    border: "1px solid #E2DFE7",
    borderRadius: "50px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    "&:focus": {
      borderColor: "#8D2DF2",
      boxShadow: "0 0 0 3px rgba(141,45,242,0.15)",
    },
  },
});

export const VerificationButton = styled("button")({
  flexShrink: 0,
  height: "48px",
  padding: "0 24px",
  fontSize: "16px",
  fontFamily: "Kanit",
  fontWeight: 600,
  color: "#FFF",
  background: "linear-gradient(90deg, #8D2DF2 0%, #FF82BA 100%)",
  border: "none",
  borderRadius: "100px",
  cursor: "pointer",
  transition: "opacity 0.2s",
  "&:hover": { opacity: 0.9 },
});

export const Info = styled("p")({
  color: "#3E484E",
  fontFamily: "Kanit",
  fontSize: "15px",
  margin: "0.25rem 0",
});

export const Success = styled("p")({
  color: "#008D5E",
  fontFamily: "Kanit",
  fontWeight: 600,
});

export const Error = styled("p")({
  color: "#D92B2B",
  fontFamily: "Kanit",
  fontWeight: 600,
});

export const PaymentTitle = styled('h3')({
  color: '#112B3C',
  fontFamily: 'Kanit',
  fontSize: '22px',
  fontWeight: 600,
  lineHeight: '30px',
  marginTop: '2rem',
  marginBottom: '1rem',
});
