const ML_PER_FL_OZ = 29.5735;
const ML_PER_LITER = 1000;

export const mlToOz = (ml: number) => ml / ML_PER_FL_OZ;

export const ozToMl = (oz: number) => oz * ML_PER_FL_OZ;

export const mlToLiters = (ml: number) => ml / ML_PER_LITER;

export const litersToMl = (liters: number) => liters * ML_PER_LITER;
