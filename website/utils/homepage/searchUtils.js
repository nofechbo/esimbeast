export function filterSuggestions(planList, query) {
  if (!query.trim()) return [];
  
  const searchWords = query.trim().toLowerCase().split(/\s+/);
  
  return planList.filter(p => {
    const planName = p.planName.toLowerCase();
    return searchWords.every(word => planName.includes(word));
  });
}

export function findExactMatch(planList, query) {
  if (!query.trim()) return null;
  
  return planList.find(p => 
    p.planName.toLowerCase() === query.trim().toLowerCase()
  ) || null;
}