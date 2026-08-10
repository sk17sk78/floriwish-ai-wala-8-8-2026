"use client";

// icons
import { Search } from "lucide-react";

// utils
import { memo, useState, useEffect, useRef } from "react";

// components
import SearchContentDialog from "./SearchContentDialog";

// types
import { type SearchBarInitialContentsType } from "../../../../Header";

const PLACEHOLDER_ITEMS = [
  "Search For Balloon Decoration",
  "Search For Cakes",
  "Search For Flowers",
  "Search For Varmala",
];

const TYPING_SPEED = 80;    // ms per character while typing
const DELETING_SPEED = 45;  // ms per character while deleting
const PAUSE_AFTER_TYPE = 1600; // ms pause after full word is typed
const PAUSE_AFTER_DELETE = 400; // ms pause before typing next word

function useTypewriterPlaceholder(items: string[]) {
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting" | "waiting">("typing");
  const [itemIndex, setItemIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = items[itemIndex];

    if (phase === "typing") {
      if (charIndex < current.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(current.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        }, TYPING_SPEED);
      } else {
        timeoutRef.current = setTimeout(() => setPhase("deleting"), PAUSE_AFTER_TYPE);
      }
    } else if (phase === "deleting") {
      if (charIndex > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(current.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        }, DELETING_SPEED);
      } else {
        timeoutRef.current = setTimeout(() => {
          setItemIndex((i) => (i + 1) % items.length);
          setPhase("typing");
        }, PAUSE_AFTER_DELETE);
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phase, charIndex, itemIndex, items]);

  return displayed;
}

function SearchDesktop({
  searchResults,
}: {
  searchResults: SearchBarInitialContentsType | null;
}) {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const animatedPlaceholder = useTypewriterPlaceholder(PLACEHOLDER_ITEMS);

  return (
    <>
      <div
        className="z-20 max-lg:hidden absolute top-0.5 left-1/2 -translate-x-1/2"
        onClick={() => {
          setIsFocused(true);
        }}
      >
        <section
          className={`z-[999] absolute max-lg:hidden lg:min-w-[380px] xl:min-w-[480px] -translate-x-1/2 outline-none text-charcoal-3/90 backdrop-blur-md bg-white/90 rounded-full w-fit py-2 px-5 text-base border border-charcoal-3/15 shadow-sm transition-all duration-300 hover:border-charcoal-3/25`}
        >
          <section className="flex items-center justify-start lg:justify-between gap-3 text-charcoal-3/80 bg-transparent transition-all duration-300">
            <Search
              width={18}
              height={18}
              strokeWidth={2}
              className="text-charcoal-3/80"
            />
            <div className="flex-1 ml-1 text-sm text-charcoal-3/70 select-none overflow-hidden whitespace-nowrap">
              <span>{animatedPlaceholder}</span>
              <span className="inline-block w-[1.5px] h-[13px] bg-charcoal-3/50 ml-[1px] align-middle animate-blink" />
            </div>
            <div className="hidden lg:flex items-center justify-center border border-charcoal-3/20 rounded-md px-1.5 py-0.5 bg-ash-1/10 text-[10px] font-bold text-charcoal-3/75 shadow-sm ml-2">
              ⌘K
            </div>
          </section>
        </section>
      </div>
      <SearchContentDialog
        isFocused={isFocused}
        searchResults={searchResults}
        onChangeIsFocused={setIsFocused}
      />
    </>
  );
}

export default memo(SearchDesktop);
