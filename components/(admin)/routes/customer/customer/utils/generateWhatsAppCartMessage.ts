import moment from "moment";
import { type CartDocument } from "@/common/types/documentation/dynamic/cart";

export const generateWhatsAppCartMessage = ({
  cart,
  customerName,
  customerMobile,
  cityDisplay,
  addressText
}: {
  cart: CartDocument;
  customerName?: string;
  customerMobile?: string;
  cityDisplay?: string;
  addressText?: string;
}): string => {
  const domain = (
    process.env.NEXT_PUBLIC_DOMAIN ||
    process.env.NEXT_PUBLIC_URL ||
    "https://floriwish.com"
  ).replace(/\/+$/, "");

  const name = customerName || cart?.checkout?.name || "Customer";
  const items = cart?.items || [];

  let msg = `🌸 *Floriwish - Cart Summary* 🌸\n\n`;
  msg += `Hello *${name}*,\nHere are the items currently in your Floriwish cart:\n\n`;

  items.forEach((item, index) => {
    const content = item.content as any;
    const productName = content?.name || (item as any)?.name || `Item #${index + 1}`;
    const productSlug = content?.slug || "";
    const qty = item.quantity || 1;
    const price = item.pricePerUnit || 0;
    const date = item.delivery?.date ? moment(item.delivery.date).format("DD MMM YYYY") : "";
    const slot = (item.delivery?.slot as any)?.label || (typeof item.delivery?.slot === "string" ? item.delivery.slot : "");

    msg += `🛍️ *${index + 1}. ${productName}*\n`;
    msg += `   • *Qty:* ${qty}  |  *Price:* ₹${price} (Total: ₹${Number(price) * Number(qty)})\n`;

    if (date) {
      msg += `   • *Delivery Date:* ${date}${slot ? ` (${slot})` : ""}\n`;
    }

    // Customizations
    const c = item.customization;
    if (c) {
      const parts: string[] = [];
      if (c.flavour) {
        const fName = (c.flavour as any)?.flavour?.name || (c.flavour as any)?.name || "Flavour";
        parts.push(`Flavour: ${fName}`);
      }
      if (c.upgrade) {
        const uName = (c.upgrade as any)?.upgrade?.label || (c.upgrade as any)?.label || "Upgrade";
        parts.push(`Upgrade: ${uName}`);
      }
      if (c.balloonColor && c.balloonColor !== "_default_") {
        parts.push(`Balloons: ${c.balloonColor}`);
      }
      if (c.uploadedText?.text) {
        parts.push(`Message on Cake: "${c.uploadedText.text}"`);
      }
      if (parts.length > 0) {
        msg += `   • *Customization:* ${parts.join(", ")}\n`;
      }
    }

    // Addons
    if (item.addons && item.addons.length > 0) {
      const addonNames = item.addons
        .map((a: any) => {
          const aName = a?.addon?.name || a?.name || "Addon";
          return `${aName}${a.quantity > 1 ? ` (x${a.quantity})` : ""}`;
        })
        .join(", ");
      msg += `   • *Addons:* ${addonNames}\n`;
    }

    if (item.instruction) {
      msg += `   • *Note:* ${item.instruction}\n`;
    }

    if (productSlug) {
      msg += `   🔗 ${domain}/product/${productSlug}\n`;
    }

    msg += `\n`;
  });

  // Total
  const total =
    cart.price?.payable ||
    cart.price?.total ||
    Math.round(
      (Number(cart.price?.content || 0) +
        Number(cart.price?.addon || 0) +
        Number(cart.price?.customization || 0) -
        (cart.price?.couponDiscount || 0)) *
        (cart.price?.paymentPercentage || 100) /
        100
    );

  msg += `💰 *Total Payable:* ₹${total}\n`;

  if (cityDisplay) {
    msg += `📍 *City:* ${cityDisplay}\n`;
  }
  if (addressText) {
    msg += `🏠 *Delivery Address:* ${addressText}\n`;
  }

  msg += `\n👉 *Complete your order here:*\n${domain}/cart\n\n`;
  msg += `_Need help with your order? Reply to this message to chat with us directly!_ 💐`;

  return msg;
};

export const openWhatsAppCart = ({
  phone,
  message
}: {
  phone?: string;
  message: string;
}) => {
  let targetPhone = (phone || "").replace(/\D/g, "");

  // If 10 digits Indian number, prefix with 91
  if (targetPhone.length === 10) {
    targetPhone = `91${targetPhone}`;
  }

  const encoded = encodeURIComponent(message);
  const url = targetPhone
    ? `https://wa.me/${targetPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  window.open(url, "_blank");
};
