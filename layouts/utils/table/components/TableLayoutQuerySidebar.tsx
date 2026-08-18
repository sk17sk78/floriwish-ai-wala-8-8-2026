// components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import Input from "@/lib/Forms/Input/Input";

// icons
import { ArrowDownAZ, ArrowDownZA, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";

// types
import { type FilterOptionWithKeywordOptions } from "@/common/types/redux/filterOption";
import { type SelectOption } from "@/common/types/inputs";

export default function TableLayoutQuerySidebar({
  showSidebar,
  onClose,
  onReset,
  search,
  limit,
  filter,
  sort
}: {
  showSidebar: boolean;
  onClose?: () => void;
  onReset?: () => void;
  search?: {
    keyword: string;
    onChangeKeyword: (newKeyword: string) => void;
  };
  limit?: {
    limit: number;
    onChangeLimit: (newLimit: number) => void;
  };
  filter?: {
    options: FilterOptionWithKeywordOptions[];
    filterBy: string;
    keyword: string;
    onChangeFilterBy: (newFilterBy: string) => void;
    onChangeKeyword: (newKeyword: string) => void;
  };
  sort?: {
    options: SelectOption[];
    sortBy: string;
    orderBy: "asc" | "desc";
    onChangeSortBy: (newSortBy: string) => void;
    onChangeOrderBy: (newOrderBy: "asc" | "desc") => void;
  };
}) {
  if (!showSidebar) return null;

  return (
    <>
      {/* Backdrop for outside click */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over Drawer */}
      <section
        className="fixed top-0 right-0 h-full w-[320px] sm:w-[360px] max-w-[90vw] bg-white dark:bg-[#141416] text-zinc-900 dark:text-zinc-100 shadow-2xl z-50 border-l border-zinc-200 dark:border-zinc-800 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-zinc-600 dark:text-zinc-300" />
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Query & Filters
            </h4>
          </div>

          <div className="flex items-center gap-1.5">
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                title="Reset Filters"
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5 scrollbar-thin">
          {/* Search bar */}
          {search && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Search
              </label>
              <div className="relative flex items-center">
                <Search size={15} className="absolute left-3 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search keyword..."
                  value={search.keyword}
                  onChange={(e) => search.onChangeKeyword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Entries Limit Slider */}
          {limit && (
            <div className="flex flex-col gap-2 p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-zinc-500 dark:text-zinc-400">Showing Entries</span>
                <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-md font-bold">
                  {limit.limit} per page
                </span>
              </div>
              <input
                type="range"
                name="limit"
                value={limit.limit}
                onChange={(e) => {
                  limit.onChangeLimit(Number(e.target.value));
                }}
                min={10}
                max={100}
                step={10}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>
          )}

          <Accordion type="multiple" defaultValue={["filter", "sort", "order"]} className="flex flex-col gap-2">
            {/* Filter Section */}
            {filter && (
              <AccordionItem value="filter" className="border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 bg-white dark:bg-zinc-900/50">
                <AccordionTrigger className="text-sm font-bold text-zinc-800 dark:text-zinc-200 py-3 hover:no-underline">
                  Filter By
                </AccordionTrigger>
                <AccordionContent className="pb-3 pt-1">
                  <div className="flex flex-col justify-start gap-2.5">
                    <Input
                      type="dropdown"
                      name="filterBy"
                      isRequired={false}
                      errorCheck={false}
                      validCheck={false}
                      nullOption={true}
                      options={filter.options.map(({ label, value }) => ({
                        label,
                        value
                      }))}
                      customValue={{
                        value: filter.filterBy,
                        setValue: filter.onChangeFilterBy
                      }}
                      className="py-2.5 focus:!outline-none"
                    />
                    {filter.filterBy && (
                      <Input
                        type="dropdown"
                        name="filterByKeyword"
                        isRequired={false}
                        validCheck={false}
                        errorCheck={false}
                        nullOption={true}
                        options={
                          filter.options.find(
                            ({ value }) => value === filter.filterBy
                          )?.options || []
                        }
                        customValue={{
                          value: filter.keyword,
                          setValue: filter.onChangeKeyword
                        }}
                        className="py-2.5 focus:!outline-none"
                      />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Sort Section */}
            {sort && (
              <>
                <AccordionItem value="sort" className="border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 bg-white dark:bg-zinc-900/50">
                  <AccordionTrigger className="text-sm font-bold text-zinc-800 dark:text-zinc-200 py-3 hover:no-underline">
                    Sort By
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      {sort.options.map(({ label, value }, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => sort.onChangeSortBy(value)}
                          className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                            value === sort.sortBy
                              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                              : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Order Section */}
                <AccordionItem value="order" className="border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 bg-white dark:bg-zinc-900/50">
                  <AccordionTrigger className="text-sm font-bold text-zinc-800 dark:text-zinc-200 py-3 hover:no-underline">
                    Order By
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => sort.onChangeOrderBy("asc")}
                        className={`px-3 py-2 flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg border transition-all ${
                          sort.orderBy === "asc"
                            ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                            : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                        }`}
                      >
                        <ArrowDownAZ size={14} />
                        <span>Ascending</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => sort.onChangeOrderBy("desc")}
                        className={`px-3 py-2 flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg border transition-all ${
                          sort.orderBy === "desc"
                            ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                            : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                        }`}
                      >
                        <ArrowDownZA size={14} />
                        <span>Descending</span>
                      </button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </>
            )}
          </Accordion>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex gap-2">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="flex-1 py-2.5 px-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
          >
            Apply & Close
          </button>
        </div>
      </section>
    </>
  );
}
