import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar.js';
import Footer from '../components/Footer.js';
import { planValues } from '../utils/planHeaders.js';

export default function Home() {
  const [query, setQuery] = useState("");
  const [planList, setPlanList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [popularPlans, setPopularPlans] = useState([]);
  const router = useRouter();
  const selectedRef = useRef(null);

  //popular plans scroll bar
  const [currPopularPlansPage, setcurrPopularPlansPage] = useState(0);
  const cardsPerPage = 6;
  const totalPages = Math.ceil(popularPlans.length / cardsPerPage);
  const startIndex = currPopularPlansPage * cardsPerPage;
  const currentCards = popularPlans.slice(startIndex, startIndex + cardsPerPage);

  //load all plans
  useEffect(() => {
    async function loadPlans() {
      const response = await fetch('/api/plans');
      const plans = await response.json();
      setPlanList(plans);
    }

    loadPlans();
  }, []);

  //set popular plans list
  useEffect(() => {
    if (planList.length === 0) return;
    const popular = planList.filter(p => p[planValues.isPopular]=== true);
    setPopularPlans(popular);
  }, [planList]);

  useEffect(() => {
    if (planList.length === 0) return;
    
    console.log('Total plans:', planList.length);
    console.log('planValues.isPopular:', planValues.isPopular);
    console.log('Plans with is popular field:', planList.map(p => ({ name: p.Name, isPopular: p[planValues.isPopular] })));
    
    const popular = planList.filter(p => p[planValues.isPopular] === true);
    console.log('Filtered popular plans:', popular);
    
    setPopularPlans(popular);
  }, [planList]);

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

  //edit suggestions list
  const suggestions = query.trim() ? planList.filter(p => {
    const searchWords = query.trim().toLowerCase().split(/\s+/);
    const planName = p.planName.toLowerCase();
    return searchWords.every(word => planName.includes(word));
  }) : [];

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions.length, query]);

  //move scroller in list
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex]);

  const handleSearch = (e) => {
    e.preventDefault();

    // If there's a selected suggestion, navigate to it
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      router.push(`/plans/${encodeURIComponent(suggestions[selectedIndex].slug)}`);
      return;
    }

    // Otherwise, try exact match
    const match = planList.find(p => 
      p.planName.toLowerCase() === query.trim().toLowerCase()
    );
    if (!match) return; //prevent invalid nav

    router.push(`/plans/${encodeURIComponent(match.slug)}`);
  }

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          Math.min(prev + 1, suggestions.length - 1)
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          Math.max(prev - 1, 0)
        );
        break;
      
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          router.push(`/plans/${encodeURIComponent(suggestions[selectedIndex].slug)}`);
        }
        break;
      
      case 'Escape':
        setSelectedIndex(-1);
        setQuery('');selectedIndex
        break;
    }
  };

  return (
    <div className="relative w-full" style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <NavBar />     
      
      {/* Content container that holds both bg and search */}
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        {/* bg image + layout */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hp_bg.svg"
            alt="Background illustration"
            className="min-w-full min-h-full object-cover pointer-events-none select-none"
          />
        </div>

        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '30px', // spacing between title and search
            width: '100%',
            maxWidth: '900px',
            padding: '0 1rem'
          }}
        >
          <h1
            style={{
              fontSize: '51px',
              lineHeight: '64px',
              fontFamily: 'var(--font-kanit)',
              fontWeight: 700,
              textAlign: 'center',
              background: 'linear-gradient(90deg, #8D2DF2 0%, #FF82BA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Best eSIM Match Based on<br />Your Travel Needs
          </h1>

          <div style={{ position: 'relative' }}>
            <form 
              onSubmit={handleSearch} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '1rem' 
              }}
            >
              <div style={{ 
                position: 'relative',
                width: '500px'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/pin.svg"
                    alt="pin"
                    style={{ width: '20px', height: '20px' }}
                  />
                </div>
                
                <input
                  id="planName"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter a plan name (e.g. usa 5gb 7 days)"
                  style={{
                    padding: '15px 60px 15px 45px',
                    fontSize: '12px',
                    width: '100%',
                    border: '2px solid #e2dfe7',
                    borderRadius: '25px',
                    boxSizing: 'border-box'
                  }}
                />

                <button
                  type="submit"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '40px',
                    height: '40px',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/search.svg"
                    alt="search"
                    style={{ width: '66px', height: '66px' }}
                  />
                </button>
              </div>
            </form>

            {query && (
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                maxHeight: '200px',
                overflowY: 'auto',
                width: '90%',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: '#fff',
                position: 'absolute',
                top: '100%',
                left: '50%',  // This positions it to align with input left edge
                transform: 'translateX(-50%)',
                zIndex: 10
              }}>
                {suggestions.length > 0 ? (
                  // to show only first 10: ->there might be 100s of options. if we limit we need to fix the visualization when using arrows.
                  // suggestions.slice(0, 10).map((s, index) => (
                  suggestions.map((s, index) => (
                    <li
                      key={s.slug}
                      ref={selectedIndex === index && index < suggestions.length ? selectedRef : null}
                      style={{
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        backgroundColor: selectedIndex === index ? '#f0f8ff' : 'transparent',
                        color: selectedIndex === index ? '#0070f3' : 'inherit'
                      }}
                    >
                      <a href={`/plans/${encodeURIComponent(s.slug)}`}>
                        {s.planName}
                      </a>
                    </li>
                  ))
                ) : (
                  <li style={{
                    padding: '0.5rem 1rem',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    No plans found
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* popular plans */}
          {popularPlans.length > 0 && (
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
)}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}