
import HomepageLayoutHoverActions from "@/components/(admin)/routes/page/homepage/components/actions/HomepageLayoutHoverActions";

export default function HomePageTitleSpacing(
  props: {
    title: string | undefined;
    leftAlign?: boolean;
    id?: string;
    layoutNumber?: number;
  } & (
    | { showActions: false }
    | {
        showActions: true;
        onClickEdit: (id: string) => void;
        onClickDisable: (id: string) => void;
        onClickDelete: (id: string) => void;
      }
  )
) {
  const { title, leftAlign, id, showActions, layoutNumber } = props;
  if (!title || title.length == 0) return <></>;
  return (
    <div
      id={id}
      className={`${leftAlign ? "text-left" : "text-center"} ${showActions ? "relative" : ""} text-sienna tracking-tight text-[18px] sm:text-[22px] lg:text-[24px] font-semibold py-3 sm:py-4`}
    >
      {title}

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
    </div>
  );
}
