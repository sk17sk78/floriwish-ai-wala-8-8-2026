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
          span: 4,
          sortable: false
        },
        {
          label: "Customer\u00A0Name",
          span: 2,
          sortable: false,
          align: "left"
        },
        {
          label: "Placed\u00A0On",
          span: 2,
          sortable: false
        },
        {
          label: "Delivery/Event\u00A0On",
          span: 2,
          sortable: false
        },
        {
          label: "Amount",
          span: 1,
          sortable: false
        },
        {
          label: "Details",
          span: 1,
          sortable: false
        },
        {
          label: "Status",
          span: 2,
          sortable: false
        },
        {
          label: "City",
          span: 1,
          sortable: false
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
                  const contentName =
                    contents.find(({ _id }) => String(_id) === String(contentId))
                      ?.name || "";

                  return {
                    cols: [
                      {
                        value: {
                          label: contentName,
                          // cartItemsLength > 1
                          //   ? `${orderId}\u2011${i + 1}`
                          //   : orderId,
                          type: "text"
                        },
                        action: { action: () => { }, type: "none" }
                      },
                      {
                        value: {
                          label: customer?.name?.replace(/\s/g, "\u00A0") || "-",
                          type: "text",
                          align: "left"
                        },
                        action: { action: () => { }, type: "none" }
                      },
                      {
                        value: {
                          label:
                            moment(createdAt)
                              .format("DD MMM YY, hh:mm A")
                              .replace(/\s/g, "\u00A0") || "-",
                          type: "text"
                        },
                        action: { action: () => { }, type: "none" }
                      },
                      {
                        value: {
                          label:
                            moment(delivery?.date)
                              .format("DD MMM YY")
                              .replace(/\s/g, "\u00A0") || "-",
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
                          label: (() => {
                            const cityValue = cart.checkout?.location?.city || (cart.checkout as any)?.city;
                            if (!cityValue) {
                              // Fallback: try to find city from customer addresses by matching pincode
                              if (customer && customer.addresses && cart.checkout?.location?.pincode) {
                                const matchingAddress = customer.addresses.find(
                                  (addr) => addr.pincode === cart.checkout?.location?.pincode
                                );
                                if (matchingAddress) {
                                  const cityDoc = cities.find(
                                    ({ _id, name }) =>
                                      String(_id) === String(matchingAddress.city) ||
                                      name === matchingAddress.city
                                  );
                                  if (cityDoc) return cityDoc.name;
                                  return matchingAddress.city;
                                }
                              }
                              return "-";
                            }
                            const cityDoc = cities.find(
                              ({ _id }) =>
                                String(_id) === String(cityValue) ||
                                (typeof cityValue === "object" &&
                                  cityValue !== null &&
                                  String(_id) === String((cityValue as any)._id))
                            );
                            if (cityDoc) return cityDoc.name;
                            if (typeof cityValue === "string") return cityValue;
                            if (typeof cityValue === "object" && cityValue !== null)
                              return (cityValue as any).name || "-";
                            return "-";
                          })(),
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
