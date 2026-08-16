// types
import { type ReactNode } from "react";

export default function ContentGridWrapper({
  children
}: {
  children: ReactNode;
}) {
  return (
    <section className="relative grid grid-cols-1 items-start gap-y-1 max-sm:bg-white sm:pb-6 xl:grid-cols-[minmax(0,580px)_minmax(0,1fr)] xl:gap-x-8 xl:gap-y-5">
      {children}
    </section>
  );
}
