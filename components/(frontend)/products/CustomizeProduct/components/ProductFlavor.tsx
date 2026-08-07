import { SetStateType } from "@/common/types/reactTypes";
import { INRSymbol } from "@/common/constants/symbols";
import { ContentFlavourItemDocument } from "@/common/types/documentation/nestedDocuments/contentFlavourItem";
import { ContentUpgradeItemDocument } from "@/common/types/documentation/nestedDocuments/contentUpgradeItem";
import { FlavourDocument } from "@/common/types/documentation/presets/flavour";
import { UpgradeDocument } from "@/common/types/documentation/presets/upgrade";

export default function ProductFlavor({
  selected,
  setSelected,
  availableOptions,
  defaultOption,
  type
}: {
  selected: string | undefined;
  setSelected: SetStateType<string | undefined>;
} & (
  | {
      availableOptions: Array<ContentUpgradeItemDocument>;
      defaultOption: UpgradeDocument;
      type: "upgrade";
    }
  | {
      availableOptions: Array<ContentFlavourItemDocument>;
      defaultOption: FlavourDocument;
      type: "flavor";
    }
)) {
  const updateSelected = ({
    selected,
    type,
    isDefault
  }: {
    selected: string;
    type: "flavor" | "upgrade";
    isDefault: boolean;
  }) =>
    setSelected((prev) =>
      isDefault
        ? (String(defaultOption._id))
        : prev && (prev as string) === selected
          ? (String(defaultOption._id))
          : selected
    );

  return (
    <div className="flex items-center justify-start gap-3 sm:gap-2 max-sm:overflow-x-scroll sm:flex-wrap sm:*:min-w-fit scrollbar-hide">
      <div
        className={`flex flex-col items-center justify-center *:text-center py-2 px-4 rounded-lg border ${selected && String(defaultOption._id) === String(selected) ? "border-sienna text-sienna bg-gradient-to-br from-sienna-1/20 via-transparent to-sienna-1/20" : "border-ash hover:border-charcoal-3/70 hover:bg-ash-2/15"} transition-all duration-300 cursor-pointer`}
        onClick={() =>
          updateSelected({
            selected: String(defaultOption._id),
            type,
            isDefault: true
          })
        }
      >
        <span className="whitespace-nowrap">
          {type === "flavor"
            ? (defaultOption as FlavourDocument).name
            : (defaultOption as UpgradeDocument).label}
        </span>
        <span className="text-sm">(Default)</span>
      </div>

      {availableOptions.map((option, index) => (
        <div
          className={`flex flex-col items-center justify-center *:text-center py-2 px-4 rounded-lg border ${selected && String(option._id) === String(selected) ? "border-sienna text-sienna bg-gradient-to-br from-sienna-1/20 via-transparent to-sienna-1/20" : "border-ash hover:border-charcoal-3/70 hover:bg-ash-2/15"} transition-all duration-300 cursor-pointer`}
          onClick={() =>
            updateSelected({
              selected: String(option._id),
              type,
              isDefault: false
            })
          }
          key={index}
        >
          <span className="whitespace-nowrap">
            {type === "flavor"
              ? (
                  (option as ContentFlavourItemDocument)
                    .flavour as FlavourDocument
                ).name
              : (
                  (option as ContentUpgradeItemDocument)
                    .upgrade as UpgradeDocument
                ).label}
          </span>
          <span className="text-sm">
            {option.price === 0 ? (
              "Free"
            ) : (
              <>
                {INRSymbol} {option.price}
              </>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
