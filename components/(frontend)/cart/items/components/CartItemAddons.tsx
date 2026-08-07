import CartItemAddon from "./CartItemAddon";

// types
import { type CartItemAddonDocument } from "@/common/types/documentation/nestedDocuments/cartItemAddon";

export default function CartItemAddons({
  addons,
  onChangeAddons
}: {
  addons: CartItemAddonDocument[];
  onChangeAddons: (addons: CartItemAddonDocument[]) => void;
}) {
  // event handlers
  const handleChangeAddon = (updatedAddon: CartItemAddonDocument) => {
    onChangeAddons(
      [...addons].map((addon) =>
        String(addon._id) === String(updatedAddon._id) ? updatedAddon : addon
      )
    );
  };

  const handleDelete = (addonId: string) => {
    onChangeAddons(addons.filter(({ _id }) => String(_id) !== String(addonId)));
  };

  if (!addons.length) {
    return <></>;
  }

  return (
    <div className="row-start-8 col-start-1 col-span-3 flex flex-col items-stretch justify-start gap-x-5 gap-y-1 px-4 max-sm:my-3 my-2 max-sm:text-sm text-charcoal-3/50 mt-2 sm:mt-4">
      {addons.map((addon) => (
        <CartItemAddon
          key={String(addon._id)}
          addon={addon}
          onChangeAddon={handleChangeAddon}
          onDelete={() => {
            handleDelete(String(addon._id));
          }}
        />
      ))}
    </div>
  );
}
