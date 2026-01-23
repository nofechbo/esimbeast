import ContentPage, {
  SectionTitle,
  Paragraph,
  List,
  ListItem,
  Divider,
} from "@/components/ContentPage";
import { SITE_EMAIL, SITE_NAME, SITE_URL } from "@/config";

export default function RefundPolicyPage() {
  const pageSubtitle = `${SITE_NAME} eSIM Refund Policy`;
  return (
    <ContentPage
      title="Refund Policy"
      subtitle={pageSubtitle}
      description="View our eSIM refund policy. Learn about refund eligibility, how to request a refund, and when you qualify for a full or partial refund."
      path="/legal/refunds-policy"
    >
      <Paragraph>
        At {SITE_NAME}, if you couldn't use your eSIM for any reason, we'll do
        our best to make it right, including a full or partial refund, depending
        on the case.
      </Paragraph>
      <Divider />
      <SectionTitle>When You're Eligible</SectionTitle>

      <Paragraph>
        <strong>1) You changed your plans (unused eSIM)</strong>
      </Paragraph>
      <List>
        <ListItem>Full refund if the eSIM was bought on {SITE_URL.replace('https://', '')}</ListItem>
        <ListItem>The eSIM is not activated / not installed / not used</ListItem>
        <ListItem>Request is made within 180 days of purchase</ListItem>
      </List>

      <Paragraph>
        <strong>2) Device not compatible or carrier-locked</strong>
      </Paragraph>
      <Paragraph>Full refund if:</Paragraph>
      <List>
        <ListItem>The eSIM was not installed (QR not scanned)</ListItem>
        <ListItem>No data was used</ListItem>
        <ListItem>Request is within 180 days</ListItem>
        <ListItem>
          You provide proof (e.g., screenshots showing incompatibility/lock)
        </ListItem>
      </List>

      <Paragraph>
        <strong>3) eSIM connection not working</strong>
      </Paragraph>
      <List>
        <ListItem>
          If the eSIM doesn't work due to an issue on our side or the
          destination network, we may offer a full or partial refund.
        </ListItem>
        <ListItem>
          Please contact us during your trip / as soon as the issue happens so
          we can troubleshoot first.
        </ListItem>
      </List>

      <Divider />
      <SectionTitle>How to Request a Refund</SectionTitle>
      <Paragraph>
        Email us at{" "}
        <a
          href={`mailto:${SITE_EMAIL}`}
          style={{
            color: "#ec4899",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          {SITE_EMAIL}
        </a>{" "}
        with:
      </Paragraph>
      <List>
        <ListItem>Order number</ListItem>
        <ListItem>Short explanation of the issue</ListItem>
        <ListItem>Screenshots (if relevant)</ListItem>
      </List>

      <Paragraph>
        We handle requests as fast as possible and aim for a fair outcome every
        time.
      </Paragraph>
    </ContentPage>
  );
}
