// @ts-nocheck
import {
  CardGrid,
  DetailsContainer,
  DetailsText,
  Divider,
  FlagWrapper,
  PlanName,
  PopularCard,
  PopularSection,
  PopularTitle,
  PriceValue,
} from "@/styles/popularPlansStyles";
import slugify from "@/utils/formaters";
import FlagIcons from "../common/FlagIcons";
import { useEffect, useState } from "react";

export default function PopularPlansCarousel({
  popularPlans,
  formatData,
  formatDuration,
  onNavigate,
}) {
  if (popularPlans.length === 0) {
    return null;
  }
  //for pagination
  // const [currPopularPlansPage, setcurrPopularPlansPage] = useState(0);
  // const cardsPerPage = MAX_CARDS_ON_PAGE;
  // const totalPages = Math.ceil(popularPlans.length / cardsPerPage);
  // const startIndex = currPopularPlansPage * cardsPerPage;
  // const currentCards = popularPlans.slice(startIndex, startIndex + cardsPerPage);

  // const goToNextPopPlansPage = () => {
  //   if (currPopularPlansPage < totalPages - 1) {
  //     setcurrPopularPlansPage(currPopularPlansPage + 1);
  //   }
  // };

  // const goToPrevPopPlansPage = () => {
  //   if (currPopularPlansPage > 0) {
  //     setcurrPopularPlansPage(currPopularPlansPage - 1);
  //   }
  // };

  // check if mobile. show 4 plans for mobile, 5 for site
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  const MAX_CARDS_ON_PAGE = isMobile ? 4 : 5;
  const displayPlans = popularPlans.slice(0, MAX_CARDS_ON_PAGE);

  const handleClick = (plan) => () => {
    const slug = slugify(plan.uniqueName);
    const planUrl = `plans/${slug}`;
    onNavigate(planUrl);
  };

  return (
    <PopularSection>
      <PopularTitle>Popular destinations</PopularTitle>

      <CardGrid>
        {displayPlans.map((p, index) => (
          <PopularCard key={index} onClick={handleClick(p)}>
            <PlanName>{p.name}</PlanName>
            <FlagIcons
              countryCodes={p.countryCodes?.slice(0, 1)}
              Wrapper="div" // plain div, not styled — position comes from FlagWrapper itself
              Flag={FlagWrapper}
            />

            <DetailsContainer>
              <DetailsText> {formatDuration(p.days)} </DetailsText>
              <Divider>|</Divider>
              <DetailsText> {formatData(p.data)} </DetailsText>
            </DetailsContainer>

            <PriceValue>${(p.price / 100).toFixed(2)}</PriceValue>
          </PopularCard>
        ))}
      </CardGrid>
    </PopularSection>
  );
}
