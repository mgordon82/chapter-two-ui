export const lbsToKg = (lbs: number): number => {
  return lbs * 0.45359237;
};

export const kgToLbs = (kg: number): number => {
  return kg / 0.45359237;
};

export const lbsToKgRounded = (lbs: number, decimals = 2): number => {
  return Number((lbs * 0.45359237).toFixed(decimals));
};

export const kgToLbsRounded = (kg: number, decimals = 2): number => {
  return Number((kg / 0.45359237).toFixed(decimals));
};
