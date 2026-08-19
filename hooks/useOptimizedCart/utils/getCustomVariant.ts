// types
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentCustomVariantCategoryDocument } from "@/common/types/documentation/nestedDocuments/contentCustomVariantCategory";
import { type ContentPriceDocument } from "@/common/types/documentation/nestedDocuments/contentPrice";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type UnitDocument } from "@/common/types/documentation/presets/unit";

export const getCustomVariant = ({
  content,
  variantId
}: {
  content?: ContentDocument | null;
  variantId?: string | null;
}): { name: string; price?: ContentPriceDocument; image?: ImageDocument } | null => {
  if (!content || !variantId || !content.variants || !Array.isArray(content.variants)) {
    return null;
  }

  const customCategoryWrapper = content.variants
    .filter((v) => v && v.type === "custom")
    .find(({ custom }) => {
      const cat = custom as ContentCustomVariantCategoryDocument | undefined;
      return cat?.variants?.some(({ _id }) => String(_id) === String(variantId));
    });

  const category = customCategoryWrapper?.custom as ContentCustomVariantCategoryDocument | undefined;
  if (!category || !Array.isArray(category.variants)) return null;

  const variant = category.variants.find(({ _id }) => String(_id) === String(variantId));
  if (!variant) return null;

  const options = category.options || ({} as any);
  const unit = options.unit ? (category.unit as UnitDocument) : null;

  return {
    name: `${content.name || ""} (${unit ? `${variant.value || ""} ${unit.abbr || ""}`.trim() : variant.label || ""})`,
    price: variant.price || (content.price as ContentPriceDocument),
    ...(options.image && variant.image ? { image: variant.image as ImageDocument } : {})
  };
};
