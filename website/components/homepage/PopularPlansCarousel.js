import styled from "@emotion/styled";

const PopularSection = styled('div')({
  padding: '40px 0',
});

const PopularTitle = styled('h2')({
  fontFamily: 'Kanit',
  fontSize: '16px',
  fontWeight: 600,
  fontStyle: 'normal',
  lineHeight: 'normal',
  color: '#0A1A24',
  marginBottom: '10px',
});

const CardGrid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 212px)',
  gap: '16px',
  marginBottom: '24px',
});

const PopularCard = styled('div')({
  width: '212px',
  height: '124px',
  flexShrink: 0,
  borderRadius: '22px',
  border: '1px solid #FFE4F0',
  background: '#FAEEFA',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
  },
});

const PlanName = styled('h3')({
  fontFamily: 'Kanit',
  fontSize: '20px',
  fontStyle: 'normal',
  fontWeight: 600,
  lineHeight: '20px',
  background: 'linear-gradient(90deg, #8D2DF2 0%, #FF82BA 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  margin: 0,
});

const DetailsContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const DetailsText = styled('span')({
  color: '#3E484E',
  fontFamily: 'Kanit',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '16px',
  margin: 0,
});

const Divider = styled('span')({
  color: '#A2A8AD',
  fontFamily: 'Kanit',
  fontSize: 16,
  fontStyle: 'normal',
  fontWeight: 400,
  lineheight: 16,
})
const PriceValue = styled('span')({
  color: '#3E484E',
  fontFamily: 'Kanit',
  fontSize: '14px',
  fontStyle: 'normal',
  fontWeight: 600,
  lineHeight: '14px',
});

const MAX_CARDS_ON_PAGE = 5

export default function PopularPlansCarousel({ popularPlans, formatData, formatDuration }) {
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

  return (
    <PopularSection>
      <PopularTitle>Popular destinations</PopularTitle>
      
      <CardGrid>
        {displayPlans.map((p, index) => (
          <PopularCard key={index}>
            <PlanName>{p.name}</PlanName>
            
            <DetailsContainer>
              <DetailsText> {formatDuration(p.days)} </DetailsText>
              <Divider>|</Divider>
              <DetailsText> {formatData(p.data)} </DetailsText>
            </DetailsContainer>
            
            <PriceValue>
              ${p.price}
            </PriceValue>
          </PopularCard>
        ))}
      </CardGrid>
    </PopularSection>
  );
}