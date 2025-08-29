import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import NavBar from '@/components/NavBar.js';
import Footer from '@/components/Footer.js';
import { planValues } from '@/utils/planHeaders';
import PopularPlansCarousel from '@/components/homepage/PopularPlansCarousel';
import SearchBox from '@/components/homepage/SearchBox';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const [planList, setPlanList] = useState([]);
  const [popularPlans, setPopularPlans] = useState([]);
  const router = useRouter();

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


  const handleNavigate = (path) => {
    router.push(path);
  };


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
            planList={planList} 
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