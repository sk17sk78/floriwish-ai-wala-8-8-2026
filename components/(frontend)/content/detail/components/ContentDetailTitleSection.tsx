// icons
import {
  NonVegSymbol,
  VegSymbol,
} from "@/components/(_common)/Symbols/Edibles";

import { memo, type ReactNode } from "react";

// components
import ContentHorizontalSpacing from "../../spacing/ContentHorizontalSpacing";

// type
import { type EdibleDocument } from "@/common/types/documentation/nestedDocuments/edible";

function ContentDetailTitleSection({
  name,
  edible,
  actions,
}: {
  name: string;
  edible?: EdibleDocument;
  actions?: ReactNode;
}) {
  return (
    <ContentHorizontalSpacing className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-2">
        <h1 className="font-poppins text-2xl font-semibold leading-[1.18] tracking-[-0.03em] text-zinc-900 max-sm:text-xl">
          {name}
        </h1>
        {edible?.isEdible &&
          (edible.type === "veg" ? (
            <VegSymbol className="mt-1 scale-75" />
          ) : edible.type === "non-veg" ? (
            <NonVegSymbol className="mt-1 scale-75" />
          ) : (
            <></>
          ))}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </ContentHorizontalSpacing>
  );
}

export default memo(ContentDetailTitleSection);
