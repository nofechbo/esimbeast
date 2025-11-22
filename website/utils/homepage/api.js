import { toast } from "react-toastify";

export async function fetchPopularPlans() {
  try {
    const response = await fetch("/api/plans/popular");
    const plans = await response.json();
    if (!response.ok) {
      throw new Error(plans?.msg || plans?.error || `error ${response.status}`);
    }
    return plans;
  } catch (err) {
    console.error("error in fetch popular plans", err);
    toast.error("Failed to load popular plans");
    return [];
  }
}

export async function fetchSearchOptions() {
  try {
    const response = await fetch("/api/search/options");
    const options = await response.json();
    if (!response.ok) {
      throw new Error(
        options?.msg || options?.error || `error ${response.status}`
      );
    }
    return options;
  } catch (err) {
    console.error("error in fetch search options", err);
    toast.error("Failed to load search options");
    return { countries: [], dataSizes: [], durations: [] };
  }
}
