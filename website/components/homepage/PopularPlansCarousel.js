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

const MAX_CARDS_ON_PAGE = 5;

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

  // Show only first 5 plans
  const displayPlans = popularPlans.slice(0, 5);

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

            <PriceValue>${p.price}</PriceValue>
          </PopularCard>
        ))}
      </CardGrid>
    </PopularSection>
  );
}
