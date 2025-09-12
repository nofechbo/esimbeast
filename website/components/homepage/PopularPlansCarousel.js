import { useState } from 'react';
import styles from '../../styles/Home.module.css'

export default function PopularPlansCarousel({ popularPlans }) {
  const [currPopularPlansPage, setcurrPopularPlansPage] = useState(0);
  const cardsPerPage = 6;
  const totalPages = Math.ceil(popularPlans.length / cardsPerPage);
  const startIndex = currPopularPlansPage * cardsPerPage;
  const currentCards = popularPlans.slice(startIndex, startIndex + cardsPerPage);

  const goToNextPopPlansPage = () => {
    if (currPopularPlansPage < totalPages - 1) {
      setcurrPopularPlansPage(currPopularPlansPage + 1);
    }
  };

  const goToPrevPopPlansPage = () => {
    if (currPopularPlansPage > 0) {
      setcurrPopularPlansPage(currPopularPlansPage - 1);
    }
  };

  if (popularPlans.length === 0) {
    return null;
  }

  return (
    <div className={styles.popularSection}>
      <h2 className={styles.popularTitle}>Popular destinations</h2>
      
      {/* Cards container */}
      <div className={styles.cardGrid}>
        {currentCards.map((p, index) => (
          <div key={startIndex + index}
            className={styles.popularCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
          >

            {/* Flag placeholder - will be replaced later */}
            <div className={styles.flagPlaceholder}>🏳️</div>
            
            {/* Country/Plan name */}
            <h3 className={styles.popularPlanName}>{p.name}</h3>
            
            {/* Plan details */}
            <div style={{marginBottom: '1rem'}}>
              <p className={styles.popularDetailsText}>
                {p.validity} days | {p.dataCap}
              </p>
            </div>
            
            {/* Price */}
            <div className={styles.popularPrice}>
              <span className={styles.popularPriceValue}>
                ${p.price}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation controls underneath - centered */}
      {totalPages > 1 && (
        <div className={styles.cardNav}>
          {/* Left arrow */}
          <button 
            className={styles.cardNavButton}
            onClick={goToPrevPopPlansPage}
            disabled={currPopularPlansPage === 0}
          >
            ←
          </button>
          
          {/* Progress indicator bar */}
          <div className={styles.progressBar}>
            <div
              className={styles.progressBarInner}
              style={{ transform: `translateX(${currPopularPlansPage * 100}%)`, width: `${100 / totalPages}%` }}
            />
          </div>
          
          {/* Right arrow */}
          <button 
            className={styles.cardNavButton}
            onClick={goToNextPopPlansPage}
            disabled={currPopularPlansPage === totalPages - 1}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}