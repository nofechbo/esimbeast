export async function fetchPlans() {
    try {
          const response = await fetch('/api/plans');
          /** @type {any} */
          const plans = await response.json();
            if (!response.ok) {
                throw new Error(plans?.msg || plans?.error || `error ${response.status}`);
            }
            return plans;

    } catch (err) {
        console.error("error in fetch plans", err)
        return []
    }
}
    
export async function fetchPlanByUniqueName(uniqueName) {
    try {
        const response = await fetch(`/api/plans/${uniqueName}`);
        const plan = await response.json();
        if (!response.ok) {
            throw new Error(plan?.msg || plan?.error || `error ${response.status}`);
        }
        return plan;
    } catch (err) {
        console.error("error in fetchPlanByUniqueName", err);
        return null;
    }
}