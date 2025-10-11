import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '@/components/NavBar.js';
import Footer from '@/components/Footer.js';
import PopularPlansCarousel from '@/components/homepage/PopularPlansCarousel';
import styles from '@/styles/Home.module.css';
import { fetchPopularPlans, fetchSearchOptions } from '@/utils/homepage/api';
import SearchBox from '@/components/homepage/SearchBox';

export default function Home() {
  const [popularPlans, setPopularPlans] = useState([]);
  const [searchOptions, setSearchOptions] = useState({ countries: [], dataSizes: [], durations: [] });
  const router = useRouter();

  //set popular plans list
  useEffect(() => {
    const getPopularPlans = async () => {
      const popular = await fetchPopularPlans();
      setPopularPlans(popular);
    }
    getPopularPlans();
  }, []);

  const handleNavigate = (path) => {
    router.push(path);
  };

  useEffect(() => {
    const getSearchOptions = async () => {
      const options = await fetchSearchOptions();
      setSearchOptions(options);
    };
    getSearchOptions();
  }, []);


  return (
    <div className={`relative w-full ${styles.pageContainer}`}>
      <NavBar />     
      
      <div className={styles.heroWrapper}>
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hp_bg.svg"
            alt="Background illustration"
            // className="min-w-full min-h-full object-cover pointer-events-none select-none"
          />
        </div>

          <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Best eSIM Match Based on<br />Your Travel Needs
          </h1>

          <SearchBox 
            searchOptions={searchOptions}
            onNavigate={handleNavigate} 
          />

          {/* popular plans */}
          {popularPlans.length > 0 && (
            <PopularPlansCarousel popularPlans={popularPlans} />
          )}

        </div>
      </div>
      
      <Footer />
    </div>
  );
}