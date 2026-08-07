// utils
import { memo } from "react";

// icons
import { Star } from "lucide-react";

// components
import SortButton from "./SortButton";

// types
import { type CategoryPageSort } from "../types/sort";

function CategoryContentCountSort({
  count,
  sortBy,
  onChangeSortBy,
  rating,
  ratingCount
}: {
  count?: number;
  sortBy: CategoryPageSort;
  onChangeSortBy: (sortBy: CategoryPageSort) => void;
  rating?: number;
  ratingCount?: number;
}) {
  return (
    <div className="flex flex-row items-center justify-between py-6 gap-x-4 px-4 sm:px-0">
      <span className="text-[17px] sm:text-[19px] font-semibold text-charcoal/90">
        {count || 0} Products
      </span>

      <SortButton
        sortBy={sortBy}
        onChangeSortBy={(val: CategoryPageSort) => onChangeSortBy(val)}
      />
    </div>
  );
}

export default memo(CategoryContentCountSort);
