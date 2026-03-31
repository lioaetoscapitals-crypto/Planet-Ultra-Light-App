export const isValidPhone = (value: string) => /^[0-9]{8,15}$/.test(value.trim());

export const required = (value: string) => value.trim().length > 0;
