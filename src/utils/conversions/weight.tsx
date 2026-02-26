const KG_CONVERSION = 0.45359237;

export const lbsToKg = (lbs: number): number => Math.round(lbs * KG_CONVERSION);

export const kgToLbs = (kg: number): number => Math.round(kg / KG_CONVERSION);

export const lbsToKgRounded = (lbs: number, decimals = 2): number => {
  return Number((lbs * 0.45359237).toFixed(decimals));
};

export const kgToLbsRounded = (kg: number, decimals = 2): number => {
  return Number((kg / 0.45359237).toFixed(decimals));
};
