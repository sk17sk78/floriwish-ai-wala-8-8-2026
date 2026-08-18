import { AdminRolePermissionDocument } from "@/common/types/documentation/nestedDocuments/adminRolePermission";
import { PermissionDocument } from "@/common/types/documentation/nestedDocuments/permission";

const permission = {
  create: false,
  read: false,
  update: false,
  delete: false
} as PermissionDocument;

// configs — matches sectionName "configs" (Configurations) in SIDEBAR_SECTIONS
const configsCustomPermission = {
  advancePayment: permission,
  balloonColorGroup: permission,
  cancellationPolicy: permission,
  careInfo: permission,
  city: permission,
  color: permission,
  coupon: permission,
  deliveryDetail: permission,
  deliveryType: permission,
  enhancement: permission,
  faqGroup: permission,
  label: permission,
  processingTime: permission,
  promotionTag: permission,
  reviewGroup: permission,
  state: permission,
  unit: permission
};

const configsPermission = {
  isCustomized: false,
  all: permission,
  custom: configsCustomPermission
};

// media — matches sectionName "media"
const mediaCustomPermission = {
  image: permission,
  customizationImage: permission,
  identificationImage: permission,
  issueImage: permission,
  reviewImage: permission
};

const mediaPermission = {
  isCustomized: false,
  all: permission,
  custom: mediaCustomPermission
};

// product — matches sectionName "product" (Product & Addons)
const productCustomPermission = {
  products: permission,
  customerReviews: permission,
  addon: permission,
  categoryaddon: permission
};

const productPermission = {
  isCustomized: false,
  all: permission,
  custom: productCustomPermission
};

// category — matches sectionName "category" (Category Page)
const categoryCustomPermission = {
  categoryBanners: permission,
  category1: permission,
  category2: permission,
  category3: permission,
  category4: permission,
  category5: permission,
  catalogue: permission
};

const categoryPermission = {
  isCustomized: false,
  all: permission,
  custom: categoryCustomPermission
};

// pages — matches sectionName "pages" (Website Pages)
const pagesCustomPermission = {
  homepage: permission,
  homepageManagement: permission,
  smallPages: permission,
  sitemaps: permission
};

const pagesPermission = {
  isCustomized: false,
  all: permission,
  custom: pagesCustomPermission
};

// order — matches sectionName "order" (Users & Payments)
const orderCustomPermission = {
  customer: permission,
  new: permission,
  inProgress: permission,
  delivered: permission,
  failed: permission,
  cancelled: permission
};

const orderPermission = {
  isCustomized: false,
  all: permission,
  custom: orderCustomPermission
};

// blog — matches sectionName "blog" (Blogs)
const blogCustomPermission = {
  article: permission,
  author: permission,
  category: permission,
  tag: permission
};

const blogPermission = {
  isCustomized: false,
  all: permission,
  custom: blogCustomPermission
};

// mobilecatgories — matches sectionName "mobileCatgories" (Mobile Categories)
const mobilecatgoriesCustomPermission = {
  cataCategory: permission
};

const mobilecatgoriesPermission = {
  isCustomized: false,
  all: permission,
  custom: mobilecatgoriesCustomPermission
};

// settings — matches sectionName "settings" (Miscellaneous)
const settingsCustomPermission = {
  health: permission,
  reset: permission,
  gmc: permission
};

const settingsPermission = {
  isCustomized: false,
  all: permission,
  custom: settingsCustomPermission
};

// support — matches sectionName "support" (Customer Support)
const supportCustomPermission = {
  supportMessage: permission
};

const supportPermission = {
  isCustomized: false,
  all: permission,
  custom: supportCustomPermission
};

// registrations — matches sectionName "registrations" (Registrations)
const registrationsCustomPermission = {
  vendorRegistration: permission,
  franchiseEnquiry: permission
};

const registrationsPermission = {
  isCustomized: false,
  all: permission,
  custom: registrationsCustomPermission
};

// notifications — matches sectionName "notifications" (Push Notifications, no sub-sections)
const notificationsPermission = {
  isCustomized: false,
  all: permission,
  custom: {}
};

export const allAdminRolePermission = {
  configs: configsPermission,
  media: mediaPermission,
  product: productPermission,
  category: categoryPermission,
  pages: pagesPermission,
  order: orderPermission,
  blog: blogPermission,
  mobilecatgories: mobilecatgoriesPermission,
  settings: settingsPermission,
  support: supportPermission,
  registrations: registrationsPermission,
  notifications: notificationsPermission
} as unknown as AdminRolePermissionDocument;
