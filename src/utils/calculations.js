export const calculatePortfolioValue = (holdings) => {
  return holdings.reduce((total, holding) => {
    const stockPrice = holding.currentPrice || holding.price || 0;
    const shares = holding.shares || 0;
    return total + (shares * stockPrice);
  }, 0);
};

export const calculatePortfolioChange = (holdings) => {
  let totalValue = 0;
  let totalChange = 0;

  holdings.forEach(holding => {
    const stockPrice = holding.currentPrice || holding.price || 0;
    const shares = holding.shares || 0;
    const change = holding.change || 0;
    
    const currentValue = shares * stockPrice;
    const changeValue = shares * change;
    totalValue += currentValue;
    totalChange += changeValue;
  });

  return {
    totalChange,
    changePercent: totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0,
  };
};

export const formatCurrency = (amount) => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatPercentage = (percentage) => {
  if (isNaN(percentage) || percentage === null || percentage === undefined) {
    return '0.00%';
  }
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
};
