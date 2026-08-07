"use client";

// icons
import {
  TrendingUp,
  Package,
  MoveUp,
  MoveDown,
  ListFilter,
  X
} from "lucide-react";

// components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

// constants
import { CATEGORY_PAGE_SORT_OPTIONS } from "../constants/sort";

// types
import { type CategoryPageSort } from "../types/sort";

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: CategoryPageSort;
  onChangeSortBy: (value: CategoryPageSort) => void;
}

const getSortIcon = (value: CategoryPageSort) => {
  switch (value) {
    case "popularity":
      return <TrendingUp className="w-5 h-5" strokeWidth={1.5} />;
    case "latest":
      return <Package className="w-5 h-5" strokeWidth={1.5} />;
    case "low-to-high":
      return <MoveUp className="w-5 h-5" strokeWidth={1.5} />;
    case "high-to-low":
      return <MoveDown className="w-5 h-5" strokeWidth={1.5} />;
    default:
      return null;
  }
};

export default function SortModal({
  isOpen,
  onClose,
  sortBy,
  onChangeSortBy
}: SortModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6 rounded-3xl border-none gap-6">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <ListFilter className="w-6 h-6 text-charcoal/80" strokeWidth={1.5} />
            <DialogTitle className="text-[22px] font-semibold text-charcoal-3 leading-none">
              Sort Products
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-2 mt-4">
          {CATEGORY_PAGE_SORT_OPTIONS.map((option) => {
            const isSelected = sortBy === option.value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onChangeSortBy(option.value);
                  onClose();
                }}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-left ${
                  isSelected
                    ? "bg-[#FEF1F1] text-[#9E2A2B] font-semibold"
                    : "text-charcoal/70 hover:bg-charcoal/5 font-medium"
                }`}
              >
                <span className={`${isSelected ? "text-[#9E2A2B]" : "text-charcoal/40"}`}>
                  {getSortIcon(option.value)}
                </span>
                <span className="text-[16px]">{option.label}</span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
