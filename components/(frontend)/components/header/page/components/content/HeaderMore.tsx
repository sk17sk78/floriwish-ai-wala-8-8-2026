// libraries
import Link from "next/link";
import {
  MoreHorizontal,
  UserCircle,
  Phone,
  User,
  Building2,
  HelpCircle,
} from "lucide-react";
import { memo } from "react";
import { WhatsappSVG } from "@/common/svgs/svg";
import { whatsappContact } from "@/common/utils/_contactDetails";

function HeaderMore() {
  return (
    <div className="max-lg:hidden relative group">
      <button
        type="button"
        aria-label="More"
        className="block relative p-2 rounded-xl transition-all duration-300 cursor-pointer hover:bg-charcoal-3/5 group after:content-[''] after:absolute after:w-full after:h-6 after:left-0 after:-bottom-5 outline-none border-none bg-transparent"
      >
        <div className="flex items-center justify-center transition-all duration-300">
          <MoreHorizontal
            strokeWidth={1.5}
            height={22}
            width={22}
            className="text-charcoal-3/70 group-hover:text-charcoal-3/90 transition-colors"
          />
        </div>
      </button>

      {/* Dropdown Modal */}
      <div className="absolute top-[80%] right-0 mt-2 w-[210px] bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 flex flex-col">
        <Link
          href="/about"
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-charcoal-3 hover:text-sienna-1 transition-colors"
        >
          <UserCircle strokeWidth={1.5} height={18} width={18} />
          <span className="text-[15px] font-medium">About Us</span>
        </Link>
        <Link
          href="/contact"
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-charcoal-3 hover:text-sienna-1 transition-colors"
        >
          <Phone strokeWidth={1.5} height={18} width={18} />
          <span className="text-[15px] font-medium">Contact Us</span>
        </Link>
        <Link
          href="/vendor/register"
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-charcoal-3 hover:text-sienna-1 transition-colors"
        >
          <User strokeWidth={1.5} height={18} width={18} />
          <span className="text-[15px] font-medium">Become a Vendor</span>
        </Link>
        <Link
          href="/franchise"
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-charcoal-3 hover:text-sienna-1 transition-colors"
        >
          <Building2 strokeWidth={1.5} height={18} width={18} />
          <span className="text-[15px] font-medium">Get a Franchise</span>
        </Link>
        <Link
          href="/faqs"
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-charcoal-3 hover:text-sienna-1 transition-colors"
        >
          <HelpCircle strokeWidth={1.5} height={18} width={18} />
          <span className="text-[15px] font-medium">FAQs</span>
        </Link>
        <div className="h-px bg-gray-100 my-1"></div>
        <a
          href={whatsappContact()}
          target="_blank"
              rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-charcoal-3 hover:text-[#25D366] transition-colors"
        >
          <WhatsappSVG dimensions={18} className="text-[#25D366]" />
          <span className="text-[15px] font-medium">Whatsapp Us</span>
        </a>
      </div>
    </div>
  );
}

export default memo(HeaderMore);
