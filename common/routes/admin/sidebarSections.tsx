import { ADMIN_ROOT_ROUTE, getSection } from "@/common/utils/admin/sidebar";
import AdminTable from "@/components/(admin)/routes/admin/admin/AdminTable";
import BlogArticleTable from "@/components/(admin)/routes/blog/article/BlogArticleTable";
import BlogAuthorTable from "@/components/(admin)/routes/blog/author/BlogAuthorTable";
import BlogCategoryTable from "@/components/(admin)/routes/blog/category/BlogCategoryTable";
import BlogTagTable from "@/components/(admin)/routes/blog/tag/BlogTagTable";
import ResetCache from "@/components/(admin)/routes/cache/reset/ResetCache";
import RevalidateCache from "@/components/(admin)/routes/cache/revalidate/ReValidateCache";
import AddonCategoryTable from "@/components/(admin)/routes/category/addon/AddonCategoryTable";
import CatalogueCategoryTable from "@/components/(admin)/routes/category/catalogue/CatalogueCategoryTable";
import ContentCategoryTable from "@/components/(admin)/routes/category/content/ContentCategoryTable";
import CategoryBannerManagement from "@/components/(admin)/routes/category/banner/CategoryBannerManagement";
import AddonTable from "@/components/(admin)/routes/content/addon/AddonTable";
import CouponTable from "@/components/(admin)/routes/content/coupon/CouponTable";
import ProductTable from "@/components/(admin)/routes/content/product/ProductTable";
import CustomerTable from "@/components/(admin)/routes/customer/customer/CustomerTable";
import CustomizationImageManagement from "@/components/(admin)/routes/media/customizationImage/CustomizationImageManagement";
import IdentificationImageManagement from "@/components/(admin)/routes/media/identificationImage/IdentificationImageManagement";
import ContentImageManagement from "@/components/(admin)/routes/media/image/ContentImageManagement";
import IssueImageManagement from "@/components/(admin)/routes/media/issueImage/IssueImageManagement";
import ReviewImageManagement from "@/components/(admin)/routes/media/reviewImage/ReviewImageManagement";
import CustomerReviewManagement from "@/components/(admin)/routes/customerReviews/CustomerReviewManagement";
import CancelledOrderTable from "@/components/(admin)/routes/order/orderCancelled/CancelledOrderTable";
import DeliveredOrderTable from "@/components/(admin)/routes/order/orderDelivered/DeliveredOrderTable";
import FailedOrderTable from "@/components/(admin)/routes/order/orderFailed/FailedOrderTable";
import OrderInProgressTable from "@/components/(admin)/routes/order/orderInProgress/OrderInProgressTable";
import NewOrderTable from "@/components/(admin)/routes/order/orderNew/NewOrderTable";
import DynamicPageTable from "@/components/(admin)/routes/page/dynamic-page/DynamicPageTable";
import HomepageManagement from "@/components/(admin)/routes/page/homepage/HomepageManagement";
import HomepageStudio from "@/components/(admin)/routes/page/homepage/HomepageStudio";
import SubTopicTable from "@/components/(admin)/routes/page/subTopic/SubTopicTable";
import TopicTable from "@/components/(admin)/routes/page/topic/TopicTable";
import AdvancePaymentTable from "@/components/(admin)/routes/preset/advancePayment/AdvancePaymentTable";
import AdminRoleTable from "@/components/(admin)/routes/admin/adminRole/AdminRoleTable";
import BalloonColorGroupTable from "@/components/(admin)/routes/preset/balloonColor/BalloonColorGroupTable";
import CancellationPolicyTable from "@/components/(admin)/routes/preset/cancellationPolicy/CancellationPolicyTable";
import CareInfoTable from "@/components/(admin)/routes/preset/careInfo/CareInfoTable";
import CityTable from "@/components/(admin)/routes/preset/city/CityTable";
import ColorTable from "@/components/(admin)/routes/preset/color/ColorTable";
import CatalogueTable from "@/components/(admin)/routes/preset/catalogue/CatalogueTable";
import DeliveryDetailTable from "@/components/(admin)/routes/preset/deliveryDetail/DeliveryDetailTable";
import DeliveryTypeTable from "@/components/(admin)/routes/preset/deliveryType/DeliveryTypeTable";
import EnhancementTable from "@/components/(admin)/routes/preset/enhancement/EnhancementTable";
import FAQGroupTable from "@/components/(admin)/routes/preset/faqGroup/FAQGroupTable";
import GSTTable from "@/components/(admin)/routes/preset/gst/GSTTable";
import LabelTable from "@/components/(admin)/routes/preset/label/LabelTable";
import ProcessingTimeTable from "@/components/(admin)/routes/preset/processingTime/ProcessingTimeTable";
import PromotionTagTable from "@/components/(admin)/routes/preset/promotionTag/PromotionTagTable";
import ReviewGroupTable from "@/components/(admin)/routes/preset/reviewGroup/ReviewGroupTable";
import StateTable from "@/components/(admin)/routes/preset/state/StateTable";
import UnitTable from "@/components/(admin)/routes/preset/unit/UnitTable";
import VendorRequestTable from "@/components/(admin)/routes/vendor/vendorRequest/VendorRequestTable";
import VendorRegistrations from "@/components/(admin)/routes/registrations/VendorRegistrations";
import FranchiseEnquiries from "@/components/(admin)/routes/registrations/FranchiseEnquiries";
import SupportMessages from "@/components/(admin)/routes/registrations/SupportMessages";
import SupportMessageLabel from "@/components/(admin)/sidebar/support/SupportMessageLabel";
import PushNotificationManagement from "@/components/(admin)/routes/notification/PushNotificationManagement";
import SystemHealthMonitor from "@/components/(admin)/routes/systemHealth/SystemHealthMonitor";
import { Activity, AlignVerticalJustifyEnd, Bell, Box, ClipboardList, Cog, Combine, Grip, Images, IndianRupee, Proportions, Settings, Settings2, Shapes, ShieldCheck, ShoppingBasket, Type } from "lucide-react";

// labels
import CustomerLabel from "@/components/(admin)/sidebar/customer/CustomerLabel";
import CancelledOrderLabel from "@/components/(admin)/sidebar/order/CancelledOrderLabel";
import DeliveredOrderLabel from "@/components/(admin)/sidebar/order/DeliveredOrderLabel";
import FailedOrderLabel from "@/components/(admin)/sidebar/order/FailedOrderLabel";
import InProgressOrderLabel from "@/components/(admin)/sidebar/order/InProgressOrderLabel";
import NewOrderLabel from "@/components/(admin)/sidebar/order/NewOrderLabel";
import VendorRequestLabel from "@/components/(admin)/sidebar/vendor/VendorRequestLabel";

// types
import { type AdminPanelSection } from "@/common/types/layouts/admin/adminPanelLayout";
import AdminDashboard from "@/components/(admin)/dashboard/AdminDashboard";
import GMC from "@/components/(admin)/routes/gmc/GMC";
import SubSubSubTopicTable from "@/components/(admin)/routes/page/subSubSubTopic/SubSubSubTopicTable";
import SubSubTopicTable from "@/components/(admin)/routes/page/subSubTopic/SubSubTopicTable";
import SystemHealth from "@/components/(admin)/routes/system/SystemHealth";

export const SIDEBAR_SECTIONS: AdminPanelSection[] = [
  // Dashboard ---------------------------
  {
    sectionName: "dashboard",
    sectionLabel: "Dashboard",
    icon: (
      <Grip
        strokeWidth={1.5}
        width={20}
      />
    ),
    component: <AdminDashboard />,
    path: `/${ADMIN_ROOT_ROUTE}`
  },

  // PRESETS #############################
  getSection({
    sectionName: "configs",
    sectionLabel: "Configurations",
    icon: (
      <Settings
        strokeWidth={1.5}
        width={20}
      />
    ),
    subSections: [
      {
        sectionName: "advancePayment",
        sectionLabel: "Advance Payment",
        icon: <></>,
        component: <AdvancePaymentTable />
      },
      {
        sectionName: "balloonColorGroup",
        sectionLabel: "Balloon Color",
        icon: <></>,
        component: <BalloonColorGroupTable />
      },
      {
        sectionName: "cancellationPolicy",
        sectionLabel: "Cancellation Policy",
        icon: <></>,
        component: <CancellationPolicyTable />
      },
      {
        sectionName: "careInfo",
        sectionLabel: "Care Info",
        icon: <></>,
        component: <CareInfoTable />
      },
      {
        sectionName: "city",
        sectionLabel: "Cities",
        icon: <></>,
        component: <CityTable />
      },
      {
        sectionName: "color",
        sectionLabel: "Colors",
        icon: <></>,
        component: <ColorTable />
      },
      {
        sectionName: "coupon",
        sectionLabel: "Coupons",
        icon: <></>,
        component: <CouponTable />
      },
      {
        sectionName: "deliveryDetail",
        sectionLabel: "Delivery Detail",
        icon: <></>,
        component: <DeliveryDetailTable />
      },
      {
        sectionName: "deliveryType",
        sectionLabel: "Delivery Type",
        icon: <></>,
        component: <DeliveryTypeTable />
      },
      {
        sectionName: "enhancement",
        sectionLabel: "Enhancement",
        icon: <></>,
        component: <EnhancementTable />
      },
      {
        sectionName: "faqGroup",
        sectionLabel: "FAQ",
        icon: <></>,
        component: <FAQGroupTable />
      },
      {
        sectionName: "label",
        sectionLabel: "Labels",
        icon: <></>,
        component: <LabelTable />
      },
      {
        sectionName: "processingTime",
        sectionLabel: "Processing Time",
        icon: <></>,
        component: <ProcessingTimeTable />
      },
      {
        sectionName: "promotionTag",
        sectionLabel: "Promotion Tag",
        icon: <></>,
        component: <PromotionTagTable />
      },
      {
        sectionName: "reviewGroup",
        sectionLabel: "Reviews",
        icon: <></>,
        component: <ReviewGroupTable />
      },
      {
        sectionName: "state",
        sectionLabel: "States",
        icon: <></>,
        component: <StateTable />
      },
      {
        sectionName: "unit",
        sectionLabel: "Units",
        icon: <></>,
        component: <UnitTable />
      },
    ]
  }),

  // Media -------------------
  getSection({
    sectionName: "media",
    sectionLabel: "Media",
    icon: (
      <Images
        strokeWidth={1.5}
        width={20}
      />
    ),
    subSections: [
      {
        sectionName: "image",
        sectionLabel: "Images",
        icon: <></>,
        component: <ContentImageManagement />
      },
      {
        sectionName: "customizationImage",
        sectionLabel: "Customization Image",
        icon: <></>,
        component: <CustomizationImageManagement />
      },
      {
        sectionName: "identificationImage",
        sectionLabel: "Identification Image",
        icon: <></>,
        component: <IdentificationImageManagement />
      },
      {
        sectionName: "issueImage",
        sectionLabel: "Issue Image",
        icon: <></>,
        component: <IssueImageManagement />
      },
      {
        sectionName: "reviewImage",
        sectionLabel: "Review Image",
        icon: <></>,
        component: <ReviewImageManagement />
      }
    ]
  }),

  // PRODUCT PAGE #############################
  getSection({
    sectionName: "product",
    sectionLabel: "Product & Addons",
    icon: (
      <Box
        strokeWidth={1.5}
        width={20}
      />
    ),
    subSections: [
      {
        sectionName: "products",
        sectionLabel: "Products",
        icon: <></>,
        component: <ProductTable />
      },
      {
        sectionName: "customerReviews",
        sectionLabel: "Customer Reviews",
        icon: <></>,
        component: <CustomerReviewManagement />
      },
      {
        sectionName: "addon",
        sectionLabel: "Addons",
        icon: <></>,
        component: <AddonTable />
      },
      {
        sectionName: "categoryaddon",
        sectionLabel: "Addon Category",
        icon: <></>,
        component: <AddonCategoryTable />
      },
    ]
  }),

  // CATEGORY PAGE #############################
  getSection({
    sectionName: "category",
    sectionLabel: "Category Page",
    icon: (
      <AlignVerticalJustifyEnd
        strokeWidth={1.5}
        width={20}
      />
    ),
    subSections: [
      {
        sectionName: "categoryBanners",
        sectionLabel: "Category Banners",
        icon: <></>,
        component: <CategoryBannerManagement />
      },
      {
        sectionName: "category1",
        sectionLabel: "Category 1",
        icon: <></>,
        component: <ContentCategoryTable />
      },
      {
        sectionName: "category2",
        sectionLabel: "Category 2",
        icon: <></>,
        component: <TopicTable />
      },
      {
        sectionName: "category3",
        sectionLabel: "Category 3",
        icon: <></>,
        component: <SubTopicTable />
      },
      {
        sectionName: "category4",
        sectionLabel: "Category 4",
        icon: <></>,
        component: <SubSubTopicTable />
      },
      {
        sectionName: "category5",
        sectionLabel: "Category 5",
        icon: <></>,
        component: <SubSubSubTopicTable />
      },
      {
        sectionName: "catalogue",
        sectionLabel: "Mobile Navbar Categories",
        icon: <></>,
        component: <CatalogueTable />
      },
    ]
  }),


  // OTHER SMALL PAGES #############################
  getSection({
    sectionName: "pages",
    sectionLabel: "Website Pages",
    icon: (
      <Proportions
        strokeWidth={1.5}
        width={20}
      />
    ),
    subSections: [
      {
        sectionName: "homepage",
        sectionLabel: "Home Page",
        icon: <></>,
        component: <HomepageManagement />
      },
      {
        sectionName: "homepageManagement",
        sectionLabel: "Homepage Settings",
        icon: <></>,
        component: <HomepageStudio />
      },
      {
        sectionName: "smallPages",
        sectionLabel: "Smaller Pages",
        icon: <></>,
        component: <DynamicPageTable />
      },
      {
        sectionName: "sitemaps",
        sectionLabel: "Sitemaps",
        icon: <></>,
        component: <RevalidateCache />
      }
    ]
  }),

  // Users & Payments --------------------------
  getSection({
    sectionName: "order",
    sectionLabel: "Users & Payments",
    icon: (
      <IndianRupee
        strokeWidth={1.5}
        width={20}
      />
    ),
    subSections: [
      {
        sectionName: "customer",
        sectionLabel: <CustomerLabel />,
        icon: <></>,
        component: <CustomerTable />
      },
      {
        sectionName: "new",
        sectionLabel: <NewOrderLabel />,
        icon: <></>,
        component: <NewOrderTable />
      },
      {
        sectionName: "inProgress",
        sectionLabel: <InProgressOrderLabel />,
        icon: <></>,
        component: <OrderInProgressTable />
      },
      {
        sectionName: "delivered",
        sectionLabel: <DeliveredOrderLabel />,
        icon: <></>,
        component: <DeliveredOrderTable />
      },
      {
        sectionName: "failed",
        sectionLabel: <FailedOrderLabel />,
        icon: <></>,
        component: <FailedOrderTable />
      },
      {
        sectionName: "cancelled",
        sectionLabel: <CancelledOrderLabel />,
        icon: <></>,
        component: <CancelledOrderTable />
      },
    ]
  }),

  // Blogs --------------------------
  getSection({
    sectionName: "blog",
    sectionLabel: "Blogs",
    icon: (
      <Type
        strokeWidth={1.5}
        width={20}
      />
    ),
    subSections: [
      {
        sectionName: "article",
        sectionLabel: "All Blogs",
        icon: <></>,
        component: <BlogArticleTable />
      },
      {
        sectionName: "author",
        sectionLabel: "Authors",
        icon: <></>,
        component: <BlogAuthorTable />
      },
      {
        sectionName: "category",
        sectionLabel: "Blog Category",
        icon: <></>,
        component: <BlogCategoryTable />
      },
      {
        sectionName: "tag",
        sectionLabel: "Blog Tags",
        icon: <></>,
        component: <BlogTagTable />
      }
    ]
  }),

  // Mobile Categories --------------------------
  getSection({
    sectionName: "mobileCatgories",
    sectionLabel: "Mobile Categories",
    icon: (
      <Shapes
        strokeWidth={1.5}
        width={20}
      />
    ),
    subSections: [
      {
        sectionName: "cataCategory",
        sectionLabel: "Mobile Category Groups",
        icon: <></>,
        component: <CatalogueCategoryTable />
      },
    ]
  }),

  // Miscellaneous --------------------------
  getSection({
    sectionName: "settings",
    sectionLabel: "Miscellaneous",
    icon: (
      <Settings2
        strokeWidth={1.5}
        width={20}
      />
    ),
    subSections: [
      {
        sectionName: "health",
        sectionLabel: "System Health",
        icon: <></>,
        component: <SystemHealthMonitor />
      },
      {
        sectionName: "reset",
        sectionLabel: "Full Reset",
        icon: <></>,
        component: <ResetCache />
      },
      {
        sectionName: "gmc",
        sectionLabel: "Merchant Centre Products",
        icon: <></>,
        component: <GMC />
      },
    ]
  }),

  // Staff Management ---------------------------
  getSection({
    sectionName: "staff",
    sectionLabel: "Staff Management",
    icon: (
      <ShieldCheck
        strokeWidth={1.5}
        width={20}
      />
    ),
    subSections: [
      {
        sectionName: "admin",
        sectionLabel: "Admins",
        icon: <></>,
        component: <AdminTable />
      },
      {
        sectionName: "adminRole",
        sectionLabel: "Admin Roles",
        icon: <></>,
        component: <AdminRoleTable />
      },
    ]
  }),

  // Customer Support ---------------------------
  getSection({
    sectionName: "support",
    sectionLabel: "Customer Support",
    icon: (
      <ShoppingBasket
        strokeWidth={1.5}
        width={20}
      />
    ),
    subSections: [
      {
        sectionName: "supportMessage",
        sectionLabel: <SupportMessageLabel />,
        icon: <></>,
        component: <SupportMessages />
      }
    ]
  }),

  // Registrations / Leads ---------------------------
  getSection({
    sectionName: "registrations",
    sectionLabel: "Registrations",
    icon: (
      <ClipboardList
        strokeWidth={1.5}
        width={20}
      />
    ),
    subSections: [
      {
        sectionName: "vendorRegistration",
        sectionLabel: "Vendor Registrations",
        icon: <></>,
        component: <VendorRegistrations />
      },
      {
        sectionName: "franchiseEnquiry",
        sectionLabel: "Franchise Enquiries",
        icon: <></>,
        component: <FranchiseEnquiries />
      }
    ]
  }),

  // Push Notifications ---------------------------
  getSection({
    sectionName: "notifications",
    sectionLabel: "Push Notifications",
    icon: (
      <Bell
        strokeWidth={1.5}
        width={20}
      />
    ),
    component: <PushNotificationManagement />
  }),
];
