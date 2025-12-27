import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PopularPlansCarousel from "@/components/homepage/PopularPlansCarousel";
import styles from "@/styles/Home.module.css";
import { fetchPopularPlans, fetchSearchOptions } from "@/utils/homepage/api";
import SearchBox from "@/components/homepage/SearchBox";
import { handleReferral } from "@/utils/referral";
import { formatDataSize, formatDuration } from "@/utils/formaters";
import SEO from "@/components/SEO";

export default function Home() {
  const [popularPlans, setPopularPlans] = useState([]);
  const [searchOptions, setSearchOptions] = useState({
    countries: [],
    dataSizes: [],
    durations: [],
  });
  const router = useRouter();

  useEffect(() => {
    handleReferral(router);
  }, [router.isReady]);

  //set popular plans list
  useEffect(() => {
    const getPopularPlans = async () => {
      const popular = await fetchPopularPlans();
      setPopularPlans(popular);
    };
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
      <SEO
        title="Best eSIM Plans for International Travel"
        description="Find the perfect eSIM data plan for your trip. Compare prices across 190+ countries, instant activation, no roaming fees. Stay connected anywhere in the world."
        path="/"
      />
      <div className={styles.heroWrapper}>
        <div className={`absolute inset-0 z-0 flex items-center justify-center ${styles.bgImageWrapper}`}>
          <picture>
            <source media="(max-width: 768px)" srcSet="/bg-mobile.webp" type="image/webp" />
            <img
              src="/bg.png"
              alt="Background illustration"
              fetchPriority="high"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </picture>
        </div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Best eSIM Match Based on
            Your Travel Needs
          </h1>
          <SearchBox
            searchOptions={searchOptions}
            onNavigate={handleNavigate}
            formatData={formatDataSize}
            formatDuration={formatDuration}
          />
          {/* popular plans */}
          {popularPlans.length > 0 && (
            <PopularPlansCarousel
              popularPlans={popularPlans}
              formatData={formatDataSize}
              formatDuration={formatDuration}
              onNavigate={handleNavigate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
