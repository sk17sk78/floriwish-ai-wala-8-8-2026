// hooks
import { useAppStates } from "@/hooks/useAppState/useAppState";

// components
import Link from "next/link";

export default function ShopMore() {
  const {
    auth: {
      data: { isAuthenticated }
    }
  } = useAppStates();

  return !isAuthenticated ? (
    <Link
      href={"/"}
      className="w-full flex items-center justify-start gap-3 rounded-full bg-sienna-1/10 border border-sienna-1/20 hover:bg-sienna-1/20 px-4 py-2.5 text-sm font-bold text-sienna-1 transition-all duration-300 shadow-xs group"
    >
      <div className="flex items-center justify-center bg-sienna-1 text-white rounded-full w-5 h-5 group-hover:scale-110 transition-transform duration-300">
        <span className="text-base leading-none mb-0.5">+</span>
      </div>
      <span>I wish to Shop More</span>
    </Link>
  ) : (
    <></>
  );
}
