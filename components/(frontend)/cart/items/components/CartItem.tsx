// constants
import { DOMAIN } from "@/common/constants/environmentVariables";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";

// utils
import { getCustomVariant } from "@/hooks/useOptimizedCart/utils/getCustomVariant";

// hooks
import { useState } from "react";
import { useAppStates } from "@/hooks/useAppState/useAppState";

// components
import CartItemAction from "./CartItemAction";
import CartItemAddons from "./CartItemAddons";
import CartItemAddonSuggestions from "./CartItemAddonSuggestions";
import CartItemConfirmDelete from "./CartItemConfirmDelete";
import CartItemCustomization from "./CartItemCustomization";
import CartItemDeliveryDateTime from "./CartItemDeliveryDateTime";
import CartItemImage from "./CartItemImage";
import CartItemInstruction from "./CartItemInstruction";
import CartItemName from "./CartItemName";
import CartItemPrice from "./CartItemPrice";
import CartItemUploadedText from "./CartItemUploadedText";

// types
import { type CartItemDocument } from "@/common/types/documentation/nestedDocuments/cartItem";
import { type CartItemAddonDocument } from "@/common/types/documentation/nestedDocuments/cartItemAddon";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentDeliveryDocument } from "@/common/types/documentation/nestedDocuments/contentDelivery";
import { type DeliveryTypeDocument } from "@/common/types/documentation/presets/deliveryType";
import { type EdibleDocument } from "@/common/types/documentation/nestedDocuments/edible";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type TimeSlotDocument } from "@/common/types/documentation/nestedDocuments/timeSlot";

export default function CartItem({
  item,
  validationTriggered,
  onChangeItem,
  onDeleteItem
}: {
  item: CartItemDocument;
  validationTriggered: boolean;
  onChangeItem: (item: CartItemDocument) => void;
  onDeleteItem: (itemId: string) => void;
}) {
  // hooks
  const {
    location: {
      data: { selectedCity }
    }
  } = useAppStates();

  //   states
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  // variables
  const content = item.content as ContentDocument;

  const customVariant = item.customVariant
    ? getCustomVariant({ content, variantId: item.customVariant })
    : undefined;

  const name = customVariant?.name || content.name;

  const imageUrl =
    customVariant?.image?.url || (content.media.primary as ImageDocument)?.url || "";

  const path = `${DOMAIN}${content.type === "product" ? FRONTEND_LINKS.PRODUCT_PAGE : FRONTEND_LINKS.SERVICE_PAGE}/${content.slug}`;

  const cityPrice = content?.price?.cities?.find(
    ({ city }) => String(city) === String(selectedCity?._id)
  ) || content?.price?.base;

  const itemPrice = item.pricePerUnit * item.quantity;
  const itemMRP =
    ((customVariant?.price as any)?.mrp ||
      cityPrice?.mrp ||
      (item as any)?.mrp ||
      0) * item.quantity;

  // event handlers
  const handleChangeQuantity = (quantity: number) => {
    onChangeItem({
      ...item,
      quantity
    } as CartItemDocument);
  };

  const handleChangeDate = (date: Date) => {
    onChangeItem({
      ...item,
      delivery: {
        ...item.delivery,
        date: date.toISOString()
      }
    } as CartItemDocument);
  };

  const handleChangeTime = (
    type: DeliveryTypeDocument,
    slot: TimeSlotDocument
  ) => {
    onChangeItem({
      ...item,
      delivery: {
        ...item.delivery,
        type,
        slot
      }
    } as CartItemDocument);
  };

  const handleChangeAddons = (addons: CartItemAddonDocument[]) => {
    onChangeItem({
      ...item,
      addons
    } as CartItemDocument);
  };

  const handleChangeInstruction = (instruction: string) => {
    onChangeItem({
      ...item,
      instruction
    } as CartItemDocument);
  };

  const handleDelete = () => {
    setIsDeleted(true);

    setTimeout(() => {
      onDeleteItem(String(item._id));
    }, 450);
  };

  return (
    <>
      <section
        className={`bg-white rounded-2xl border border-charcoal-3/10 shadow-sm overflow-hidden mb-4 transition-all duration-300 ${isDeleted ? "scale-0 opacity-0 h-0" : "opacity-100"}`}
      >
        <div className="relative p-4 sm:p-5">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 sm:gap-x-6 gap-y-4 sm:gap-y-0">
            {/* Product Image */}
            <div className="col-start-1 row-start-1">
              <CartItemImage
                contentName={name}
                contentPath={path}
                imageUrl={imageUrl}
                contentEdible={content.edible as EdibleDocument}
              />
            </div>

            {/* Product Info */}
            <div className="col-start-2 row-start-1 flex flex-col min-w-0 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-2 gap-2 sm:gap-0">
                <div className="pr-6 sm:pr-8 w-full">
                  <CartItemName name={name} />
                  <div className="hidden sm:block mt-1">
                    <CartItemPrice price={itemPrice} mrp={itemMRP} />
                  </div>
                </div>
                
                <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto mt-1 sm:mt-0">
                  <div className="sm:hidden">
                    <CartItemPrice price={itemPrice} mrp={itemMRP} />
                  </div>

                  <CartItemAction
                    showDelete={showDelete}
                    quantity={item.quantity}
                    onChangeShowDelete={setShowDelete}
                    onChangeQuantity={handleChangeQuantity}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Selectors */}
            <div className="col-span-2 sm:col-span-2 w-full mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-zinc-100">
              <CartItemDeliveryDateTime
                isAvailableInAllIndia={
                  content.availability!.availableAt === "all-india"
                }
                date={new Date(item.delivery.date)}
                deliveryType={item.delivery.type as DeliveryTypeDocument}
                timeSlot={item.delivery.slot as TimeSlotDocument}
                contentDelivery={content.delivery as ContentDeliveryDocument}
                validationTriggered={validationTriggered}
                onChangeDate={handleChangeDate}
                onChangeTime={handleChangeTime}
              />
              
              <CartItemCustomization customization={item.customization!} />
              {Boolean(item?.customization?.uploadedText?.text) && (
                <CartItemUploadedText
                  text={item.customization!.uploadedText!.text}
                />
              )}
            </div>
          </div>

          <CartItemAddons
            addons={item.addons!}
            onChangeAddons={handleChangeAddons}
          />

          {/* Delete Confirmation Overlay */}
          {showDelete && (
            <CartItemConfirmDelete
              onConfirm={handleDelete}
              onCancel={() => {
                setShowDelete(false);
              }}
            />
          )}
        </div>

        {/* Instruction Area */}
        <CartItemInstruction
          instruction={item.instruction}
          onChangeInstruction={handleChangeInstruction}
        />
      </section>
    </>
  );
}
