import ContentPage, {
  SectionTitle,
  Paragraph,
  List,
  ListItem,
  Divider,
} from "@/components/ContentPage";
import { SITE_EMAIL, SITE_NAME, SITE_URL } from "@/config";

export default function PrivacyPolicyPage() {
  const pageSubtitle = `Privacy Policy for ${SITE_NAME}`;
  return (
    <ContentPage
      title="Privacy Policy"
      subtitle={pageSubtitle}
      description="Learn how we collect, use, and protect your personal data. Our privacy policy covers data handling, your rights, and cookie usage."
      path="/legal/privacy-policy"
    >
      <Paragraph>
        This Privacy Policy explains how personal data is collected and
        processed when you use {SITE_URL.replace('https://', '')} (the "Website").
      </Paragraph>

      <Divider />
      <SectionTitle>1) Who is responsible for your data?</SectionTitle>
      <Paragraph>
        <strong>Controller:</strong> KHITAR LIMITED
      </Paragraph>
      <Paragraph>
        <strong>Address:</strong> 33 Wyndham Street, 22F, Hong Kong Island, Hong
        Kong
      </Paragraph>
      <Paragraph>
        <strong>Contact email:</strong>{" "}
        <a
          href={`mailto:${SITE_EMAIL}`}
          style={{ color: "#ec4899", textDecoration: "none", fontWeight: 600 }}
        >
          {SITE_EMAIL}
        </a>
      </Paragraph>

      <Divider />
      <SectionTitle>2) What data we collect</SectionTitle>
      <Paragraph>
        Depending on how you use the Website, we may collect:
      </Paragraph>
      <List>
        <ListItem>
          Identification and contact details (e.g., name, email, phone, billing
          address)
        </ListItem>
        <ListItem>Order and transaction details</ListItem>
        <ListItem>
          Technical and usage data (e.g., device info, IP address, browser,
          pages visited)
        </ListItem>
        <ListItem>
          Support requests and communications (including via automated tools if
          used)
        </ListItem>
      </List>

      <Divider />
      <SectionTitle>3) Why we process your data (purposes)</SectionTitle>
      <Paragraph>We process your data to:</Paragraph>
      <List>
        <ListItem>
          Deliver your eSIM order and provide customer support
        </ListItem>
        <ListItem>
          Manage purchases, payments, and order-related communications
        </ListItem>
        <ListItem>Respond to your questions or requests</ListItem>
        <ListItem>
          Improve website performance, user experience, and security
        </ListItem>
        <ListItem>
          Send marketing communications (only where allowed and/or with consent)
        </ListItem>
        <ListItem>
          Provide features such as account access or service tools (if
          available)
        </ListItem>
      </List>

      <Divider />
      <SectionTitle>4) Legal basis for processing</SectionTitle>
      <Paragraph>
        We rely on one or more of the following legal bases:
      </Paragraph>
      <List>
        <ListItem>
          Contract necessity (to complete your purchase and deliver the service)
        </ListItem>
        <ListItem>Consent (e.g., marketing, certain cookies)</ListItem>
        <ListItem>
          Legitimate interests (e.g., fraud prevention, website security,
          improving services)
        </ListItem>
        <ListItem>
          Legal obligations (e.g., accounting and compliance requirements)
        </ListItem>
      </List>

      <Divider />
      <SectionTitle>5) Who we share data with</SectionTitle>
      <Paragraph>
        We do not sell your personal data. We may share data only when necessary
        with:
      </Paragraph>
      <List>
        <ListItem>Payment providers and checkout services</ListItem>
        <ListItem>Technology and hosting providers</ListItem>
        <ListItem>Analytics and advertising providers</ListItem>
        <ListItem>Customer support tools</ListItem>
        <ListItem>Authorities or regulators if legally required</ListItem>
      </List>
      <Paragraph>
        All service providers are required to protect your data and use it only
        for the services they provide to us.
      </Paragraph>

      <Divider />
      <SectionTitle>6) International data transfers</SectionTitle>
      <Paragraph>
        Because we operate globally, your data may be processed in countries
        outside your country of residence. Where required, we use appropriate
        safeguards for international transfers.
      </Paragraph>

      <Divider />
      <SectionTitle>7) Data retention</SectionTitle>
      <Paragraph>
        We keep your data only as long as needed for the purposes above:
      </Paragraph>
      <List>
        <ListItem>
          Customers / orders: typically kept for the period required by
          applicable accounting and legal obligations (often at least 5 years)
        </ListItem>
        <ListItem>
          Non-customers: kept only as long as needed to respond to requests or
          provide services
        </ListItem>
      </List>

      <Divider />
      <SectionTitle>8) Your rights</SectionTitle>
      <Paragraph>
        Depending on your location and applicable law, you may have the right
        to:
      </Paragraph>
      <List>
        <ListItem>Access your data</ListItem>
        <ListItem>Correct inaccurate data</ListItem>
        <ListItem>Request deletion</ListItem>
        <ListItem>Restrict or object to processing</ListItem>
        <ListItem>Request data portability</ListItem>
        <ListItem>
          Withdraw consent (where processing is based on consent)
        </ListItem>
      </List>
      <Paragraph>
        To exercise any rights, contact us at{" "}
        <a
          href={`mailto:${SITE_EMAIL}`}
          style={{ color: "#ec4899", textDecoration: "none", fontWeight: 600 }}
        >
          {SITE_EMAIL}
        </a>
        .
      </Paragraph>

      <Divider />
      <SectionTitle>9) Minors</SectionTitle>
      <Paragraph>
        Our services are not intended for children under the age where parental
        consent is required under applicable law. If we learn we have collected
        data from a minor without valid consent, we will delete it.
      </Paragraph>

      <Divider />
      <SectionTitle>10) Security</SectionTitle>
      <Paragraph>
        We apply reasonable technical and organizational measures to protect
        personal data against unauthorized access, loss, misuse, or alteration.
      </Paragraph>

      <Divider />
      <SectionTitle>11) Changes to this policy</SectionTitle>
      <Paragraph>
        We may update this Privacy Policy from time to time. The latest version
        will always be available on {SITE_URL.replace('https://', '')}.
      </Paragraph>

      <Divider />
      <SectionTitle>Cookie Policy</SectionTitle>
      <Paragraph>
        We use cookies and similar technologies to make the Website work
        properly and improve performance.
      </Paragraph>

      <Paragraph>
        <strong>Types of cookies we may use</strong>
      </Paragraph>
      <List>
        <ListItem>
          Strictly necessary cookies: required for core site functions
        </ListItem>
        <ListItem>
          Preference cookies: remember choices like language and settings
        </ListItem>
        <ListItem>
          Analytics cookies: help us understand site traffic and improve
          performance
        </ListItem>
        <ListItem>
          Advertising cookies: help measure and personalize ads
        </ListItem>
      </List>

      <Paragraph>
        <strong>Managing cookies</strong>
      </Paragraph>
      <Paragraph>You can control cookies through:</Paragraph>
      <List>
        <ListItem>Your browser settings (block or delete cookies)</ListItem>
        <ListItem>Our cookie banner/preferences tool (where available)</ListItem>
      </List>

      <Paragraph>
        <strong>Third-party services (including Google)</strong>
      </Paragraph>
      <Paragraph>
        We may use third-party analytics and advertising services (including
        Google). These partners may collect data through cookies or similar
        technologies (e.g., IP address, device identifiers, browsing activity)
        to provide analytics, measurement, ad delivery, and fraud prevention.
        You can manage Google's partner-site data use via Google's official
        information pages.
      </Paragraph>
    </ContentPage>
  );
}
