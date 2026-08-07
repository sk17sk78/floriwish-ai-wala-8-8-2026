// libraries
import Link from "next/link";
import { Store, User, Building2 } from "lucide-react";
import { memo } from "react";

function HeaderSellWithUs() {
  return (
    <div className="max-lg:hidden relative ml-3 mr-1 group">
      <Link
        href={"/vendor/register"}
        prefetch={false}
        aria-label="Sell with Us"
        className="block py-2" // added py-2 for better hover area
      >
        <div className="flex items-center gap-2 border border-charcoal-3/15 rounded-full px-4 py-2 transition-all duration-300 hover:bg-charcoal-3/5 hover:border-charcoal-3/25 bg-white/50 shadow-sm cursor-pointer">
          <Store
            className="text-charcoal-3/70"
            strokeWidth={1.5}
            height={18}
            width={18}
          />
          <span className="text-charcoal-3/80 font-medium text-sm whitespace-nowrap">
            Sell with Us
          </span>
        </div>
      </Link>
      <span className="absolute -top-0.5 -right-3 bg-sienna-1 bg-gradient-to-r from-sienna-1/90 to-sienna-2 text-white text-[10px] leading-tight font-medium px-2 py-0.5 rounded-full shadow-sm z-10 pointer-events-none">
        Register
      </span>

      {/* Dropdown Modal */}
      <div className="absolute top-[85%] left-1/2 -translate-x-1/2 mt-2 w-52 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 flex flex-col">
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
      </div>
    </div>
  );
}

export default memo(HeaderSellWithUs);
