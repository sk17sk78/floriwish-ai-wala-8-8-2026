// libraries
import { decode } from "he";

// icons
import { BadgeHelp, HeartHandshake, ShieldX, Truck } from "lucide-react";

// components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ContentDetailFAQs from "./ContentDetailFAQs";
import ContentDetailCareInfo from "./ContentDetailCareInfo";
import ContentDetailDeliveryDetail from "./ContentDetailDeliveryDetail";
import ContentHorizontalSpacing from "../../spacing/ContentHorizontalSpacing";

// types
import { type CancellationPolicyDocument } from "@/common/types/documentation/presets/cancellationPolicy";
import { type CareInfoDocument } from "@/common/types/documentation/presets/careInfo";
import { type ContentDetailDocument } from "@/common/types/documentation/nestedDocuments/contentDetail";
import { type DeliveryDetailDocument } from "@/common/types/documentation/presets/deliveryDetail";
import { type FAQGroupDocument } from "@/common/types/documentation/presets/faqGroup";
import styles from "../styles/cancellationPolicy.module.scss";

export default function ContentDetailInfo({
  info,
}: {
  info: ContentDetailDocument;
}) {
  const faqs = (info.faqGroup as FAQGroupDocument)?.faqs || [];
  const deliveryDetail =
    (info.deliveryDetail as DeliveryDetailDocument)?.content || [];
  const cancellationPolicy = decode(
    (info.cancellationPolicy as CancellationPolicyDocument)?.content || "",
  );
  const careInfo = (info.careInfo as CareInfoDocument)?.content || [];

  return (
    <ContentHorizontalSpacing className="my-2 xl:my-0 xl:pl-5">
      <div className="space-y-3">
        <h2 className="text-[13px] font-bold tracking-tight text-zinc-800">
          About This Product
        </h2>
        <Accordion
          type="single"
          collapsible
          className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm text-[13px]"
        >
          <AccordionItem
            value="delivery"
            className="border-b border-zinc-50 px-4 sm:px-5"
          >
            <AccordionTrigger className="py-3 text-left text-[13px] font-semibold text-zinc-700 hover:no-underline [&[data-state=open]>span>span]:bg-blue-500 [&[data-state=open]>span>span]:text-white transition-all">
              <span className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-500 transition-colors">
                  <Truck width={16} height={16} />
                </span>
                Delivery Detail
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-0 text-zinc-500">
              <ContentDetailDeliveryDetail deliveryDetail={deliveryDetail} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem
            value="care"
            className="border-b border-zinc-50 px-4 sm:px-5"
          >
            <AccordionTrigger className="py-3 text-left text-[13px] font-semibold text-zinc-700 hover:no-underline [&[data-state=open]>span>span]:bg-emerald-500 [&[data-state=open]>span>span]:text-white transition-all">
              <span className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-500 transition-colors">
                  <HeartHandshake width={16} height={16} />
                </span>
                Care Info
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-0 text-zinc-500">
              <ContentDetailCareInfo careInfo={careInfo} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem
            value="cancellation"
            className="border-b border-zinc-50 px-4 sm:px-5"
          >
            <AccordionTrigger className="py-3 text-left text-[13px] font-semibold text-zinc-700 hover:no-underline [&[data-state=open]>span>span]:bg-rose-500 [&[data-state=open]>span>span]:text-white transition-all">
              <span className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-500 transition-colors">
                  <ShieldX width={16} height={16} />
                </span>
                Cancellation Policy
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-0 text-zinc-500">
              <div
                className={`${styles.container} prose prose-sm max-w-none text-[13px] text-zinc-500`}
                dangerouslySetInnerHTML={{
                  __html: cancellationPolicy,
                }}
              />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="faq" className="border-b-0 px-4 sm:px-5">
            <AccordionTrigger className="py-3 text-left text-[13px] font-semibold text-zinc-700 hover:no-underline [&[data-state=open]>span>span]:bg-amber-500 [&[data-state=open]>span>span]:text-white transition-all">
              <span className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-500 transition-colors">
                  <BadgeHelp width={16} height={16} />
                </span>
                Frequently Asked Questions
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-0 text-zinc-500">
              <ContentDetailFAQs faqs={faqs} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ContentHorizontalSpacing>
  );
}
