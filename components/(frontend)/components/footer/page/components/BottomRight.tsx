import { memo } from "react";

function FooterBottomRight() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="text-xs sm:text-sm text-charcoal-3/75 font-normal text-center sm:text-left">
      &copy; {currentYear} Floriwish.com. All rights reserved.
    </div>
  );
}

export default memo(FooterBottomRight);
