import ContentPage, { 
  Paragraph 
} from "@/components/ContentPage";
import { SITE_EMAIL, SITE_NAME } from "@/config";

export default function AffiliateProgramPage() {
  const pageTitle = `${SITE_NAME} Affiliate Program`;
  return (
    <ContentPage 
      title={pageTitle}
      subtitle=""
    >
      <Paragraph>
        Are you a travel influencer, agency, OTA, or someone enthusiastic about simplifying 
        global connectivity for your audience? {SITE_NAME}, a leader in eSIM data plans, invites 
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
        Contact us at <a href={`mailto:${SITE_EMAIL}`} style={{ color: '#ec4899', textDecoration: 'none', fontWeight: 600 }}>{SITE_EMAIL}</a>
      </Paragraph>
    </ContentPage>
  );
}