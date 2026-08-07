import { Children } from "@/common/types/reactTypes";

export const CustomizeProductSpacing = ({
  children,
  title
}: {
  children: Children;
  title: string;
}) => (
  <div className="flex flex-col items-stretch justify-start gap-[18px] bg-ivory-1 pl-4 pr-3.5 sm:pl-7 sm:pr-2 max-sm:pt-6 max-sm:pb-5 sm:mb-4 max-sm:rounded-3xl max-sm:shadow-light">
    {title ? (
      <span className="text-sm font-bold text-zinc-800 tracking-wide uppercase">
        {title}
      </span>
    ) : (
      <></>
    )}
    {children}
  </div>
);
