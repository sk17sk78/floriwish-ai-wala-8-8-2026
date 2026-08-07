// libraries
import Link from "next/link";

// icons
import { User as UserIcon } from "lucide-react";

// utils
import { memo } from "react";

// hooks
import { useMemo } from "react";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";

function HeaderUserContent({
  isAuthenticated,
  userName,
  onClick,
}: {
  isAuthenticated: boolean;
  userName: string | null;
  onClick: () => void;
}) {
  // variables
  const userNameToShow = useMemo(
    () => userName?.split(" ")[0] || "Guest",
    [userName],
  );

  return (
    <>
      {isAuthenticated ? (
        <Link
          href={FRONTEND_LINKS.DASHBOARD}
          prefetch={false}
          aria-label="User Dashboard"
          className="max-lg:hidden group"
        >
          <div className="flex items-center gap-2 border border-charcoal-3/15 rounded-full px-3.5 py-1.5 transition-all duration-300 hover:bg-charcoal-3/5 hover:border-charcoal-3/25 bg-white/50 shadow-sm">
            <span className="relative overflow-hidden rounded-full aspect-square bg-gradient-to-br from-sienna-1/10 to-sienna-1/30 text-sienna-1 font-semibold w-6 h-6 grid place-items-center text-xs">
              {userName?.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-charcoal-3/95 font-medium text-sm">
              {userNameToShow.length > 10
                ? `${userNameToShow.substring(0, 10)}...`
                : userNameToShow}
            </span>
          </div>
        </Link>
      ) : (
        <div onClick={onClick} className="cursor-pointer max-lg:hidden group">
          <div className="flex items-center gap-2 border border-charcoal-3/15 rounded-full px-4 py-2 transition-all duration-300 hover:bg-charcoal-3/5 hover:border-charcoal-3/25 bg-white/50 shadow-sm">
            <UserIcon strokeWidth={1.5} height={18} width={18} className="text-charcoal-3/90" />
            <span className="text-charcoal-3/95 font-medium text-sm">
              Sign in
            </span>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(HeaderUserContent);
