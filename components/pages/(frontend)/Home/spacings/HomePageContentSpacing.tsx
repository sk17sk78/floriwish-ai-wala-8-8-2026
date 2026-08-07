import HomepageLayoutHoverActions from "@/components/(admin)/routes/page/homepage/components/actions/HomepageLayoutHoverActions";
import { BASE_HOME_BG_COLOR } from "../static/pallette";
import MaxWidthWrapper from "@/components/(frontend)/global/_MaxWidthWrapper/MaxWidthWrapper";
import BoxTheme from "@/components/(frontend)/global/_Templates/BoxTheme/BoxTheme";

export default function HomePageContentSpacing(
  props: {
    children: React.ReactNode;
    leftAlign?: boolean;
    extraSpacing?: boolean;
    id?: string;
    showActions: boolean;
    customBG?: string;
    excludeBox?: boolean;
    isContent?: boolean;
    layoutNumber?: number;
    categoryShape?: "circle" | "square";
    noPadding?: boolean;
    overflowVisible?: boolean;
  } & (
    | { showActions: false }
    | {
        showActions: true;
        onClickEdit: (id: string) => void;
        onClickDisable: (id: string) => void;
        onClickDelete: (id: string) => void;
      }
  ),
) {
  const { children, leftAlign, extraSpacing, id, showActions, layoutNumber, categoryShape, overflowVisible } =
    props;
  const { customBG, excludeBox, isContent, noPadding } = props;

  return (
    <section
      id={id}
      style={customBG ? { backgroundColor: customBG } : {}}
      className={` ${showActions ? "relative" : ""} ${leftAlign ? "text-left" : "text-center"} ${extraSpacing ? "py-10" : excludeBox ? "pt-4 pb-0" : "pb-6"} ${customBG ? "" : BASE_HOME_BG_COLOR} ${customBG ? "w-device min-w-[100vw] relative left-1/2 -translate-x-1/2 overflow-hidden block" : ""}`}
    >
      <MaxWidthWrapper
        // forceApply
        className={`max-sm:px-3.5 ${categoryShape === "circle" || noPadding ? "max-sm:!px-0" : ""}`}
      >
        <BoxTheme
          excludeBox={excludeBox}
          isContent={isContent}
          noPadding={noPadding}
          className={`${categoryShape === "circle" ? "!overflow-visible max-sm:!p-0" : ""} ${overflowVisible ? "!overflow-visible" : ""}`}
        >
          {children}
        </BoxTheme>
      </MaxWidthWrapper>

      {showActions ? (
        <HomepageLayoutHoverActions
          id={id || ""}
          onClickDelete={props.onClickDelete}
          onClickDisable={props.onClickDisable}
          onClickEdit={props.onClickEdit}
          layoutNumber={layoutNumber || 0}
        />
      ) : (
        <></>
      )}
    </section>
  );
}
