
import ContentPage, { SectionTitle, Paragraph, List, ListItem } from "@/components/ContentPage";
import { SITE_NAME } from "@/config";

export default function AboutUsPage() {
  return (
    <ContentPage 
      title="About us"
      subtitle="Your Trusted Partner for Sustainable and Affordable Travel Connectivity"
    >
      <Paragraph>
        At {SITE_NAME}, we are passionate about keeping everyone connected affordably while making 
        a positive impact on the planet. Our services are designed to reduce plastic waste by 
        eliminating physical SIM cards and offering seamless global roaming. Tailored for 
        travelers and adventurers, {SITE_NAME} provides intuitive, reliable connectivity that places 
        your needs first.
      </Paragraph>

      <SectionTitle>Our Mission</SectionTitle>
      <Paragraph>
        We believe connectivity is more than just staying online—it's about empowering travelers 
        to explore the world, share unforgettable moments in real-time, and uncover hidden gems 
        without worrying about premium costs or fine print. By simplifying global data roaming, 
        we ensure you stay focused on what truly matters—your next adventure.
      </Paragraph>

      <SectionTitle>Our Vision</SectionTitle>
      <Paragraph>
        At {SITE_NAME}, we aim to make global connectivity:
      </Paragraph>
      <List>
        <ListItem>
          <strong>Affordable:</strong> By offering competitively priced data plans that fit 
          every traveler's needs.
        </ListItem>
        <ListItem>
          <strong>Eco-Friendly:</strong> Through eSIM technology, we reduce plastic usage and 
          contribute to a sustainable future.
        </ListItem>
        <ListItem>
          <strong>Client-Centric:</strong> Your satisfaction comes first. From honest pricing 
          to reliable coverage, we prioritize delivering a seamless and worry-free experience.
        </ListItem>
      </List>

      <Paragraph>
        With {SITE_NAME}, local has gone global—no fine print, no extra fees, just instant connectivity 
        to make every journey unforgettable. Your next adventure starts with us!
      </Paragraph>
    </ContentPage>
  );
}