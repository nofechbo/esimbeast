import { useState, useEffect, useRef } from 'react';

export default function SearchBox({ planList, onNavigate }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const selectedRef = useRef(null);

  // Filter suggestions based on query
  const suggestions = query.trim() ? planList.filter(p => {
    const searchWords = query.trim().toLowerCase().split(/\s+/);
    const planName = p.planName.toLowerCase();
    return searchWords.every(word => planName.includes(word));
  }) : [];

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions.length, query]);

  // Auto-scroll to selected suggestion
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
      onNavigate(`/plans/${encodeURIComponent(suggestions[selectedIndex].slug)}`);
      return;
    }

    // Otherwise, try exact match
    const match = planList.find(p => 
      p.planName.toLowerCase() === query.trim().toLowerCase()
    );
    if (!match) return; // prevent invalid nav

    onNavigate(`/plans/${encodeURIComponent(match.slug)}`);
  };

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
          onNavigate(`/plans/${encodeURIComponent(suggestions[selectedIndex].slug)}`);
        }
        break;
      
      case 'Escape':
        setSelectedIndex(-1);
        setQuery('');
        break;
    }
  };

  return (
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
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10
        }}>
          {suggestions.length > 0 ? (
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
                onClick={() => onNavigate(`/plans/${encodeURIComponent(s.slug)}`)}
              >
                {s.planName}
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
  );
}