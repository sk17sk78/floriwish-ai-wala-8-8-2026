import { COMPANY_NUMBER, COMPANY_WHATSAPP } from "../constants/companyDetails";

export const whatsappContact = (message?: string): string => {
  const cleanNumber = (COMPANY_WHATSAPP || "+918708388018").replace(/[^0-9]/g, "");
  const msg = message || `Hey, I have a query`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
};

export const mobileContact = (): string => `tel:${COMPANY_NUMBER}`;
