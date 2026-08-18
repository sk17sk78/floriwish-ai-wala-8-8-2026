// libraries
import moment from "moment";

// components
import OrderDetailsDialog from "../../components/OrderDetailsDialog";
import OrderStatus from "@/components/(admin)/routes/order/components/OrderStatus";

// types
import { type AdminTableData } from "@/common/types/layouts/admin/adminTableLayout";
import { type CartDocument } from "@/common/types/documentation/dynamic/cart";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type CustomerDocument } from "@/common/types/documentation/users/customer";
import { type OrderDocument } from "@/common/types/documentation/dynamic/order";
import { type CityDocument } from "@/common/types/documentation/presets/city";
import { type PermissionDocument } from "@/common/types/documentation/nestedDocuments/permission";
import { type TableContent } from "@/components/(_common)/TableLayout/TableContent";

const getTableContentGenerator =
  ({
    permission,
    carts,
    customers,
    contents,
    cities
  }: {
    permission?: PermissionDocument;
    carts: CartDocument[];
    customers: CustomerDocument[];
    contents: ContentDocument[];
    cities: CityDocument[];
  }) =>
    ({
      documents,
      state: {
        pagination: { offset },
        query: { sortBy, orderBy },
        trash: { showTrash }
      },
      method: { onUpdate, onUpdateDocument, onTrash, onRestore, onDelete, onSort }
    }: AdminTableData<OrderDocument>): TableContent => ({
      header: [
        {
          label: "Content\u00A0Name",
          span: 3,
          sortable: false,
          align: "left"
        },
        {
          label: "Customer\u00A0Name",
          span: 1.8,
          sortable: false,
          align: "left"
        },
        {
          label: "Placed\u00A0On",
          span: 1.8,
          sortable: false,
          align: "left"
        },
        {
          label: "Delivery/Event\u00A0On",
          span: 1.4,
          sortable: false,
          align: "left"
        },
        {
          label: "Amount",
          span: 1.4,
          sortable: false,
          align: "center"
        },
        {
          label: "Details",
          span: 0.7,
          sortable: false,
          align: "center"
        },
        {
          label: "Status",
          span: 1.8,
          sortable: false,
          align: "center"
        },
        {
          label: "City",
          span: 1.2,
          sortable: false,
          align: "left"
        }
      ],

      data: documents.flatMap(
        ({
          _id,
          id: orderId,
          payment,
          cart: cartId,
          deliveries,
          createdBy,
          createdAt,
          updatedBy,
          updatedAt
        }) => {
          const cart = carts.find(({ _id }) => String(_id) === String(cartId)) as CartDocument;
          const cartItemsLength =
            cart?.items?.filter(({ status }) => status === "new")?.length || 0;
          const customer = customers.find(({ _id }) => String(_id) === String(cart?.customer));

          return (
            cart?.items
              ?.filter(({ status }) => status === "new")
              ?.map(
                (
                  { _id: cartItemId, content: contentId, status, delivery },
                  i
                ) => {
                  const rawContentId =
                    typeof contentId === "object" && contentId !== null
                      ? (contentId as any)._id
                      : contentId;
                  const embeddedName =
                    typeof contentId === "object" && contentId !== null
                      ? (contentId as any).name
                      : (delivery as any)?.name;
                  const contentDoc = contents.find(
                    ({ _id }) =>
                      String(_id) === String(rawContentId) ||
                      String(_id) === String(contentId)
                  );
                  const contentName =
                    contentDoc?.name || embeddedName || "-";

                  // Extract City
                  let cityDisplay = "-";
                  const checkoutCity =
                    cart?.checkout?.location?.city ||
                    (cart?.checkout as any)?.city ||
                    (delivery as any)?.city;
                  const defaultAddress =
                    customer?.addresses?.find((addr) => addr.isDefault) ||
                    customer?.addresses?.[0];
                  const addressCity = defaultAddress?.city;
                  const rawCity = checkoutCity || addressCity || (customer as any)?.city;

                  if (rawCity) {
                    const cityDoc = cities.find(
                      ({ _id, name }) =>
                        String(_id) === String(rawCity) ||
                        name?.toLowerCase() === String(rawCity).toLowerCase() ||
                        (typeof rawCity === "object" &&
                          rawCity !== null &&
                          String(_id) === String((rawCity as any)._id))
                    );
                    if (cityDoc && cityDoc.name) {
                      cityDisplay = cityDoc.name;
                    } else if (typeof rawCity === "string" && rawCity.trim()) {
                      cityDisplay = rawCity.trim();
                    } else if (
                      typeof rawCity === "object" &&
                      rawCity !== null &&
                      (rawCity as any).name
                    ) {
                      cityDisplay = (rawCity as any).name;
                    }
                  }

                  return {
                    cols: [
                      {
                        value: {
                          label: contentName,
                          type: "text"
                        },
                        action: { action: () => { }, type: "none" }
                      },
                      {
                        value: {
                          label: customer?.name || "-",
                          type: "text",
                          align: "left"
                        },
                        action: { action: () => { }, type: "none" }
                      },
                      {
                        value: {
                          label:
                            moment(createdAt).format("DD MMM YY, hh:mm A") || "-",
                          type: "text"
                        },
                        action: { action: () => { }, type: "none" }
                      },
                      {
                        value: {
                          label:
                            moment(delivery?.date).format("DD MMM YY") || "-",
                          type: "text"
                        },
                        action: { action: () => { }, type: "none" }
                      },
                      {
                        value: {
                          label:
                            `₹${cart.price.total || ""}\u00A0(${payment?.percentage || ""}%)` ||
                            "-",
                          type: "text"
                        },
                        action: { action: () => { }, type: "none" }
                      },
                      {
                        value: {
                          label: (
                            <OrderDetailsDialog
                                orderId={String(_id)}
                                itemId={String(cartItemId)}
                              />
                          ),
                          type: "svg"
                        },
                        action: { action: () => { }, type: "none" }
                      },
                      {
                        value: {
                          label: (
                            <OrderStatus
                              cartId={String(cartId)}
                              cartItems={cart.items}
                              cartItemId={String(cartItemId)}
                              status={status}
                              isDisabled={showTrash}
                            />
                          ),
                          type: "svg"
                        },
                        action: { action: () => { }, type: "none" }
                      },
                      {
                        value: {
                          label: cityDisplay,
                          type: "text"
                        },
                        action: { action: () => { }, type: "none" }
                      }
                    ],
                    batchSelectData: String(_id),
                    hoverData: undefined
                  };
                }
              ) || []
          );
        }
      ),
      offset
    });

export default getTableContentGenerator;
