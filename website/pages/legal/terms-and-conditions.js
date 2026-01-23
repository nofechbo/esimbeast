import ContentPage, {
  SectionTitle,
  Paragraph,
  Divider,
} from "@/components/ContentPage";
import { SITE_EMAIL, SITE_NAME, SITE_URL } from "@/config";

export default function TermsAndConditionsPage() {
  const pageSubtitle = `Terms of Service for ${SITE_NAME}`;

  return (
    <ContentPage
      title="Terms of Service"
      subtitle={pageSubtitle}
      description="Read our terms of service for using eSIM services. Understand service terms, payment policies, user obligations, and limitations of liability."
      path="/legal/terms-and-conditions"
    >
      <SectionTitle>1) Introduction</SectionTitle>
      <Paragraph>
        Welcome to {SITE_URL.replace('https://', '')} (the "Website"), operated by:
      </Paragraph>
      <Paragraph>
        <strong>KHITAR LIMITED</strong>
        <br />
        Address: 33 Wyndham Street, 22F, Hong Kong Island, Hong Kong
        <br />
        Email:{" "}
        <a
          href={`mailto:${SITE_EMAIL}`}
          style={{ color: "#ec4899", textDecoration: "none", fontWeight: 600 }}
        >
          {SITE_EMAIL}
        </a>
      </Paragraph>
      <Paragraph>
        By accessing or using our Website and services, you agree to these
        Terms. If you do not agree, please do not use the Website.
      </Paragraph>
      <Divider />
      <SectionTitle>2) Using the Website</SectionTitle>
      <ul style={{ marginLeft: "1.5rem", marginBottom: "1rem", lineHeight: "1.8" }}>
        <li>You may use the Website only for lawful purposes.</li>
        <li>
          You must not misuse the Website, attempt unauthorized access, or
          interfere with its performance or security.
        </li>
      </ul>
      <Divider />
      <SectionTitle>3) Products and Services</SectionTitle>
      <ul style={{ marginLeft: "1.5rem", marginBottom: "1rem", lineHeight: "1.8" }}>
        <li>
          We provide travel eSIM plans and related digital services. Product
          details, pricing, and coverage are shown on the relevant pages at the
          time of purchase.
        </li>
        <li>
          We may update, change, or discontinue products or services at any
          time.
        </li>
      </ul>
      <Divider />
      <SectionTitle>4) Accounts (if available)</SectionTitle>
      <ul style={{ marginLeft: "1.5rem", marginBottom: "1rem", lineHeight: "1.8" }}>
        <li>
          Some features may require an account. You are responsible for keeping
          your login details confidential and for all activity under your
          account.
        </li>
        <li>You must provide accurate and up-to-date information.</li>
      </ul>
      <Divider />
      <SectionTitle>5) Payments</SectionTitle>
      <ul style={{ marginLeft: "1.5rem", marginBottom: "1rem", lineHeight: "1.8" }}>
        <li>
          Prices are shown on the Website and may be displayed in different
          currencies.
        </li>
        <li>
          By placing an order, you confirm you are authorized to use the payment
          method and you authorize us to charge the total amount.
        </li>
      </ul>
      <Divider />
      <SectionTitle>6) Cancellations and Refunds</SectionTitle>
      <ul style={{ marginLeft: "1.5rem", marginBottom: "1rem", lineHeight: "1.8" }}>
        <li>
          Orders can typically be cancelled before activation/installation,
          depending on the product.
        </li>
        <li>Refund requests must be submitted via our support channels.</li>
        <li>
          Refund outcomes depend on the circumstances and our Refund Policy
          published on the Website.
        </li>
      </ul>
      <Divider />
      <SectionTitle>7) Limitation of Liability</SectionTitle>
      <ul style={{ marginLeft: "1.5rem", marginBottom: "1rem", lineHeight: "1.8" }}>
        <li>
          We are not liable for indirect or consequential losses arising from
          your use of the Website or services.
        </li>
        <li>
          Our total liability for any claim related to a purchase will not
          exceed the amount you paid for that specific service.
        </li>
      </ul>
      <Divider />
      <SectionTitle>8) Intellectual Property</SectionTitle>
      <ul style={{ marginLeft: "1.5rem", marginBottom: "1rem", lineHeight: "1.8" }}>
        <li>
          All content on {SITE_URL.replace('https://', '')} (text, branding, graphics,
          logos, images, and software) is owned by KHITAR LIMITED or its
          licensors and is protected by applicable laws.
        </li>
        <li>
          You may not copy, reproduce, or exploit our content without written
          permission.
        </li>
      </ul>
      <Divider />
      <SectionTitle>9) Changes to These Terms</SectionTitle>
      <Paragraph>
        We may update these Terms at any time. Updates take effect once posted
        on the Website. You should review them periodically.
      </Paragraph>
      <Divider />
      <SectionTitle>10) Governing Law</SectionTitle>
      <Paragraph>
        These Terms are governed by the laws applicable to Hong Kong, and
        disputes will be handled by the competent courts in Hong Kong, unless
        mandatory consumer laws in your country provide otherwise.
      </Paragraph>
    </ContentPage>
  );
}
