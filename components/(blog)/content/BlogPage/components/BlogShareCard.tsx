"use client";

import { useState } from "react";
import { Link as LinkIcon, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function BlogShareCard({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Blog article link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${title}\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(title);
    const link = encodeURIComponent(url);
    window.open(`https://twitter.com/intent/tweet?url=${link}&text=${text}`, "_blank");
  };

  const shareFacebook = () => {
    const link = encodeURIComponent(url);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${link}`, "_blank");
  };

  return (
    <div className="w-full bg-white border border-zinc-100 rounded-3xl p-5 sm:p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] my-6">
      <span className="text-[11px] sm:text-xs font-bold tracking-widest text-zinc-400 uppercase mb-3.5 block">
        SHARE
      </span>

      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          title="Copy Link"
          className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl border border-zinc-200/80 bg-white flex items-center justify-center text-zinc-600 hover:border-sienna-1 hover:text-sienna-1 transition-all duration-300 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
        >
          {copied ? (
            <Check className="h-5 w-5 text-emerald-600" />
          ) : (
            <LinkIcon className="h-5 w-5 stroke-[1.75]" />
          )}
        </button>

        {/* WhatsApp Button */}
        <button
          onClick={shareWhatsApp}
          title="Share on WhatsApp"
          className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl border border-zinc-200/80 bg-white flex items-center justify-center text-zinc-600 hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.163 4.249 4.316-1.131z" />
          </svg>
        </button>

        {/* X (Twitter) Button */}
        <button
          onClick={shareTwitter}
          title="Share on X (Twitter)"
          className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl border border-zinc-200/80 bg-white flex items-center justify-center text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-all duration-300 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
        >
          <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        {/* Facebook Button */}
        <button
          onClick={shareFacebook}
          title="Share on Facebook"
          className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl border border-zinc-200/80 bg-white flex items-center justify-center text-zinc-600 hover:border-blue-600 hover:text-blue-600 transition-all duration-300 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
