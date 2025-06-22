
// Format currency utility with Rupee symbol
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR' 
  }).format(amount);
};
