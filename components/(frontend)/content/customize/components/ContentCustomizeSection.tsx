import { ReactNode } from "react";

export default function ContentCustomizeSection({
  children,
  title
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3 my-2 w-full">
      {Boolean(title) && (
        <h3 className="text-[15px] sm:text-base font-bold text-zinc-900 font-poppins tracking-tight">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
