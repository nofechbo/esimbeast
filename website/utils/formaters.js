export default function slugify(uniquePlanName) {
    return uniquePlanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')   // Replace non-alphanumeric with dashes
        .replace(/^-+|-+$/g, '');      // Trim leading/trailing dashes
}

export const formatDataSize = (d) => d === 0 ? "Unlimited" : d < 1 ? `${d * 1000} MB` : `${d} GB`;

export const formatDuration = (d) => `${d} ${d === 1 ? "day" : "days"}`;