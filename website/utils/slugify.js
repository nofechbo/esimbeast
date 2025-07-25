export default function slugify(plan) {
    const combined = `${plan.productName} ${plan.wmproductId}`;

    return combined
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')   // Replace non-alphanumeric with dashes
        .replace(/^-+|-+$/g, '');      // Trim leading/trailing dashes
}
  