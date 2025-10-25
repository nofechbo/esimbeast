import ContentPage, {
  SectionTitle,
  Paragraph,
  List,
  ListItem,
  Divider,
} from "@/components/ContentPage";

export default function TermsAndConditionsPage() {
  return (
    <ContentPage
      title="Terms and Conditions"
      subtitle="Terms of Use for Pingwe.com"
    >
      <SectionTitle>Application of Terms of Use</SectionTitle>
      <Paragraph>
        These Terms govern the use of services provided by Pingwe.com (“Pingwe”)
        to users through its website and/or app (collectively, the “Platform”).
        By accessing or using the Platform, you agree to be bound by these
        Terms. If you do not accept these Terms, you may not use our services.
      </Paragraph>
      <Divider />
      <SectionTitle>Changes to Terms and Conditions</SectionTitle>
      <Paragraph>
        Pingwe reserves the right to amend these Terms. Users will be notified
        of changes through the Platform or other communication methods.
        Continued use after notification constitutes acceptance of the updated
        Terms.
      </Paragraph>
      <Divider />
      <SectionTitle>Definitions</SectionTitle>
      <List>
        <ListItem>
          <strong>“Services”:</strong> Includes mobile internet and related eSIM
          services provided by Pingwe.
        </ListItem>
        <ListItem>
          <strong>“User”:</strong> Any individual with an account using Pingwe’s
          services.
        </ListItem>
        <ListItem>
          <strong>“eSIM”:</strong> A digital SIM profile compliant with GSMA
          standards.
        </ListItem>
        <ListItem>
          <strong>“QR Code”:</strong> A unique code required to download and
          activate an eSIM profile.
        </ListItem>
        <ListItem>
          <strong>“Network Operator”:</strong> Telecommunications providers
          supporting Pingwe’s eSIM services.
        </ListItem>
        <ListItem>
          <strong>“Top-Up”:</strong> Additional data purchased to extend the
          usage of a plan.
        </ListItem>
      </List>
      <Divider />
      <SectionTitle>Services</SectionTitle>
      <Paragraph>
        <strong>Service Description:</strong> Pingwe’s eSIM provides data-only
        services, compliant with GSMA standards. Voice calls and SMS are not
        supported.
      </Paragraph>

      <Paragraph>
        <strong>No Warranty:</strong> Pingwe offers its services on an “as-is”
        basis without guarantees of uninterrupted or error-free service. Network
        quality depends on local operators, and Pingwe cannot be held liable for
        issues beyond its control, including signal interference, network
        coverage limitations, or unforeseen outages.
      </Paragraph>

      <Paragraph>
        <strong>User Restrictions:</strong> Pingwe may limit transmission rates
        or suspend services during emergencies or for public safety purposes.
        Additionally, Pingwe may suspend or terminate services if users violate
        these Terms or engage in prohibited activities.
      </Paragraph>
      <Divider />
      <SectionTitle>Payment and Refund Policy</SectionTitle>
      <Paragraph>
        <strong>Payment:</strong> All services are prepaid and non-refundable,
        except as specified in Pingwe’s Refund Policy. Payments are securely
        processed via Stripe.
      </Paragraph>

      <Paragraph>
        <strong>Refunds:</strong> Please read our Refund Policy.
      </Paragraph>
      <Divider />
      <SectionTitle>User Obligations</SectionTitle>
      <List>
        <ListItem>
          Users are responsible for ensuring their device compatibility and
          maintaining network-unlocked status.
        </ListItem>
        <ListItem>
          Users must use services lawfully and bear responsibility for their
          device setup, configuration, and usage.
        </ListItem>
        <ListItem>
          Users must comply with applicable regulations in the region where
          services are used.
        </ListItem>
      </List>
      <Divider />
      <SectionTitle>Account and Confidentiality</SectionTitle>
      <List>
        <ListItem>
          Users must create a verified account and are responsible for
          safeguarding their login credentials.
        </ListItem>
        <ListItem>
          Users may request account deletion by contacting{" "}
          <a href="mailto:hello@pingwe.com">hello@pingwe.com</a>.
        </ListItem>
      </List>
      <Divider />
      <SectionTitle>QR Code and eSIM Profile</SectionTitle>
      <List>
        <ListItem>
          QR codes are for one-time use only and valid for 180 days from
          issuance.
        </ListItem>
        <ListItem>
          eSIM profiles are non-transferable and valid for up to 180 days,
          depending on the plan.
        </ListItem>
      </List>
      <Divider />
      <SectionTitle>Limitations of Liability</SectionTitle>
      <Paragraph>Pingwe is not liable for:</Paragraph>
      <List>
        <ListItem>
          Losses arising from third-party network or cloud service providers.
        </ListItem>
        <ListItem>
          Inaccuracies in data usage reporting caused by network operators.
        </ListItem>
        <ListItem>
          Incidents related to unauthorized device usage or misconfiguration.
        </ListItem>
      </List>
      <Divider />
      <SectionTitle>Miscellaneous</SectionTitle>
      <List>
        <ListItem>
          <strong>Jurisdiction:</strong> These Terms are governed by the laws of
          the Netherlands, and disputes will be resolved exclusively in
          Amsterdam courts.
        </ListItem>
        <ListItem>
          <strong>Privacy Policy:</strong> Pingwe collects and processes user
          data per its Privacy Policy, available on the Platform.
        </ListItem>
        <ListItem>
          <strong>Marketing:</strong> Pingwe may send product updates and
          promotional communications. Users can opt out by contacting{" "}
          <a href="mailto:hello@pingwe.com">hello@pingwe.com</a>.
        </ListItem>
      </List>

      <Paragraph>
        For further assistance, Contact us at{" "}
        <a
          href="mailto:hello@pingwe.com"
          style={{ color: "#ec4899", textDecoration: "none", fontWeight: 600 }}
        >
          hello@pingwe.com
        </a>
      </Paragraph>
    </ContentPage>
  );
}
