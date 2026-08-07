import {
  Building2,
  Info,
  Mail,
  MessageSquare,
  Phone,
  UserCircle,
} from "lucide-react";
import { WhatsappSVG } from "@/common/svgs/svg";

// utils
import { whatsappContact } from "@/common/utils/_contactDetails";

// types
import { type ReactNode } from "react";
import {
  COMPANY_EMAIL,
  COMPANY_NUMBER,
} from "@/common/constants/companyDetails";

export type ContactLinks = {
  svg: ReactNode;
  label: string;
  link: string;
  rightSide?: { label: string; color: string };
};

export const CONTACT_LINKS: ContactLinks[] = [
  {
    label: "Register as Vendor",
    svg: <UserCircle width={20} height={20} strokeWidth={1.5} />,
    link: `/vendor/register`,
    rightSide: {
      color: "text-[#b76e79]",
      label: "Join Now",
    },
  },
  {
    label: "Get a Franchise",
    svg: <Building2 width={20} height={20} strokeWidth={1.5} />,
    link: `/franchise`,
    rightSide: {
      color: "text-[#b76e79]",
      label: "Join Now",
    },
  },
  {
    label: "Call Us",
    svg: <Phone width={20} height={20} strokeWidth={1.5} />,
    link: `tel:${COMPANY_NUMBER}`,
    rightSide: {
      color: "text-blue-500",
      label: "10AM - 7:30PM",
    },
  },
  {
    label: "Whatsapp Us",
    svg: <WhatsappSVG dimensions={20} className="scale-110" />,
    link: whatsappContact(),
    rightSide: {
      color: "text-green-600",
      label: "10AM - 7:30PM",
    },
  },
  {
    label: "Email Us",
    svg: <Mail width={20} height={20} strokeWidth={1.5} />,
    link: `mailto:${COMPANY_EMAIL}`,
  },
  {
    label: "About Us",
    svg: <Info width={20} height={20} strokeWidth={1.5} />,
    link: `/more/about-us`,
  },
  {
    label: "Contact Us",
    svg: <MessageSquare width={20} height={20} strokeWidth={1.5} />,
    link: `/contact`,
  },
];
