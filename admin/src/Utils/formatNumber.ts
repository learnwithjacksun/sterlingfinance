export const formatNumber = (number: number | undefined): string => {
  return number?.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) || "";
};
