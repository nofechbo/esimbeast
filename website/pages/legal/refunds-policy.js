import ContentPage, {
  SectionTitle,
  Paragraph,
  List,
  ListItem,
  Divider,
} from "@/components/ContentPage";

export default function RefundPolicyPage() {
  return (
    <ContentPage title="Refunds Policy" subtitle="Pingwe eSIM Refund Policy">
      <Paragraph>
        At Pingwe, customer satisfaction is our priority. While our eSIMs are
        designed to work flawlessly, we understand that issues can arise. We
        offer full or partial refunds under specific conditions. Please review
        the details below to understand our refund terms.
      </Paragraph>
      <Divider />
      <SectionTitle>Refund Eligibility</SectionTitle>
      <Paragraph>
        <strong>Trip Cancellations</strong>
      </Paragraph>
      <Paragraph>
        Refunds are available if you no longer require the eSIM, provided:
      </Paragraph>
      <List>
        <ListItem>The eSIM hasn’t been activated.</ListItem>
        <ListItem>The purchase was made within the last 90 days.</ListItem>
      </List>
      <Paragraph>
        For activated eSIMs, refunds will be evaluated on a case-by-case basis.
      </Paragraph>

      <Paragraph>
        <strong>Non-Refundable Situations</strong>
      </Paragraph>
      <Paragraph>
        Refunds will not be provided in the following cases:
      </Paragraph>
      <List>
        <ListItem>QR code already scanned or activated.</ListItem>
        <ListItem>Data package validity expired.</ListItem>
        <ListItem>
          Issues arising from misuse, fraud, or breach of terms.
        </ListItem>
        <ListItem>Unauthorized purchases pending investigation.</ListItem>
      </List>
      <Divider />
      <SectionTitle>How to Request a Refund</SectionTitle>
      <Paragraph>To initiate a refund:</Paragraph>
      <List>
        <ListItem>
          Email us at{" "}
          <a
            href="mailto:hello@pingwe.com"
            style={{
              color: "#ec4899",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            hello@pingwe.com
          </a>{" "}
          with your order details.
        </ListItem>
        <ListItem>
          Our team will verify your request and ensure proper eSIM
          configuration. If unresolved, the refund process will begin.
        </ListItem>
      </List>
      <Divider />
      <SectionTitle>Refund Process</SectionTitle>
      <List>
        <ListItem>
          Refunds will be issued to the original payment method or as store
          credit for future purchases.
        </ListItem>
        <ListItem>
          Processing times vary from 1 to 7 business days, depending on your
          bank and local holidays.
        </ListItem>
      </List>
      <Divider />
      <SectionTitle>For Assistance</SectionTitle>
      <Paragraph>
        Contact our support team at{" "}
        <a
          href="mailto:hello@pingwe.com"
          style={{ color: "#ec4899", textDecoration: "none", fontWeight: 600 }}
        >
          hello@pingwe.com
        </a>
        .
      </Paragraph>

      <Paragraph>
        We strive to provide hassle-free connectivity and ensure your
        satisfaction with Pingwe eSIM services!
      </Paragraph>
    </ContentPage>
  );
}
