import { useState } from 'react';
import { planValues } from '@/utils/planHeaders';

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
    <div style={{
      marginTop: '3rem',
      padding: '0 2rem'
    }}>
      {/* Title */}
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '1.5rem',
        textAlign: 'left'
      }}>
        Popular destinations
      </h2>
      
      {/* Cards container */}
      <div 
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'nowrap',
          justifyContent: 'flex-start'
        }}
      >
        {currentCards.map((p, index) => (
          <div key={startIndex + index}
            style={{
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              backgroundColor: '#fff',
              width: '180px',
              flexShrink: 0,
              textAlign: 'left',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer',
              position: 'relative'
            }}
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
            <div style={{
              width: '32px',
              height: '24px',
              backgroundColor: '#f3f4f6',
              borderRadius: '4px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#6b7280',
              border: '1px solid #e5e7eb'
            }}>
              🏳️
            </div>
            
            {/* Country/Plan name */}
            <h3 style={{ 
              margin: '0 0 0.5rem 0',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#1f2937',
              lineHeight: '1.3'
            }}>
              {p[planValues.name]}
            </h3>
            
            {/* Plan details */}
            <div style={{
              marginBottom: '1rem'
            }}>
              <p style={{ 
                margin: '0 0 0.25rem 0',
                fontSize: '0.9rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                {p[planValues.validity]} days | {p[planValues.dataCap]}
              </p>
            </div>
            
            {/* Price */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#1f2937'
              }}>
                ${p[planValues.price]}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation controls underneath - centered */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          {/* Left arrow */}
          <button 
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#fff',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currPopularPlansPage > 0 ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              color: currPopularPlansPage > 0 ? '#374151' : '#9ca3af',
              transition: 'background-color 0.2s ease',
              opacity: currPopularPlansPage > 0 ? 1 : 0.5
            }}
            onClick={goToPrevPopPlansPage}
            disabled={currPopularPlansPage === 0}
            onMouseEnter={(e) => {
              if (currPopularPlansPage > 0) e.target.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              if (currPopularPlansPage > 0) e.target.style.backgroundColor = '#fff';
            }}
          >
            ←
          </button>
          
          {/* Progress indicator bar */}
          <div style={{
            height: '3px',
            width: '120px',
            backgroundColor: '#e5e7eb',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${(100 / totalPages)}%`,
              backgroundColor: '#8b5cf6',
              borderRadius: '2px',
              transform: `translateX(${currPopularPlansPage * 100}%)`,
              transition: 'transform 0.3s ease'
            }}></div>
          </div>
          
          {/* Right arrow */}
          <button 
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#fff',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currPopularPlansPage < totalPages - 1 ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              color: currPopularPlansPage < totalPages - 1 ? '#374151' : '#9ca3af',
              transition: 'background-color 0.2s ease',
              opacity: currPopularPlansPage < totalPages - 1 ? 1 : 0.5
            }}
            onClick={goToNextPopPlansPage}
            disabled={currPopularPlansPage === totalPages - 1}
            onMouseEnter={(e) => {
              if (currPopularPlansPage < totalPages - 1) e.target.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              if (currPopularPlansPage < totalPages - 1) e.target.style.backgroundColor = '#fff';
            }}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}