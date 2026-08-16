// utils
import { toKebabCase } from "@/common/utils/case";

// hooks
import { useEffect, useState } from "react";

// components
import ContentClassification from "@/components/custom/inputs/contentClassification/ContentClassification";
import ContentMedia from "@/components/custom/inputs/contentMedia/ContentMedia";
import Input from "@/lib/Forms/Input/Input";
import Toggle from "@/lib/Forms/Toggle/Toggle";

// types
import { type ContentDocument } from "@/common/types/documentation/contents/content";

export default function ContentTableFormFields({
  initialDocument,
  isSuperAdmin
}: {
  initialDocument?: ContentDocument;
  isSuperAdmin?: boolean;
}) {
  // states
  const [name, setName] = useState<string>(initialDocument?.name || "");
  const [slug, setSlug] = useState<string>(initialDocument?.slug || "");
  const isEditing = Boolean(initialDocument?._id || initialDocument?.slug);
  const [redirectFrom, setRedirectFrom] = useState<string>(
    initialDocument?.redirectFrom || ""
  );

  // effects
  useEffect(() => {
    if (initialDocument) {
      setName(initialDocument?.name || "");
      setSlug(initialDocument?.slug || "");
      if (initialDocument?.redirectFrom) {
        setRedirectFrom(initialDocument?.redirectFrom);
      }
    }
  }, [initialDocument]);

  // Only auto-generate slug for new product creation if slug not manually set
  useEffect(() => {
    if (!isEditing && !initialDocument?.slug) {
      setSlug(toKebabCase(name));
    }
  }, [name, isEditing, initialDocument]);

  return (
    <section className="grid grid-cols-1 gap-4 w-[80vw] max-h-[calc(100dvh_-_200px)] overflow-y-scroll scrollbar-hide p-2 pb-20">
      <Input
        type="text"
        name="name"
        isRequired
        labelConfig={{
          label: "Name"
        }}
        customValue={{
          value: name,
          setValue: setName
        }}
        errorCheck={false}
        validCheck={false}
      />
      <Input
        type="text"
        name="slug"
        isRequired={false}
        labelConfig={{
          label: "URL (Slug)"
        }}
        customValue={{
          value: slug,
          setValue: setSlug
        }}
        placeholder={toKebabCase(name)}
        errorCheck={false}
        validCheck={false}
      />
      <ContentClassification
        name="category"
        label="Category"
        defaultValue={initialDocument?.category}
      />
      <ContentMedia
        name="media"
        label="Images"
        defaultValue={initialDocument?.media}
      />
      {/* <Toggle
        name="isBestseller"
        label="Is Bestseller"
        isActive={initialDocument?.isBestseller}
      /> */}
      {/* <Toggle
        name="isCorporate"
        label="Is Corporate"
        isActive={initialDocument?.isCorporate}
      /> */}
    </section>
  );
}
