import styled from "@emotion/styled";
import SEO from "./SEO";

export const PageContainer = styled("div")({
  paddingTop: "80px",
  minHeight: "100vh",
  backgroundColor: "white",
});

export const Hero = styled("section")({
  backgroundColor: "#F8F9FA",
  padding: "60px 24px",
  textAlign: "center",
});

export const HeroTitle = styled("h1")({
  fontFamily: "var(--font-kanit)",
  fontSize: "48px",
  fontWeight: 700,
  color: "#112B3C",
  margin: "0 0 16px 0",
  lineHeight: "1.2",
});

export const HeroSubtitle = styled("p")({
  fontFamily: "var(--font-montserrat)",
  fontSize: "18px",
  color: "#666",
  maxWidth: "800px",
  margin: "0 auto",
  lineHeight: "1.6",
});

export const ContentSection = styled("section")({
  maxWidth: "1000px",
  margin: "0 auto",
  padding: "60px 24px",
});

export const SectionTitle = styled("h2")({
  fontFamily: "var(--font-kanit)",
  fontSize: "32px",
  fontWeight: 600,
  color: "#112B3C",
  marginBottom: "24px",
});

export const Paragraph = styled("p")({
  fontFamily: "var(--font-montserrat)",
  fontSize: "16px",
  color: "#444",
  lineHeight: "1.8",
  marginBottom: "24px",
});

export const List = styled("ul")({
  fontFamily: "var(--font-montserrat)",
  fontSize: "16px",
  color: "#444",
  lineHeight: "1.8",
  marginBottom: "40px",
  paddingLeft: "24px",
  listStyleType: "disc",
  listStylePosition: "outside",
});


export const ListItem = styled("li")({
  marginBottom: "12px",
  "& strong": {
    color: "#112B3C",
    fontWeight: 600,
  },
});

export const BenefitsGrid = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "24px",
  marginBottom: "40px",
});

export const BenefitCard = styled("div")({
  padding: "24px",
  backgroundColor: "#F8F9FA",
  borderRadius: "12px",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
  },
});

export const BenefitTitle = styled("h3")({
  fontFamily: "var(--font-kanit)",
  fontSize: "20px",
  fontWeight: 600,
  color: "#ec4899",
  marginBottom: "12px",
});

export const BenefitText = styled("p")({
  fontFamily: "var(--font-montserrat)",
  fontSize: "14px",
  color: "#444",
  lineHeight: "1.6",
  margin: 0,
});

export const Divider = styled("hr")({
  border: "none",
  borderTop: "2px solid #B7C8D6",
  margin: "40px 0",
  opacity: 0.9,
});


export default function ContentPage({ title, subtitle, description, path, children }) {
  return (
    <PageContainer>
      <SEO title={title} description={description} path={path} />
      <Hero>
        <HeroTitle>{title}</HeroTitle>
        {subtitle && <HeroSubtitle>{subtitle}</HeroSubtitle>}
      </Hero>
      <ContentSection>{children}</ContentSection>
    </PageContainer>
  );
}

