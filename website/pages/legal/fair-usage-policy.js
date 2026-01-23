import ContentPage, {
  SectionTitle,
  Paragraph,
  Divider,
} from "@/components/ContentPage";
import { SITE_NAME, SITE_URL } from "@/config";

export default function FairUsagePolicyPage() {
  const pageSubtitle = `Fair Usage Policy for ${SITE_NAME}`;
  return (
    <ContentPage
      title="Fair Usage Policy"
      subtitle={pageSubtitle}
      description="Learn about our fair usage policy for unlimited data plans, including high-speed data allowances, prohibited activities, and enforcement."
      path="/legal/fair-usage-policy"
    >
      <SectionTitle>1) Why this policy exists</SectionTitle>
      <Paragraph>
        Our "unlimited" plans use shared mobile networks. To keep speeds and
        stability fair for everyone, {SITE_NAME} applies a Fair Usage Policy.
      </Paragraph>
      <Divider />
      <SectionTitle>2) Who it applies to</SectionTitle>
      <Paragraph>
        This FUP applies to {SITE_NAME} unlimited data plans. By using an
        unlimited plan, you agree to this policy in addition to our Terms of
        Service.
      </Paragraph>
      <Divider />
      <SectionTitle>3) How unlimited plans work (high-speed allowance)</SectionTitle>
      <Paragraph>
        Unlimited plans include a high-speed data allowance per 24-hour cycle.
        The exact allowance varies by destination and network conditions (often
        around 5GB–10GB high-speed per 24 hours, depending on the country).
      </Paragraph>
      <Paragraph>
        Once the high-speed allowance is used, speeds may be reduced (typically
        up to 512 kbps) until the next 24-hour cycle begins, when the high-speed
        allowance resets automatically.
      </Paragraph>
      <Divider />
      <SectionTitle>4) What's not allowed</SectionTitle>
      <Paragraph>
        Using unlimited plans in ways that aren't normal personal use may be
        restricted, including:
      </Paragraph>
      <ul style={{ marginLeft: "1.5rem", marginBottom: "1rem", lineHeight: "1.8" }}>
        <li>Heavy tethering / sharing the connection across multiple devices at scale</li>
        <li>Automated or unusually intensive usage (e.g., large-scale downloads, P2P/file sharing)</li>
        <li>Reselling or redistributing the service</li>
        <li>Any activity that violates laws or mobile network rules</li>
      </ul>
      <Divider />
      <SectionTitle>5) Monitoring and enforcement</SectionTitle>
      <Paragraph>
        We may review usage patterns to prevent abuse and protect the network
        experience. If we detect misuse, we may:
      </Paragraph>
      <ul style={{ marginLeft: "1.5rem", marginBottom: "1rem", lineHeight: "1.8" }}>
        <li>Reduce speeds further</li>
        <li>Suspend or terminate service in repeated or severe cases</li>
      </ul>
      <Divider />
      <SectionTitle>6) Pricing transparency</SectionTitle>
      <Paragraph>
        You won't be charged extra for exceeding the high-speed allowance under
        this FUP. Instead, speed is adjusted until the next reset.
      </Paragraph>
      <Divider />
      <SectionTitle>7) Regional differences & updates</SectionTitle>
      <Paragraph>
        Limits may differ by country due to local operator rules and
        infrastructure. We may update this policy from time to time; changes
        take effect once published on {SITE_URL.replace('https://', '')}.
      </Paragraph>
    </ContentPage>
  );
}
