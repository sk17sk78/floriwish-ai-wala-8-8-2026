// config
import { OPTIMIZE_IMAGE } from "@/config/image";

import { ClassNameType } from "@/common/types/reactTypes";
import Truck from "@/public/symbols/misc/delivery-truck.webp";
import NextImage from "@/components/custom/NextImage";

export default function OrderTruck({
  className,
  grayscale
}: {
  className?: ClassNameType;
  grayscale?: boolean;
}) {
  return (
    <span
      className={`relative ${grayscale ? "grayscale" : ""} ${className || ""}`}
    >
      <NextImage
        src={Truck.src}
        width={200}
        height={200}
        alt="Order"
        draggable={false}
        className="w-full h-full object-center object-cover"
      />
    </span>
  );
}
