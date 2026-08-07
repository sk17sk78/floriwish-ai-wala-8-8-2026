"use client";
import { ClassNameType } from "@/common/types/reactTypes";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePathname } from "next/navigation";

export default function FAQs({
  faqData,
  title,
  questionClassName,
  answerClassName,
  inProductPage,
}: {
  faqData: Array<{
    _id: string;
    question: string;
    answer: string | JSX.Element;
  }>;
  title?: string;
  questionClassName?: ClassNameType;
  answerClassName?: ClassNameType;
  inProductPage?: boolean;
}) {
  const currPath = usePathname();
  const isNPath = (currPath || "").includes("/n/");

  return (
    <div className="w-full mx-auto">
      {/* 3. Render the title conditionally */}
      {title && (
        <h2 className="text-2xl md:text-2xl font-semibold text-charcoal-3 mb-6 text-start font-poppins">
          {title}
        </h2>
      )}
      <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
        {faqData.map(({ question, answer }, index) => {
          // Extracts the logic to keep the JSX clean
          const cleanQuestion = question.includes(".")
            ? question.substring(question.indexOf(".") + 1).trim()
            : question;

          return (
            <AccordionItem
              value={String(index)}
              key={index}
              // Card styling instead of standard flat borders
              className="border border-gray-100/80 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 px-4 md:px-6 data-[state=open]:border-[#b76e79]/30 data-[state=open]:bg-rose-50/10"
            >
              <AccordionTrigger
                className={`
                  ${isNPath ? "text-sm text-charcoal-3" : "text-base md:text-lg text-charcoal-3"} 
                  py-4 md:py-5 outline-none focus:outline-none font-medium text-left 
                  hover:no-underline hover:text-sienna transition-colors duration-200 
                  font-poppins group ${questionClassName || ""}
                `}
              >
                <h3 className="pr-4 leading-relaxed tracking-tight">
                  {cleanQuestion}
                </h3>
              </AccordionTrigger>

              <AccordionContent
                className={`
                  ${answerClassName || ""} 
                  ${isNPath ? "text-xs" : "text-sm md:text-base"} 
                  text-charcoal-3/70 pb-5 pt-1 leading-relaxed font-poppins
                `}
              >
                {answer}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
