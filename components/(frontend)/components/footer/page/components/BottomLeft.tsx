"use client";

import React, { memo } from "react";
import Link from "next/link";
import {
  FACEBOOK_LINK,
  INSTAGRAM_LINK,
  LINKEDIN_LINK,
  TWITTER_LINK,
  YOUTUBE_LINK,
} from "@/common/constants/companyDetails";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";

function FooterBottomLeft() {
  const socials = [
    { label: "Instagram", href: INSTAGRAM_LINK, icon: Instagram },
    { label: "Facebook", href: FACEBOOK_LINK, icon: Facebook },
    { label: "YouTube", href: YOUTUBE_LINK, icon: Youtube },
    { label: "LinkedIn", href: LINKEDIN_LINK, icon: Linkedin },
    { label: "Twitter", href: TWITTER_LINK, icon: Twitter },
  ];

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs sm:text-sm text-charcoal-3/75 font-medium mr-1.5 hidden min-[360px]:inline">
        Socials:
      </span>
      {socials.map((s, idx) => {
        const Icon = s.icon;
        return (
          <Link
            key={idx}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            prefetch={false}
            aria-label={s.label}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-charcoal-3/15 text-charcoal-3/80 hover:text-sienna hover:border-sienna/40 flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105"
          >
            <Icon className="w-4 h-4 stroke-[1.8]" />
          </Link>
        );
      })}
    </div>
  );
}

export default memo(FooterBottomLeft);
