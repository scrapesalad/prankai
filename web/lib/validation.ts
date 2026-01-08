export const isValidE164 = (value: string) => {
  return /^\+[1-9]\d{7,14}$/.test(value);
};
