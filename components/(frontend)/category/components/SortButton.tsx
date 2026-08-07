"use client";

// icons
import { ListFilter } from "lucide-react";

// components
import { useState } from "react";
import SortModal from "./SortModal";

// constants
import { CATEGORY_PAGE_SORT_OPTIONS } from "../constants/sort";

// types
import { type CategoryPageSort } from "../types/sort";

export interface SortButtonProps {
  sortBy: CategoryPageSort;
  onChangeSortBy: (value: CategoryPageSort) => void;
  className?: string;
}

export default function SortButton({
  sortBy,
  onChangeSortBy,
  className
}: SortButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = CATEGORY_PAGE_SORT_OPTIONS.find(
    (option) => option.value === sortBy
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className={`flex items-center gap-2 px-4 py-2 bg-white border border-charcoal/10 rounded-xl hover:bg-charcoal/5 transition-all duration-300 group ${className || ""}`}
      >
        <ListFilter
          className="w-4 h-4 text-charcoal/60 group-hover:text-charcoal/80"
          strokeWidth={2}
        />
        <span className="text-sm font-medium text-charcoal/80">
          Sort: <span className="text-charcoal font-semibold">{selectedOption?.label || "Most Popular"}</span>
        </span>
      </button>

      <SortModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        sortBy={sortBy}
        onChangeSortBy={onChangeSortBy}
      />
    </>
  );
}
