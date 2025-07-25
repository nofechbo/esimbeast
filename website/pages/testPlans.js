import { useEffect, useState } from "react";

export default function PlansPage() {
    const [planList, setPlanList] = useState(null);

    useEffect(() => {
        async function loadPlans() {
          const response = await fetch('/api/plans');
          const plans = await response.json();
          setPlanList(plans);
        }
    
        loadPlans();
      }, []);

      return (
        <div>
          {planList ? (
            <>
              <div>Number of rows: {planList.length}</div>
              <pre>{JSON.stringify(planList, null, 2)}</pre>
            </>
          ) : 
            <div>Loading...</div>
          }
        </div>
      );
}