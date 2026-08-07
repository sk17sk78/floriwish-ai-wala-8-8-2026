import { memo } from "react";
import { WEBSITE_NAME } from "@/common/constants/environmentVariables";

function FooterBottomRight() {
  return (
    <section className="sm:w-fit text-charcoal-3 text-xs items-end max-sm:text-center">
      &copy; {new Date().getFullYear()} Floriwish.com.All rights reserved.
    </section>
  );
}

export default memo(FooterBottomRight);
