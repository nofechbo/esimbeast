import { useState, useEffect, useRef } from 'react';
import { filterSuggestions, findExactMatch } from '@/utils/homepage/searchUtils';
import styles from '../../styles/Home.module.css';

export default function SearchBox({ planList, onNavigate }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const selectedRef = useRef(null);

  // Filter suggestions based on query
  const suggestions = filterSuggestions(planList, query);

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
    const match = findExactMatch(planList, query);
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
        className={styles.searchForm}
      >
        <div className={styles.searchWrapper}>
          <div className={styles.pinIcon}>
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
            className={styles.searchInput}
          />

          <button
            type="submit"
            className={styles.searchButton}
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
        <ul className={styles.suggestionsList}>
          {suggestions.length > 0 ? (
            suggestions.map((s, index) => (
              <li
                key={s.slug}
                ref={selectedIndex === index && index < suggestions.length ? selectedRef : null}
                className={`${styles.suggestionItem} ${selectedIndex === index ? styles.selectedItem : ''}`}
                onClick={() => onNavigate(`/plans/${encodeURIComponent(s.slug)}`)}
              >
                <a href={`/plans/${encodeURIComponent(s.slug)}`}>
                    {s.planName}
                  </a>
              </li>
            ))
          ) : (
            <li className={styles.noSuggestions}>No plans found</li>
          )}
        </ul>
      )}
    </div>
  );
}