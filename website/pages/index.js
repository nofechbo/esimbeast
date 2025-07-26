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
    <div className={styles.container}>
      <NavBar />     
      
      <div className={styles.contentContainer}>
        <div className={styles.backgroundImage}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hp_bg.svg"
            alt="Background illustration"
          />
        </div>

          <div className={styles.mainContent}>
          <h1 className={styles.title}>
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