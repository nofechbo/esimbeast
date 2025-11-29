import ContentPage, { 
  SectionTitle, 
  Paragraph, 
  List, 
  ListItem, 
  BenefitsGrid, 
  BenefitCard, 
  BenefitTitle, 
  BenefitText 
} from "@/components/ContentPage";

const SITE_NAME = process.env.SITE_NAME || 'eSim Store';

export default function WhatIsESIMPage() {
    return (
    // @ts-ignore
    <ContentPage 
      title="What is an eSIM, and How Does it Work?"
    >
      <SectionTitle>What is an eSIM?</SectionTitle>
      <Paragraph>
        An eSIM (embedded SIM) is a digital SIM card built directly into your device, 
        eliminating the need for a physical card. At {SITE_NAME}, our eSIMs are designed 
        to provide seamless global connectivity, allowing you to stay connected anywhere 
        in the world without the hassle of swapping SIM cards.
      </Paragraph>

      <SectionTitle>How Does an eSIM Work?</SectionTitle>
      <List>
        <ListItem>
          <strong>Pre-Installed Technology:</strong> The eSIM is embedded in the device's 
          hardware, making it ready for remote activation.
        </ListItem>
        <ListItem>
          <strong>Instant Activation:</strong> Activate your {SITE_NAME} eSIM by scanning a QR code. 
          Within minutes, your device connects to {SITE_NAME}'s local partner network.
        </ListItem>
        <ListItem>
          <strong>Flexible Profiles:</strong> Store multiple eSIM profiles on your device, 
          allowing you to switch between carriers or countries without removing a physical SIM card.
        </ListItem>
        <ListItem>
          <strong>Remote Updates:</strong> Manage your eSIM digitally, adding or modifying 
          plans directly through {SITE_NAME} for ultimate convenience.
        </ListItem>
      </List>

      <SectionTitle>Why Choose {SITE_NAME} eSIM?</SectionTitle>
      <BenefitsGrid>
        <BenefitCard>
          <BenefitTitle>Eco-Friendly</BenefitTitle>
          <BenefitText>
            Reduce plastic waste and contribute to a greener planet by switching to eSIM.
          </BenefitText>
        </BenefitCard>
        <BenefitCard>
          <BenefitTitle>Hassle-Free Travel</BenefitTitle>
          <BenefitText>
            Enjoy global data plans that eliminate the need for roaming charges or physical SIM swapping.
          </BenefitText>
        </BenefitCard>
        <BenefitCard>
          <BenefitTitle>Affordability</BenefitTitle>
          <BenefitText>
            At {SITE_NAME}, we prioritize keeping you connected at budget-friendly prices.
          </BenefitText>
        </BenefitCard>
        <BenefitCard>
          <BenefitTitle>Unmatched Convenience</BenefitTitle>
          <BenefitText>
            Easily activate and manage your data plan online without visiting a store.
          </BenefitText>
        </BenefitCard>
      </BenefitsGrid>

      {/* MISSING SECTION 1 - Key Benefits */}
      <SectionTitle>Key Benefits of {SITE_NAME} eSIM</SectionTitle>
      <List>
        <ListItem>
          <strong>Stay Connected Anywhere:</strong> Our eSIM provides top-tier network 
          coverage across multiple countries, ensuring you never lose connection.
        </ListItem>
        <ListItem>
          <strong>Multiple Profiles for Flexibility:</strong> Perfect for travelers, 
          digital nomads, and business professionals needing quick carrier switches.
        </ListItem>
        <ListItem>
          <strong>Instant Activation:</strong> Activate in minutes with a QR code or 
          through {SITE_NAME}'s app or website.
        </ListItem>
      </List>

      {/* MISSING SECTION 2 - Who Can Benefit */}
      <SectionTitle>Who Can Benefit from {SITE_NAME} eSIMs?</SectionTitle>
      <BenefitsGrid>
        <BenefitCard>
          <BenefitTitle>Travelers</BenefitTitle>
          <BenefitText>
            Access affordable and reliable data worldwide without incurring roaming charges.
          </BenefitText>
        </BenefitCard>
        <BenefitCard>
          <BenefitTitle>Businesses</BenefitTitle>
          <BenefitText>
            Simplify connectivity management for teams on the move.
          </BenefitText>
        </BenefitCard>
        <BenefitCard>
          <BenefitTitle>Eco-Conscious Users</BenefitTitle>
          <BenefitText>
            Reduce your carbon footprint by avoiding disposable physical SIM cards.
          </BenefitText>
        </BenefitCard>
      </BenefitsGrid>

      <Paragraph style={{ textAlign: "center", fontSize: "18px", fontWeight: 500, color: "#112B3C" }}>
        For seamless global connectivity and an eco-friendly solution, explore {SITE_NAME} today. 
        Start your journey with the future of mobile technology: eSIM!
            </Paragraph>
        </ContentPage>
        
  );
}