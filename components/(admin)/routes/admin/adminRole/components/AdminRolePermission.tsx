// utils
import { camelToTitleCase } from "@/common/utils/case";

// Human-readable labels for section keys
const SECTION_LABELS: Record<string, string> = {
  configs: "Configurations",
  media: "Media",
  product: "Product & Addons",
  category: "Category Page",
  pages: "Website Pages",
  order: "Users & Payments",
  blog: "Blogs",
  mobilecatgories: "Mobile Categories",
  settings: "Miscellaneous",
  support: "Customer Support",
  registrations: "Registrations",
  notifications: "Push Notifications",
  // sub-section labels
  advancePayment: "Advance Payment",
  balloonColorGroup: "Balloon Color",
  cancellationPolicy: "Cancellation Policy",
  careInfo: "Care Info",
  city: "Cities",
  color: "Colors",
  coupon: "Coupons",
  deliveryDetail: "Delivery Detail",
  deliveryType: "Delivery Type",
  enhancement: "Enhancement",
  faqGroup: "FAQ",
  label: "Labels",
  processingTime: "Processing Time",
  promotionTag: "Promotion Tag",
  reviewGroup: "Reviews",
  state: "States",
  unit: "Units",
  image: "Images",
  customizationImage: "Customization Image",
  identificationImage: "Identification Image",
  issueImage: "Issue Image",
  reviewImage: "Review Image",
  products: "Products",
  customerReviews: "Customer Reviews",
  addon: "Addons",
  categoryaddon: "Addon Category",
  categoryBanners: "Category Banners",
  category1: "Category 1",
  category2: "Category 2",
  category3: "Category 3",
  category4: "Category 4",
  category5: "Category 5",
  catalogue: "Mobile Navbar Categories",
  homepage: "Home Page",
  homepageManagement: "Homepage Settings",
  smallPages: "Smaller Pages",
  sitemaps: "Sitemaps",
  customer: "Customers",
  new: "New Orders",
  inProgress: "In Progress Orders",
  delivered: "Delivered Orders",
  failed: "Failed Orders",
  cancelled: "Cancelled Orders",
  article: "All Blogs",
  author: "Authors",
  tag: "Blog Tags",
  cataCategory: "Mobile Category Groups",
  health: "System Health",
  reset: "Full Reset",
  gmc: "Merchant Centre Products",
  supportMessage: "Support Messages",
  vendorRegistration: "Vendor Registrations",
  franchiseEnquiry: "Franchise Enquiries"
};

const getSectionLabel = (key: string): string =>
  SECTION_LABELS[key] || camelToTitleCase(key);

// types
import { type PermissionDocument } from "@/common/types/documentation/nestedDocuments/permission";

export default function AdminRolePermission(
  props: {
    permissionKey: string;
    position?: "top" | "bottom";
    permission: PermissionDocument;
    onChangePermission: (newPermission: PermissionDocument) => void;
  } & (
    | {
        isSection?: undefined;
      }
    | {
        isSection?: boolean;
        isCustomized?: boolean;
        toggleShowSectionItems: () => void;
      }
  )
) {
  const {
    permissionKey,
    isSection,
    position,
    permission: { create: c, read: r, update: u, delete: d },
    onChangePermission
  } = props;

  const handleChangePermission = (
    c: boolean,
    r: boolean,
    u: boolean,
    d: boolean
  ) => {
    onChangePermission({
      create: c,
      read: r,
      update: u,
      delete: d
    } as PermissionDocument);
  };

  const isCreateOnly = Boolean(c && r && !u && !d);

  return (
    <>
      <span
        className={`grid place-items-center ${isSection ? "py-2.5 bg-rose-100 border border-r-0 border-rose-200 rounded-l-lg cursor-pointer" : position === "top" ? "pt-2 pb-1" : position === "bottom" ? "pt-1 pb-2" : "py-1"}`}
      >
        <input
          type="checkbox"
          checked={(isSection && props.isCustomized) || c || r || u || d}
          onChange={() => {
            if (c || r || u || d) {
              handleChangePermission(false, false, false, false);
            } else {
              handleChangePermission(true, true, true, true);
            }
          }}
          className={`${isSection ? "h-5 w-5" : "w-4 h-4"} accent-rose-500 cursor-pointer`}
        />
      </span>
      <span
        className={`flex items-center justify-between pr-2 ${isSection ? "py-2.5 bg-rose-100 border border-x-0 border-rose-200 text-lg font-medium cursor-pointer" : position === "top" ? "pt-2 pb-1" : position === "bottom" ? "pt-1 pb-2" : "py-1"}`}
      >
        <span
          className="truncate"
          onClick={isSection ? props.toggleShowSectionItems : undefined}
        >
          {getSectionLabel(permissionKey)}
        </span>
        {isSection && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isCreateOnly) {
                handleChangePermission(false, false, false, false);
              } else {
                handleChangePermission(true, true, false, false);
              }
            }}
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-all border cursor-pointer ${
              isCreateOnly
                ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                : "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            }`}
            title="Set Only Create (can create items, cannot edit or delete)"
          >
            {isCreateOnly ? "✓ Only Create" : "+ Only Create"}
          </button>
        )}
      </span>
      <span
        className={` grid place-items-center  ${isSection ? "py-2.5 bg-rose-100 border border-x-0 border-rose-200 cursor-pointer" : position === "top" ? "pt-2 pb-1" : position === "bottom" ? "pt-1 pb-2" : "py-1"}`}
      >
        <input
          type="checkbox"
          checked={c}
          onChange={() => {
            handleChangePermission(!c, !c || r, u, d);
          }}
          className={`${isSection ? "h-5 w-5" : "w-4 h-4"} accent-rose-500 cursor-pointer`}
        />
      </span>
      <span
        className={` grid place-items-center  ${isSection ? "py-2.5 bg-rose-100 border border-x-0 border-rose-200 cursor-pointer" : position === "top" ? "pt-2 pb-1" : position === "bottom" ? "pt-1 pb-2" : "py-1"}`}
      >
        <input
          type="checkbox"
          checked={r}
          onChange={() => {
            handleChangePermission(
              !r ? c : false,
              !r,
              !r ? u : false,
              !r ? d : false
            );
          }}
          className={`${isSection ? "h-5 w-5" : "w-4 h-4"} accent-rose-500 cursor-pointer`}
        />
      </span>
      <span
        className={` grid place-items-center ${isSection ? "py-2.5 bg-rose-100 border border-x-0 border-rose-200 cursor-pointer" : position === "top" ? "pt-2 pb-1" : position === "bottom" ? "pt-1 pb-2" : "py-1"}`}
      >
        <input
          type="checkbox"
          checked={u}
          onChange={() => {
            handleChangePermission(c, !u || r, !u, d);
          }}
          className={`${isSection ? "h-5 w-5" : "w-4 h-4"} accent-rose-500 cursor-pointer`}
        />
      </span>
      <span
        className={` grid place-items-center ${isSection ? "py-2.5 bg-rose-100 border border-l-0 border-rose-200 rounded-r-lg cursor-pointer" : position === "top" ? "pt-2 pb-1" : position === "bottom" ? "pt-1 pb-2" : "py-1"}`}
      >
        <input
          type="checkbox"
          checked={d}
          onChange={() => {
            handleChangePermission(c, !d || r, u, !d);
          }}
          className={`${isSection ? "h-5 w-5" : "w-4 h-4"} accent-rose-500 cursor-pointer`}
        />
      </span>
    </>
  );
}
