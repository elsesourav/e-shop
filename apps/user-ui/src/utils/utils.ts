const formatNumber = (num: number, minFD: number = 2, maxFD: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: minFD,
    maximumFractionDigits: maxFD,
  }).format(num);
};
export { formatNumber };

