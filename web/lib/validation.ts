export const normalizePhone = (value: string) => {
  return (value || "").replace(/[\s\-()]/g, "");
};

export const isValidE164 = (value: string) => {
  return /^\+[1-9]\d{7,14}$/.test(normalizePhone(value));
};
