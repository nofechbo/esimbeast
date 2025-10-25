import ContentPage, { 
  SectionTitle, 
  Paragraph 
} from "@/components/ContentPage";

export default function AffiliateProgramPage() {
  return (
    <ContentPage 
      title="Pingwe Affiliate Program"
      subtitle="eSIM Affiliate Program"
    >
      <Paragraph>
        Are you a travel influencer, agency, OTA, or someone enthusiastic about simplifying 
        global connectivity for your audience? Pingwe, a leader in eSIM data plans, invites 
        you to join its high commission affiliate program.
      </Paragraph>

      <Paragraph>
        This program is designed to help you earn generous commissions while promoting a 
        hassle-free travel connectivity solution to your audience.
      </Paragraph>

      <Paragraph>
        Seize the opportunity to monetize your platform while offering a service that makes 
        international travel smoother and more connected!
      </Paragraph>

      <Paragraph style={{ marginTop: '40px', textAlign: 'center' }}>
        Contact us at <a href="mailto:hello@pingwe.com" style={{ color: '#ec4899', textDecoration: 'none', fontWeight: 600 }}>hello@pingwe.com</a>
      </Paragraph>
    </ContentPage>
  );
}