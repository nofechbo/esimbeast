import ContentPage, {
  SectionTitle,
  Paragraph,
  Divider,
} from "@/components/ContentPage";
import { SITE_EMAIL, SITE_NAME } from "@/config";

export default function PrivacyPolicyPage() {
  const pageSubtitle = `Terms and Conditions for ${SITE_NAME}`;
  return (
    <ContentPage
      title="Privacy Policy"
      subtitle={pageSubtitle}
    >
      <SectionTitle>Introduction</SectionTitle>
      <Paragraph>
        These terms and conditions (“Terms”), which may be updated periodically
        by {SITE_NAME}.com (“{SITE_NAME}”), apply to {SITE_NAME}’s website and/or application
        (collectively, the “Application”) and all services provided in
        connection with the sale and use of prepaid eSIMs (“eSIMs”).
      </Paragraph>
      <Paragraph>
        By accessing, browsing, or using the Application and/or making a
        purchase, you confirm that you have read, understood, and agreed to
        these Terms and our privacy statement. Additionally, you confirm you
        possess the legal capacity to enter into this agreement.
      </Paragraph>
      <Divider />
      <SectionTitle>Services</SectionTitle>
      <Paragraph>
        <strong>Data Plans:</strong> {SITE_NAME} offers eSIM-based international
        connectivity through prepaid plans as detailed in the Plan Description
        (“Plan” and “Services” respectively).
      </Paragraph>

      <Paragraph>
        <strong>Duration of Services:</strong> Services start upon the
        successful activation of the eSIM on your device and end when your Plan
        terminates, expires, or you delete the eSIM. If your data allowance is
        exhausted, you may purchase a top-up for an additional fee as described
        in the Plan.
      </Paragraph>

      <Paragraph>
        <strong>Suspension of Services:</strong> If you breach these Terms or
        jeopardize the security of the Application or Services, {SITE_NAME} reserves
        the right to suspend your access to the Services, with all charges
        during suspension remaining your responsibility.
      </Paragraph>

      <SectionTitle>User Obligations</SectionTitle>
      <Paragraph>
        Users must refrain from engaging in illegal, fraudulent, or abusive
        activities when using the Application or Services.
      </Paragraph>
      <Divider />
      <SectionTitle>Registration</SectionTitle>
      <Paragraph>
        <strong>Registration Requirements:</strong> To use Services, you must
        register on the Application, accept these Terms, and pay for your
        selected Plan.
      </Paragraph>

      <Paragraph>
        <strong>Device Compatibility:</strong> Ensure your device supports eSIM
        and is network-unlocked before purchase. By confirming compatibility
        during checkout, you agree that no refunds will be issued if your device
        or destination is unsupported. Compatibility lists are available at
        checkout but are not exhaustive.
      </Paragraph>
      <Divider />
      <SectionTitle>Fees and Payments</SectionTitle>
      <Paragraph>
        <strong>Fees:</strong> All Services are prepaid, and charges include VAT
        unless otherwise stated. Payments are nonrefundable except as detailed
        in our Refund Policy. You cannot offset payments unless amounts are
        undisputed or confirmed by a final court ruling.
      </Paragraph>

      <Paragraph>
        <strong>Payment Processing:</strong> Payments are processed securely
        through Stripe, with all financial details submitted directly to them.
        {SITE_NAME} does not process or store payment data. For details, refer to
        Stripe’s terms and privacy policy.
      </Paragraph>
      <Divider />
      <SectionTitle>Support</SectionTitle>
      <Paragraph>
        Technical support is available via email at{" "}
        <a
          href={`mailto:SITE_EMAIL`}
          style={{ color: "#ec4899", textDecoration: "none", fontWeight: 600 }}
        >
          {SITE_EMAIL}
        </a>
        .
      </Paragraph>
      <Divider />
      <SectionTitle>Refunds</SectionTitle>
      <Paragraph>
        Refunds are available only as outlined in {SITE_NAME}’s Refund Policy,
        incorporated by reference into these Terms.
      </Paragraph>
      <Paragraph>
        You can find more information on our{" "}
        <a
          href="/legal/refunds-policy"
          style={{ color: "#ec4899", textDecoration: "none", fontWeight: 600 }}
        >
          refund policy page
        </a>
        .
      </Paragraph>
      <Divider />
      <SectionTitle>Disclaimers and Limitations of Liability</SectionTitle>
      <Paragraph>
        <strong>Disclaimer:</strong> {SITE_NAME} does not guarantee uninterrupted,
        timely, or error-free Services. The Application is provided “as is”
        without warranties, including implied warranties of merchantability or
        fitness for a particular purpose.
      </Paragraph>

      <Paragraph>
        <strong>Limitation of Liability:</strong> {SITE_NAME} is not liable for
        special, incidental, or consequential damages related to the use or
        inability to use the Services or Application. Liability is limited to
        the amount paid for the specific Services in question.
      </Paragraph>
      <Divider />
      <SectionTitle>Modifications</SectionTitle>
      <Paragraph>
        Plans are provided as-is, and no modifications or customizations will be
        made post-purchase. Operators and service areas may change during the
        Plan duration.
      </Paragraph>
      <Divider />
      <SectionTitle>Entire Agreement</SectionTitle>
      <Paragraph>
        These Terms and related policies constitute the entire agreement between
        you and {SITE_NAME}, superseding prior agreements or understandings.
      </Paragraph>
      <Divider />
      <SectionTitle>Jurisdiction and Governing Law</SectionTitle>
      <Paragraph>
        These Terms are governed by the laws of the Netherlands, excluding
        conflicts of law principles. All claims arising from these Terms will be
        brought exclusively in courts located in Amsterdam.
      </Paragraph>
    </ContentPage>
  );
}
