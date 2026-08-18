// libraries
import moment from "moment";

// components
import OrderDetailsDialog from "../../components/OrderDetailsDialog";
import PaymentStatus from "../../components/PaymentStatus";

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
          const cartItemsLength = cart?.items?.length || 0;
          const customer = customers.find(({ _id }) => String(_id) === String(cart?.customer));

          return (
            cart?.items?.map(
              (
                {
                  _id: cartItemId,
                  status,
                  content: contentId,
                  customVariant,
                  delivery
                },
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
                          <PaymentStatus
                            orderId={String(_id)}
                            payment={payment}
                            status={payment.status}
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
                          let cityValue = cart?.checkout?.location?.city || (cart?.checkout as any)?.city || (delivery as any)?.city;
                          if (!cityValue && customer?.addresses?.length) {
                            const matchingAddress = cart?.checkout?.location?.pincode
                              ? customer.addresses.find((addr) => addr.pincode === cart.checkout?.location?.pincode)
                              : customer.addresses[0];
                            cityValue = matchingAddress?.city;
                          }
                          if (!cityValue) return "-";
                          const cityDoc = cities.find(
                            ({ _id, name }) =>
                              String(_id) === String(cityValue) ||
                              name?.toLowerCase() === String(cityValue).toLowerCase() ||
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
