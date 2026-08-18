
import { SetStateType } from "@/common/types/reactTypes";
import { LayoutEditPageType } from "../NewOrEditLayoutDialog";
import { DynamicLayoutStructure } from "../../../utils/types";
import Input from "@/lib/Forms/Input/Input";
import { CustomToggle } from "../../sidebar/SidebarLayoutBlock";
import RichTextEditor from "@/lib/Forms/RichTextEditor/temp/RichTextEditor";
import { PageLayoutDocument } from "@/common/types/documentation/nestedDocuments/pageLayout";
import { QADocument } from "@/common/types/documentation/nestedDocuments/qa";
import { generateRandomId } from "@/components/(admin)/Images/static/data";
import {
  Hash,
  ListOrderedIcon,
  PictureInPicture2,
  Tag,
  Trash2
} from "lucide-react";
import SelectContentDialog from "@/components/custom/inputs/selectContent/components/SelectContentDialog";
import { ContentDocument } from "@/common/types/documentation/contents/content";
import { LayoutQuickLinkDocument } from "@/common/types/documentation/nestedDocuments/layoutQuickLink";
import { LinkDocument } from "@/common/types/documentation/nestedDocuments/link";
import SelectImage from "@/components/custom/inputs/image/SelectImage";
import { useEffect, useState } from "react";
import { QuickLinkDocument } from "@/common/types/documentation/presets/quickLink";
import { ImageDocument } from "@/common/types/documentation/media/image";
import { LayoutCollageDocument } from "@/common/types/documentation/nestedDocuments/layoutCollage";
import CollageTiles, {
  getGridLayout,
  getLayout
} from "@/components/(frontend)/global/_Templates/Tiles/CollageTiles/CollageTiles";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { BannerDocument } from "@/common/types/documentation/nestedDocuments/banner";
import { BannerImageDocument } from "@/common/types/documentation/nestedDocuments/bannerImage";
import UpdatedCategoryTiles from "@/components/(frontend)/global/_Templates/Tiles/CategoryTiles/UpdatedCategoryTiles";
import SelectContent from "@/components/custom/inputs/selectContent/SelectContent";
import { LayoutCategoryDocument } from "@/common/types/documentation/nestedDocuments/layoutCategory";
import { Button } from "@/components/ui/button";

const customInputStyle =
  "w-full min-w-[400px] outline-none border-b border-charcoal-3/30 py-2.5 transition-all duration-300 focus:border-charcoal-3/50 bg-transparent";

export default function EditLayoutSlide({
  currSlide,
  layout,
  setLayout,
  allContents,
  allImages
}: {
  currSlide: LayoutEditPageType;
  layout: DynamicLayoutStructure | undefined;
  setLayout: SetStateType<DynamicLayoutStructure | undefined>;
  allContents: ContentDocument[];
  allImages: ImageDocument[];
}) {
  const [imagesToSelect, setImagesToSelect] = useState<5 | 6>(5);
  const [imgFreq, setImgFreq] = useState<number>(-1);
  const [imagesSelected, setImagesSelected] = useState<number>(0);

  useEffect(() => {
    if (
      layout === undefined ||
      (layout && (layout.type === "title" || layout.tag !== "category"))
    ) {
      setImgFreq((prev) => -1);
    } else if (layout.layout.category) {
      const cols = layout.layout.category.columns || 4;
      let freq = 8;
      switch (cols) {
        case 2:
          freq = 6;
          break;
        case 3:
          freq = 9;
          break;
        case 4:
          freq = 8;
          break;
        case 5:
          freq = 10;
          break;
        case 6:
          freq = 12;
          break;
      }
      setImgFreq(freq);

      if (layout.layout.category.images) {
        setImagesSelected(layout.layout.category.images.length);
      } else {
        setImagesSelected(cols);
      }
    }
  }, [layout]);

  const allowedImageCounts = (cols: number): number[] => {
    let start = 0;
    if (cols === 6) start = 2;
    else if (cols === 9) start = 3;
    else if (cols === 8) start = 4;
    else if (cols === 10) start = 5;
    else if (cols === 12) start = 6;
    else return [];

    const res = [];
    for (let i = start; i <= cols; i++) res.push(i);
    return res;
  };

  if (layout === undefined)
    return (
      <section
        className={`flex flex-col items-start justify-start gap-3 px-7 pt-10 pb-28 ${currSlide === "choose-layout" ? "translate-x-0" : "-translate-x-[100%]"} transition-all duration-300 bg-ivory-1 h-full min-w-[80dvw] max-w-[1000px] overflow-y-scroll scrollbar-hide`}
      >
        No Layout Selected
      </section>
    );

  const { _id, layout: layoutLayout, order, tag, type, isDisabled } = layout;

  const title =
    tag === "quick-link"
      ? "Quick Links"
      : tag === "content"
        ? "Products / Services"
        : tag === "text"
          ? "Custom Text"
          : tag === "faq"
            ? "FAQs"
            : tag;

  const collageLayouts: LayoutCollageDocument["type"][] = [
    "l1-m0-r4",
    "l2-m1-r2",
    "l4-m0-r1",
    "lt1-lb2-rt1-rb2",
    "lt2-lb1-rt2-rb1"
  ];

  return (
    <section
      className={`flex flex-col items-start justify-start px-7 pt-10 pb-28 relative ${currSlide === "choose-layout" ? "translate-x-0" : "-translate-x-[100%]"} transition-all duration-300 bg-ivory-1 h-full min-w-[80dvw] max-w-[1000px] overflow-y-scroll scrollbar-hide`}
    >
      {/* TITLE: QUITE STATIC ------------------------------ */}
      <div className="text-3xl font-light capitalize pb-1.5">{title}</div>
      <div className="text-sm text-charcoal-3/50">
        Customize the data as required, then confirm changes.{" "}
      </div>

      {/*##############################################################################################################
      ##################################### TITLE #####################################################################
      ##############################################################################################################*/}
      {type === "title" ? (
        <>
          <Input
            type="text"
            errorCheck={false}
            validCheck={false}
            isRequired
            labelConfig={{ label: "Heading (H1)", layoutStyle: "flex-col pt-8" }}
            name="title"
            customValue={{
              value: layout.type === "title" ? layout.data : "",
              setValue: (newTitle: string) =>
                setLayout((prev) =>
                  prev === undefined ? undefined : { ...prev, data: newTitle }
                )
            }}
            customStyle={customInputStyle}
          />

          <Input
            type="text"
            errorCheck={false}
            validCheck={false}
            isRequired={false}
            labelConfig={{ label: "Subtitle", layoutStyle: "flex-col pt-8" }}
            name="subtitle"
            customValue={{
              value: layout.type === "title" ? layout.subtitle || "" : "",
              setValue: (value: string) =>
                setLayout((prev) =>
                  prev === undefined ? undefined : { ...prev, subtitle: value }
                )
            }}
            customStyle={customInputStyle}
          />

          <div className="flex items-center justify-start gap-2 pt-8">
            <CustomToggle
              label=""
              toggled={layout.leftAlign || false}
              onToggle={(val: boolean) =>
                setLayout((prev) =>
                  prev === undefined ? undefined : { ...prev, leftAlign: val }
                )
              }
            />

            <span>Left Align</span>
          </div>

          <div className="flex items-center justify-start gap-2 pt-8">
            <Input
              type="color"
              errorCheck={false}
              isRequired={false}
              name="bg-color"
              validCheck={false}
              labelConfig={{ label: "Custom Background" }}
              customValue={{
                value: layout.customBG || "#000",
                setValue: (shade: string) => {
                  setLayout((prev) =>
                    prev
                      ? {
                          ...prev,
                          customBG:
                            shade === "#000" || shade === "#000000"
                              ? undefined
                              : shade
                        }
                      : undefined
                  );
                }
              }}
            />
          </div>
        </>
      ) : tag === "text" ? (
        <>
          {/*##############################################################################################################
      ##################################### CUSTOM TEXT #####################################################################
      ##############################################################################################################*/}
          <div className="pt-8">
            <RichTextEditor
              name="custom-text"
              isRequired={true}
              label="Custom Text"
              defaultValue={
                layout.layout.text ? (layout.layout.text as string) : ""
              }
              content={layout.layout.text ? (layout.layout.text as string) : ""}
              onChangeContent={(updatedContent: string) => {
                setLayout((prev) =>
                  prev === undefined
                    ? undefined
                    : {
                        ...prev,
                        layout: {
                          text: updatedContent
                        } as unknown as PageLayoutDocument
                      }
                );
              }}
              height={"330px"}
              width={"700px"}
            />
          </div>

          <div className="flex items-center justify-start gap-2 pt-8">
            <CustomToggle
              label=""
              toggled={layout.extraSpacing || false}
              onToggle={(val: boolean) =>
                setLayout((prev) =>
                  prev === undefined
                    ? undefined
                    : { ...prev, extraSpacing: val }
                )
              }
            />

            <span>Extra Spacing</span>
          </div>

          <div className="flex items-center justify-start gap-2 pt-8">
            <Input
              type="color"
              errorCheck={false}
              isRequired={false}
              name="bg-color"
              validCheck={false}
              labelConfig={{ label: "Custom Background" }}
              customValue={{
                value: layout.customBG || "#000",
                setValue: (shade: string) => {
                  setLayout((prev) =>
                    prev
                      ? {
                          ...prev,
                          customBG:
                            shade === "#000" || shade === "#000000"
                              ? undefined
                              : shade
                        }
                      : undefined
                  );
                }
              }}
            />
          </div>
        </>
      ) : tag === "quick-link" ? (
        <>
          {/*##############################################################################################################
      ##################################### QUICK LINKS #####################################################################
      ##############################################################################################################*/}
          <div className="grid grid-cols-[auto_1fr]  gap-x-7 pt-7 pb-20 items-start">
            <div
              className="bg-rose-500 rounded-lg py-2 text-white px-4 text-center cursor-pointer hover:bg-rose-600 transition-all duration-300"
              onClick={() => {
                const emptyQuickLinkSection: LayoutQuickLinkDocument = {
                  _id: generateRandomId(20),
                  heading: "",
                  links: [
                    {
                      label: "",
                      path: "",
                      _id: generateRandomId(20)
                    },
                    {
                      label: "",
                      path: "",
                      _id: generateRandomId(20)
                    }
                  ]
                } as unknown as LayoutQuickLinkDocument;

                setLayout((prev) =>
                  prev === undefined
                    ? undefined
                    : {
                        ...prev,
                        layout: {
                          quickLink:
                            prev.layout && prev.layout.quickLink
                              ? [
                                  emptyQuickLinkSection,
                                  ...prev.layout.quickLink
                                ]
                              : [emptyQuickLinkSection]
                        } as PageLayoutDocument
                      }
                );
              }}
            >
              Add Section
            </div>

            <div className="flex flex-col justify-start gap-y-6">
              {layout.layout && layout.layout.quickLink ? (
                layout.layout.quickLink.map(
                  ({ _id, heading, links }, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[auto_auto] gap-x-5 px-6 *:pt-4 *:pb-6 rounded-xl bg-ivory-2/60 border"
                    >
                      {/* HEADING SECTION, LEFT SIDE */}
                      <div className="flex flex-col justify-start gap-y-3 pr-8 border-r border-charcoal-3/15">
                        {/* HEADING */}
                        <Input
                          errorCheck={false}
                          isRequired={false}
                          name="heading"
                          type="text"
                          validCheck={false}
                          customValue={{
                            value: heading,
                            setValue: (newHeading: string) => {
                              setLayout((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      layout: {
                                        quickLink:
                                          prev.layout.quickLink?.map((ql) =>
                                            ql._id === _id
                                              ? { ...ql, heading: newHeading }
                                              : ql
                                          ) || []
                                      } as PageLayoutDocument
                                    }
                                  : undefined
                              );
                            }
                          }}
                          placeholder="Heading"
                          customStyle={`${customInputStyle} !min-w-[230px] !max-w-[230px]`}
                        />

                        <div className="flex items-center justify-start gap-2">
                          <div
                            onClick={() => {
                              const emptyLink: LinkDocument = {
                                _id: generateRandomId(20),
                                label: "",
                                path: ""
                              } as unknown as LinkDocument;

                              setLayout((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      layout: {
                                        quickLink:
                                          prev.layout.quickLink?.map((ql) =>
                                            ql._id === _id
                                              ? {
                                                  ...ql,
                                                  links: [
                                                    emptyLink,
                                                    ...ql.links
                                                  ]
                                                }
                                              : ql
                                          ) || []
                                      } as PageLayoutDocument
                                    }
                                  : undefined
                              );
                            }}
                            className="py-1 px-4 rounded-full bg-charcoal-3/20 w-fit text-sm cursor-pointer transition-all duration-300 hover:bg-charcoal-3/30"
                          >
                            + Add Link
                          </div>

                          <div
                            onClick={() => {
                              setLayout((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      layout: {
                                        quickLink:
                                          prev.layout.quickLink?.filter(
                                            ({ _id: id }) => _id !== id
                                          )
                                      } as PageLayoutDocument
                                    }
                                  : undefined
                              );
                            }}
                            className="py-1 px-4 rounded-full bg-rose-200 text-rose-500 w-fit text-sm cursor-pointer transition-all duration-300 hover:bg-rose-400/40"
                          >
                            Drop
                          </div>
                        </div>
                      </div>

                      {/* SUBLINK SECTION, RIGHT SIDE */}
                      <div className="grid grid-cols-[1fr_2fr_20px] items-start gap-x-3 pl-3">
                        {links.map(({ _id: linkId, label, path }, index2) => (
                          <>
                            {/* SUBLINK LABEL */}
                            <div className="!w-fit">
                              <Input
                                errorCheck={false}
                                isRequired={false}
                                name="heading"
                                type="text"
                                validCheck={false}
                                customValue={{
                                  value: label,
                                  setValue: (newLabel: string) => {
                                    setLayout((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            layout: {
                                              quickLink:
                                                prev.layout.quickLink?.map(
                                                  (ql) =>
                                                    ql._id === _id
                                                      ? {
                                                          ...ql,
                                                          links: ql.links.map(
                                                            (link) =>
                                                              link._id ===
                                                              linkId
                                                                ? {
                                                                    ...link,
                                                                    label:
                                                                      newLabel
                                                                  }
                                                                : link
                                                          )
                                                        }
                                                      : ql
                                                ) || []
                                            } as PageLayoutDocument
                                          }
                                        : undefined
                                    );
                                  }
                                }}
                                placeholder="Label"
                                customStyle={`${customInputStyle} !min-w-[180px] !max-w-[180px]`}
                              />
                            </div>
                            {/* SUBLINK URL */}
                            <div className="!w-fit">
                              <Input
                                errorCheck={false}
                                isRequired={false}
                                name="heading"
                                type="text"
                                validCheck={false}
                                customValue={{
                                  value: path,
                                  setValue: (newPath: string) => {
                                    setLayout((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            layout: {
                                              quickLink:
                                                prev.layout.quickLink?.map(
                                                  (ql) =>
                                                    ql._id === _id
                                                      ? {
                                                          ...ql,
                                                          links: ql.links.map(
                                                            (link) =>
                                                              link._id ===
                                                              linkId
                                                                ? {
                                                                    ...link,
                                                                    path: newPath
                                                                  }
                                                                : link
                                                          )
                                                        }
                                                      : ql
                                                ) || []
                                            } as PageLayoutDocument
                                          }
                                        : undefined
                                    );
                                  }
                                }}
                                placeholder="Link"
                                customStyle={`${customInputStyle} !min-w-[280px] !max-w-[280px]`}
                              />
                            </div>

                            {/* DROP SUB LINK */}
                            <div
                              onClick={() => {
                                setLayout((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        layout: {
                                          quickLink:
                                            prev.layout.quickLink?.map((ql) =>
                                              ql._id === _id
                                                ? {
                                                    ...ql,
                                                    links: ql.links.filter(
                                                      ({ _id: id }) =>
                                                        id !== linkId
                                                    )
                                                  }
                                                : ql
                                            ) || []
                                        } as PageLayoutDocument
                                      }
                                    : undefined
                                );
                              }}
                              className="cursor-pointer transition-all duration-300 text-sm text-charcoal-3 hover:text-red-500 -translate-x-6 relative translate-y-5 rounded-full"
                            >
                              Delete
                            </div>
                          </>
                        ))}
                      </div>
                    </div>
                  )
                )
              ) : (
                <></>
              )}
            </div>
          </div>

          <div className="flex items-center justify-start gap-2">
            <Input
              type="color"
              errorCheck={false}
              isRequired={false}
              name="bg-color"
              validCheck={false}
              labelConfig={{ label: "Custom Background" }}
              customValue={{
                value: layout.customBG || "#000",
                setValue: (shade: string) => {
                  setLayout((prev) =>
                    prev
                      ? {
                          ...prev,
                          customBG:
                            shade === "#000" || shade === "#000000"
                              ? undefined
                              : shade
                        }
                      : undefined
                  );
                }
              }}
            />
          </div>
        </>
      ) : tag === "faq" ? (
        <>
          {/*##############################################################################################################
      ##################################### FAQS #####################################################################
      ##############################################################################################################*/}
          <div className="grid grid-cols-[auto_1fr]  gap-x-7 pt-7 pb-20 items-start">
            <div
              className="bg-rose-500 rounded-lg py-2 text-white px-4 text-center cursor-pointer hover:bg-rose-600 transition-all duration-300"
              onClick={() => {
                const emptyFAQ: QADocument = {
                  _id: generateRandomId(20),
                  question: "",
                  answer: ""
                } as unknown as QADocument;

                setLayout((prev) =>
                  prev === undefined
                    ? undefined
                    : {
                        ...prev,
                        layout: {
                          faq:
                            prev.layout && prev.layout.faq
                              ? [emptyFAQ, ...prev.layout.faq]
                              : [emptyFAQ]
                        } as PageLayoutDocument
                      }
                );
              }}
            >
              Add FAQ
            </div>

            <div className="flex flex-col justify-start gap-y-6">
              {layout.layout && layout.layout.faq ? (
                layout.layout.faq.map(({ question, answer, _id }, index) => (
                  <div
                    className="relative min-w-[60dvw] min-[1000px]:min-w-[780px]"
                    key={index}
                  >
                    <div
                      onClick={() => {
                        setLayout((prev) =>
                          prev === undefined
                            ? undefined
                            : {
                                ...prev,
                                layout: {
                                  faq: prev.layout.faq?.filter(
                                    (qna) => qna._id !== _id
                                  ) as QADocument[]
                                } as PageLayoutDocument
                              }
                        );
                      }}
                      className="cursor-pointer text-sm z-30 absolute top-1/2 right-0 translate-x-[calc(100%_+_32px)] transition-all duration-300 hover:text-red-500"
                    >
                      Delete
                    </div>

                    <Input
                      type="text"
                      errorCheck={false}
                      isRequired={false}
                      labelConfig={{
                        label: "Question",
                        layoutStyle:
                          "relative space-y-1 sm:grid sm:grid-cols-[110px_1fr] sm:justify-start sm:items-center",
                        labelStyle: "text-charcoal-3"
                      }}
                      customValue={{
                        value: question,
                        setValue: (str: string) => {
                          setLayout((prev) =>
                            prev === undefined
                              ? undefined
                              : {
                                  ...prev,
                                  layout: {
                                    faq: (prev.layout.faq?.map((qna) =>
                                      qna._id === _id
                                        ? { ...qna, question: str }
                                        : qna
                                    ) || []) as QADocument[]
                                  } as PageLayoutDocument
                                }
                          );
                        }
                      }}
                      validCheck={false}
                      name="Q"
                      customStyle={customInputStyle}
                    />
                    <Input
                      type="text"
                      errorCheck={false}
                      isRequired={false}
                      labelConfig={{
                        label: "Answer",
                        layoutStyle:
                          "relative space-y-1 sm:grid sm:grid-cols-[110px_1fr] sm:justify-start sm:items-center",
                        labelStyle: "text-charcoal-3"
                      }}
                      customValue={{
                        value: answer,
                        setValue: (str: string) => {
                          setLayout((prev) =>
                            prev === undefined
                              ? undefined
                              : {
                                  ...prev,
                                  layout: {
                                    faq: (prev.layout.faq?.map((qna) =>
                                      qna._id === _id
                                        ? { ...qna, answer: str }
                                        : qna
                                    ) || []) as QADocument[]
                                  } as PageLayoutDocument
                                }
                          );
                        }
                      }}
                      validCheck={false}
                      name="A"
                      customStyle={customInputStyle}
                    />
                  </div>
                ))
              ) : (
                <></>
              )}
            </div>
          </div>

          <div className="flex items-center justify-start gap-2">
            <Input
              type="color"
              errorCheck={false}
              isRequired={false}
              name="bg-color"
              validCheck={false}
              labelConfig={{ label: "Custom Background" }}
              customValue={{
                value: layout.customBG || "#000",
                setValue: (shade: string) => {
                  setLayout((prev) =>
                    prev
                      ? {
                          ...prev,
                          customBG:
                            shade === "#000" || shade === "#000000"
                              ? undefined
                              : shade
                        }
                      : undefined
                  );
                }
              }}
            />
          </div>
        </>
      ) : tag === "content" ? (
        <>
          {/*##############################################################################################################
      ##################################### PRODUCTS #####################################################################
      ##############################################################################################################*/}
          <div className="space-y-6 pt-8">
            {/* EXTRA PADDING */}
            <div className="flex items-center justify-start gap-2">
              <CustomToggle
                label=""
                toggled={layout.extraSpacing || false}
                onToggle={(val: boolean) =>
                  setLayout((prev) =>
                    prev === undefined
                      ? undefined
                      : { ...prev, extraSpacing: val }
                  )
                }
              />

              <span>Extra Padding</span>
            </div>

            <SelectContent
              name=""
              type="both"
              isRequired={false}
              performReset
              label=""
              onChangeValue={(newValues: string[]) => {
                const selectedContents = allContents
                  .filter(({ _id }) => newValues.includes(String(_id)))
                  ?.map(
                    (content) =>
                      ({
                        ...content,
                        media: {
                          ...content.media,
                          primary:
                            allImages.find(
                              ({ _id }) =>
                                String(_id) ===
                                String(content.media?.primary)
                            ) || content.media?.primary
                        }
                      }) as ContentDocument
                  );

                if (selectedContents !== undefined)
                  setLayout((prev) =>
                    prev
                      ? {
                          ...prev,
                          layout: {
                            content: selectedContents
                          } as PageLayoutDocument
                        }
                      : undefined
                  );
              }}
              value={
                layout.layout.content && layout.layout.content.length > 0
                  ? (layout.layout.content as (ContentDocument | string)[]).map(
                      (item) =>
                        typeof item === "string" ? item : String(item._id)
                    )
                  : []
              }
            />
          </div>

          <div className="flex items-center justify-start gap-2">
            <Input
              type="color"
              errorCheck={false}
              isRequired={false}
              name="bg-color"
              validCheck={false}
              labelConfig={{ label: "Custom Background" }}
              customValue={{
                value: layout.customBG || "#000",
                setValue: (shade: string) => {
                  setLayout((prev) =>
                    prev
                      ? {
                          ...prev,
                          customBG:
                            shade === "#000" || shade === "#000000"
                              ? undefined
                              : shade
                        }
                      : undefined
                  );
                }
              }}
            />
          </div>
        </>
      ) : tag === "banner" ? (
        <>
          {/*##############################################################################################################
      ##################################### BANNER #####################################################################
      ##############################################################################################################*/}
          <div className="flex flex-col items-start justify-start gap-x-10 gap-y-2 my-5">
            {/* ROW 1 -------------- */}
            <div className="flex items-center justify-start gap-x-10 *:text-sm">
              {/* BANNER TYPE */}
              <div className="flex items-center justify-start gap-4">
                <span className="whitespace-nowrap font-medium">
                  Banner Height
                </span>
                <Input
                  type="dropdown"
                  errorCheck={false}
                  isRequired={false}
                  name="banner-type"
                  nullOption={false}
                  customValue={{
                    value:
                      layout.layout.banner && layout.layout.banner.type
                        ? layout.layout.banner.type
                        : "default",
                    setValue: (newVal: string) => {
                      if (
                        [
                          "default",
                          "mini",
                          "micro",
                          "large",
                          "square"
                        ].includes(newVal)
                      )
                        setLayout((prev) =>
                          prev
                            ? {
                                ...prev,
                                layout: {
                                  banner: layout.layout.banner
                                    ? ({
                                        ...layout.layout.banner,
                                        type: newVal
                                      } as BannerDocument)
                                    : undefined
                                } as PageLayoutDocument
                              }
                            : undefined
                        );
                    }
                  }}
                  options={[
                    { label: "Default (2/1 aspect ratio)", value: "default" },
                    { label: "Mini (150px height)", value: "mini" },
                    { label: "Micro (90px height)", value: "micro" },
                    { label: "Large (3/2 aspect ratio)", value: "large" },
                    { label: "Square (1/1 aspect ratio)", value: "square" }
                  ]}
                  validCheck={false}
                />
              </div>

              {/* CUSTOM BG */}
              <div className="flex items-center justify-start gap-2">
                <Input
                  type="color"
                  errorCheck={false}
                  isRequired={false}
                  name="bg-color"
                  validCheck={false}
                  labelConfig={{ label: "Custom Background" }}
                  customValue={{
                    value: layout.customBG || "#000",
                    setValue: (shade: string) => {
                      setLayout((prev) =>
                        prev
                          ? {
                              ...prev,
                              customBG:
                                shade === "#000" || shade === "#000000"
                                  ? undefined
                                  : shade
                            }
                          : undefined
                      );
                    }
                  }}
                />
              </div>
            </div>

            {/* ROW 2 -------------- */}
            <div className="flex items-center justify-start gap-x-10">
              {/* ADD NEW BANNER */}
              <div
                className="bg-rose-500 rounded-lg py-2 my-4 text-white px-4 text-center cursor-pointer hover:bg-rose-600 transition-all duration-300"
                onClick={() => {
                  const emptyImageDoc = () =>
                    ({
                      _id: generateRandomId(20),
                      folderId: "",
                      folderName: "",
                      name: "",
                      defaultAlt: "",
                      alt: "",
                      extension: "",
                      width: 0,
                      height: 0,
                      size: 0,
                      url: "",
                      usagesCount: 0
                    }) as unknown as ImageDocument;

                  const newEmptyBannerRow: BannerImageDocument = {
                    _id: generateRandomId(20),
                    desktop: emptyImageDoc(),
                    mobile: emptyImageDoc()
                  } as unknown as BannerImageDocument;

                  setLayout((prev) =>
                    prev
                      ? {
                          ...prev,
                          layout: {
                            banner: layout.layout.banner
                              ? {
                                  ...layout.layout.banner,
                                  images: [
                                    newEmptyBannerRow,
                                    ...layout.layout.banner.images
                                  ]
                                }
                              : ({
                                  _id: generateRandomId(20),
                                  images: [
                                    newEmptyBannerRow
                                  ] as BannerImageDocument[],
                                  loopInfinitely: false,
                                  autoScroll: true,
                                  scrollInterval: 7000,
                                  showIndicators: true
                                } as unknown as BannerDocument)
                          } as PageLayoutDocument
                        }
                      : undefined
                  );
                }}
              >
                Add Banner
              </div>

              {/* LOOP INFINITELY */}
              <div className="flex items-center justify-start gap-2">
                <CustomToggle
                  label=""
                  toggled={layout.layout.banner?.loopInfinitely || false}
                  onToggle={(val: boolean) =>
                    setLayout((prev) =>
                      prev === undefined
                        ? undefined
                        : {
                            ...prev,
                            layout: {
                              banner: layout.layout.banner
                                ? {
                                    ...layout.layout.banner,
                                    loopInfinitely: val
                                  }
                                : ({
                                    _id: generateRandomId(20),
                                    images: [] as BannerImageDocument[],
                                    loopInfinitely: val,
                                    autoScroll: true,
                                    scrollInterval: 7000,
                                    showIndicators: true
                                  } as unknown as BannerDocument)
                            } as PageLayoutDocument
                          }
                    )
                  }
                />

                <span>Scroll Infinitely</span>
              </div>

              {/* EXTRA PADDING */}
              <div className="flex items-center justify-start gap-2">
                <CustomToggle
                  label=""
                  toggled={layout.extraSpacing || false}
                  onToggle={(val: boolean) =>
                    setLayout((prev) =>
                      prev === undefined
                        ? undefined
                        : { ...prev, extraSpacing: val }
                    )
                  }
                />

                <span>Extra Padding</span>
              </div>
            </div>
          </div>

          <div className="overflow-auto scrollbar-hide min-h-[calc(100dvh_-_240px)] max-h-[calc(100dvh_-_240px)] w-[70dvw] auto-rows-min grid grid-cols-[auto_repeat(2,minmax(150px,4fr))_3fr_auto] items-center justify-center *:p-4 *:border-b *:border-l border *:border-rose-200/60 border-rose-300/60 rounded-3xl ">
            <div className="!py-3.5 text-center italic !border-l-0 bg-rose-100/80 text-rose-600 font-medium">
              No.
            </div>
            <div className="!py-3.5 text-center bg-rose-100/80 text-rose-600 font-medium">
              Desktop Image
            </div>
            <div className="!py-3.5 text-center bg-rose-100/80 text-rose-600 font-medium">
              Mobile Image
            </div>
            <div className="!py-3.5 text-center bg-rose-100/80 text-rose-600 font-medium">
              Link
            </div>
            <div className="!py-3.5 text-center bg-rose-100/80 text-transparent font-medium">
              d
            </div>
            {layout.layout.banner !== undefined &&
            layout.layout.banner.images &&
            layout.layout.banner.images.length > 0 ? (
              layout.layout.banner.images.map((banner, index) => (
                <BannerImageRow
                  banner={banner}
                  setLayout={setLayout}
                  noBottomBorder={false}
                  allImages={allImages}
                  index={index}
                  key={index}
                />
              ))
            ) : (
              <></>
            )}
          </div>
        </>
      ) : tag === "collage" ? (
        <>
          {/*##############################################################################################################
      ##################################### COLLAGE #####################################################################
      ##############################################################################################################*/}
          <div className="grid grid-cols-[1fr_1fr] items-start justify-start relative w-full">
            <section className="flex flex-col justify-start pr-7 h-full border-r border-charcoal-3/20 ">
              <div className="text-sm pt-8 flex items-center justify-start gap-3 *:px-3.5 *:py-1 *:rounded-lg *:border *:border-rose-500 *:transition-all *:duration-300 *:cursor-pointer">
                <div
                  className={
                    imagesToSelect === 5
                      ? "bg-rose-500 text-white"
                      : "hover:bg-rose-100 bg-rose-50 text-rose-700"
                  }
                  onClick={() => setImagesToSelect((prev) => 5)}
                >
                  5 images
                </div>
                <div
                  className={
                    imagesToSelect === 6
                      ? "bg-rose-500 text-white"
                      : "hover:bg-rose-100 bg-rose-50 text-rose-700"
                  }
                  onClick={() => setImagesToSelect((prev) => 6)}
                >
                  6 images
                </div>
              </div>

              <div className="min-w-max py-5 ">
                <SelectImage
                  name=""
                  selectMultiple
                  maxSelections={imagesToSelect}
                  label=""
                  className="max-w-[500px]"
                  onChangeValue={(selectedIds: string[]) => {
                    const prevImages =
                      layout.layout.collage && layout.layout.collage.images
                        ? (layout.layout.collage.images as QuickLinkDocument[])
                        : [];

                    const prevIds = prevImages.map(({ image }) =>
                      typeof image === "string"
                        ? image
                        : String((image as ImageDocument)?._id || "")
                    );

                    if (
                      selectedIds.length === prevIds.length &&
                      selectedIds.every((id, i) => id === prevIds[i])
                    )
                      return;

                    const combinedImages = selectedIds
                      .map((id) => {
                        const existing = prevImages.find((img) => {
                          const imgId =
                            typeof img.image === "string"
                              ? img.image
                              : String(
                                  (img.image as ImageDocument)?._id || ""
                                );
                          return imgId === id;
                        });
                        if (existing) return existing;

                        const newImg = allImages.find(
                          ({ _id }) => String(_id) === id
                        );
                        return {
                          _id: generateRandomId(20),
                          label: "",
                          path: "",
                          image: newImg,
                        };
                      })
                      .filter((img) => img.image !== undefined) as QuickLinkDocument[];

                    setLayout((prev) =>
                      prev
                        ? {
                            ...prev,
                            layout: {
                              ...prev.layout,
                              collage:
                                prev.layout && prev.layout.collage
                                  ? {
                                      ...prev.layout.collage,
                                      images: combinedImages,
                                    }
                                  : {
                                      images: combinedImages,
                                      type:
                                        combinedImages.length <= 5
                                          ? "l1-m0-r4"
                                          : "lt2-lb1-rt2-rb1",
                                      _id: generateRandomId(20),
                                    },
                            } as unknown as PageLayoutDocument,
                          }
                        : undefined
                    );
                  }}
                  value={
                    layout.layout.collage && layout.layout.collage.images
                      ? (layout.layout.collage.images as QuickLinkDocument[])
                          .filter((x) => x !== undefined)
                          .map((lt) =>
                            lt.image
                              ? typeof lt.image === "string"
                                ? lt.image
                                : String((lt.image as ImageDocument)?._id || "")
                              : undefined
                          )
                          .filter((x) => x !== undefined)
                      : []
                  }
                  manage="image"
                />
              </div>

              {/* CHOOSE LAYOUT */}
              {layout.layout.collage &&
              layout.layout.collage.images &&
              (layout.layout.collage.images as QuickLinkDocument[])
                .map(({ image }) => image)
                .filter((x) => x !== undefined && x !== "").length ===
                imagesToSelect ? (
                <div className="flex flex-col justify-start items-start py-4">
                  <span className="text-2xl font-light">Choose Layout</span>
                  <div className="grid grid-cols-1 auto-rows-min gap-4 w-[50%] pt-3.5">
                    {collageLayouts
                      .slice(
                        imagesToSelect <= 5 ? 0 : 3,
                        imagesToSelect <= 5 ? 3 : 5
                      )
                      .map((layoutName, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            if (
                              layout.layout.collage &&
                              layout.layout.collage.type === layoutName
                            )
                              return;

                            setLayout((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    layout: {
                                      collage: prev.layout.collage
                                        ? {
                                            ...prev.layout.collage,
                                            type: layoutName
                                          }
                                        : {
                                            type: layoutName,
                                            _id: generateRandomId(20),
                                            images: []
                                          }
                                    } as unknown as PageLayoutDocument
                                  }
                                : undefined
                            );
                          }}
                          className={`${getGridLayout(layoutName)} cursor-pointer rounded-lg overflow-hidden !gap-1 ${layout.layout.collage && layout.layout.collage.type === layoutName ? "ring-2 ring-offset-4 ring-rose-600/50 *:bg-rose-600/50 *:text-rose-700" : "*:bg-charcoal-3/50 *:hover:bg-charcoal-3/60 *:text-transparent"} transition-all duration-300`}
                        >
                          {Array.from({ length: imagesToSelect }).map(
                            (_, index) => (
                              <Popover key={index}>
                                <PopoverTrigger asChild>
                                  <div
                                    className={`${getLayout(layoutName, index, true)} flex items-center justify-center transition-all duration-300 text-sm font-medium`}
                                  >
                                    {index + 1}
                                  </div>
                                </PopoverTrigger>
                                {layout.layout.collage &&
                                layout.layout.collage.type === layoutName ? (
                                  <PopoverContent
                                    side="right"
                                    sideOffset={10}
                                    className="flex flex-col justify-start outline-none border-none rounded-2xl !z-[950] px-5 relative w-[400px]"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-xl font-light pt-1 pb-1.5">
                                        Tile No. {index + 1}
                                      </span>
                                      <div className=" text-xs text-blue-500">
                                        Use tab to navigate
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-[40px_1fr] items-center">
                                      <span className="text-charcoal-3 translate-y-px">
                                        <Tag
                                          strokeWidth={1.5}
                                          width={17}
                                          height={17}
                                        />
                                      </span>
                                      <Input
                                        type="text"
                                        errorCheck={false}
                                        validCheck={false}
                                        isRequired={false}
                                        name="label"
                                        customStyle={`${customInputStyle} !min-w-[300px] !max-w-[300px]`}
                                        customValue={{
                                          value:
                                            layout.layout.collage &&
                                            layout.layout.collage.images
                                              ? (
                                                  layout.layout.collage
                                                    .images as QuickLinkDocument[]
                                                ).at(index)?.label || ""
                                              : "",
                                          setValue: (str: string) => {
                                            setLayout((prev) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    layout: {
                                                      collage: layout.layout
                                                        .collage
                                                        ? {
                                                            ...layout.layout
                                                              .collage,
                                                            images:
                                                              layout.layout
                                                                .collage.images
                                                                .length > 0
                                                                ? (
                                                                    layout
                                                                      .layout
                                                                      .collage
                                                                      .images as QuickLinkDocument[]
                                                                  ).map(
                                                                    (img, i) =>
                                                                      i ===
                                                                      index
                                                                        ? {
                                                                            ...img,
                                                                            label:
                                                                              str
                                                                          }
                                                                        : img
                                                                  )
                                                                : [
                                                                    {
                                                                      _id: generateRandomId(
                                                                        20
                                                                      ),
                                                                      label:
                                                                        str,
                                                                      path: ""
                                                                    }
                                                                  ]
                                                          }
                                                        : {}
                                                    } as PageLayoutDocument
                                                  }
                                                : undefined
                                            );
                                          }
                                        }}
                                        placeholder="Label"
                                      />

                                      <span className="text-charcoal-3 translate-y-px">
                                        <Hash
                                          strokeWidth={1.5}
                                          width={17}
                                          height={17}
                                        />
                                      </span>
                                      <Input
                                        type="text"
                                        errorCheck={false}
                                        validCheck={false}
                                        isRequired={false}
                                        name="path"
                                        customStyle={`${customInputStyle} !min-w-[300px] !max-w-[300px]`}
                                        customValue={{
                                          value:
                                            layout.layout.collage &&
                                            layout.layout.collage.images
                                              ? (
                                                  layout.layout.collage
                                                    .images as QuickLinkDocument[]
                                                ).at(index)?.path || ""
                                              : "",
                                          setValue: (str: string) => {
                                            setLayout((prev) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    layout: {
                                                      collage: layout.layout
                                                        .collage
                                                        ? {
                                                            ...layout.layout
                                                              .collage,
                                                            images:
                                                              layout.layout
                                                                .collage.images
                                                                .length > 0
                                                                ? (
                                                                    layout
                                                                      .layout
                                                                      .collage
                                                                      .images as QuickLinkDocument[]
                                                                  ).map(
                                                                    (img, i) =>
                                                                      i ===
                                                                      index
                                                                        ? {
                                                                            ...img,
                                                                            path: str
                                                                          }
                                                                        : img
                                                                  )
                                                                : [
                                                                    {
                                                                      _id: generateRandomId(
                                                                        20
                                                                      ),
                                                                      path: str,
                                                                      label: ""
                                                                    }
                                                                  ]
                                                          }
                                                        : {}
                                                    } as PageLayoutDocument
                                                  }
                                                : undefined
                                            );
                                          }
                                        }}
                                        placeholder="Path"
                                      />

                                      <span className="text-charcoal-3 translate-y-px">
                                        <ListOrderedIcon
                                          strokeWidth={1.5}
                                          width={17}
                                          height={17}
                                        />
                                      </span>
                                      <Input
                                        type="number"
                                        errorCheck={false}
                                        validCheck={false}
                                        isRequired={false}
                                        name="order"
                                        customStyle={`${customInputStyle} !min-w-[300px] !max-w-[300px]`}
                                        customValue={{
                                          value: String(index + 1),
                                          setValue: (str: string) => {
                                            const indexToSwap = index;
                                            const indexToSwapWith = Math.min(
                                              imagesToSelect - 1,
                                              Math.max(0, parseInt(str) - 1)
                                            );
                                            if (indexToSwap === indexToSwapWith)
                                              return;

                                            const imageObj =
                                              layout.layout.collage &&
                                              layout.layout.collage.images
                                                ? ((
                                                    layout.layout.collage
                                                      .images as QuickLinkDocument[]
                                                  ).at(indexToSwap)
                                                    ?.image as ImageDocument) ||
                                                  undefined
                                                : undefined;
                                            const imageObjBeingSwapped =
                                              layout.layout.collage &&
                                              layout.layout.collage.images
                                                ? ((
                                                    layout.layout.collage
                                                      .images as QuickLinkDocument[]
                                                  ).at(indexToSwapWith)
                                                    ?.image as ImageDocument) ||
                                                  undefined
                                                : undefined;

                                            setLayout((prev) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    layout: {
                                                      collage: layout.layout
                                                        .collage
                                                        ? {
                                                            ...layout.layout
                                                              .collage,
                                                            images:
                                                              layout.layout
                                                                .collage.images
                                                                .length > 0
                                                                ? (
                                                                    layout
                                                                      .layout
                                                                      .collage
                                                                      .images as QuickLinkDocument[]
                                                                  ).map(
                                                                    (img, i) =>
                                                                      i ===
                                                                      indexToSwap
                                                                        ? {
                                                                            ...img,
                                                                            image:
                                                                              imageObjBeingSwapped
                                                                          }
                                                                        : i ===
                                                                            indexToSwapWith
                                                                          ? {
                                                                              ...img,
                                                                              image:
                                                                                imageObj
                                                                            }
                                                                          : img
                                                                  )
                                                                : []
                                                          }
                                                        : {}
                                                    } as unknown as PageLayoutDocument
                                                  }
                                                : undefined
                                            );
                                          }
                                        }}
                                        placeholder="Image"
                                      />
                                    </div>
                                  </PopoverContent>
                                ) : (
                                  <></>
                                )}
                              </Popover>
                            )
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-red-500">
                  Select total {imagesToSelect} images to continue forward.
                </div>
              )}

              {/* EXTRA SPACING */}
              <div className="flex items-center justify-start gap-2 pt-8">
                <CustomToggle
                  label=""
                  toggled={layout.extraSpacing || false}
                  onToggle={(val: boolean) =>
                    setLayout((prev) =>
                      prev === undefined
                        ? undefined
                        : { ...prev, extraSpacing: val }
                    )
                  }
                />

                <span>Extra Spacing</span>
              </div>

              {/* CUSTOM BG */}
              <div className="flex items-center justify-start gap-2 scale-95 pt-6 -translate-x-2">
                <Input
                  type="color"
                  errorCheck={false}
                  isRequired={false}
                  name="bg-color"
                  validCheck={false}
                  labelConfig={{ label: "Custom Background" }}
                  customValue={{
                    value: layout.customBG || "#000",
                    setValue: (shade: string) => {
                      setLayout((prev) =>
                        prev
                          ? {
                              ...prev,
                              customBG:
                                shade === "#000" || shade === "#000000"
                                  ? undefined
                                  : shade
                            }
                          : undefined
                      );
                    }
                  }}
                />
              </div>
            </section>

            {/* PREVIEW */}
            <section className="pl-7 sticky top-5">
              {layout &&
              layout.layout &&
              layout.layout.collage &&
              layout.layout.collage.type &&
              layout.layout.collage.images.length > 0 ? (
                <>
                  <div className="text-center pb-8 font-light text-2xl">
                    Preview
                  </div>
                  <CollageTiles
                    asPreview
                    tiles={{
                      _id: "",
                      layoutType: layout.layout.collage.type,
                      contents: (
                        layout.layout.collage.images as QuickLinkDocument[]
                      ).map(({ label, path, image }) => {
                        const imgDoc =
                          typeof image === "string"
                            ? allImages.find((i) => String(i._id) === String(image))
                            : (image as unknown as ImageDocument);
                        return {
                          title: label,
                          link: path,
                          image: {
                            alt:
                              imgDoc?.alt || imgDoc?.defaultAlt || "",
                            url: imgDoc?.url || ""
                          }
                        };
                      })
                    }}
                  />
                </>
              ) : (
                <div className="text-charcoal-3 pt-5 flex flex-col items-center justify-start gap-4">
                  <PictureInPicture2
                    strokeWidth={1}
                    width={42}
                    height={42}
                  />
                  <span className="text-sm">
                    Insert sufficient data to show preview
                  </span>
                </div>
              )}
            </section>
          </div>
        </>
      ) : tag === "category" ? (
        <>
          {/*##############################################################################################################
      ##################################### CATEGORY #####################################################################
      ##############################################################################################################*/}
          <div className="grid grid-cols-[1fr_1fr] items-start justify-start relative w-full">
            <section className="flex flex-col justify-start pr-7 h-full border-r border-charcoal-3/20 ">
              {/* SELECT SHAPE ================================ */}
              <div className="text-sm pt-8 flex items-center justify-start gap-3 *:px-3.5 *:py-1 *:rounded-lg *:border *:border-rose-500 *:transition-all *:duration-300 *:cursor-pointer">
                <div
                  className={
                    layout.layout?.category?.shape === "circle"
                      ? "bg-rose-500 text-white"
                      : "hover:bg-rose-100 bg-rose-50 text-rose-700"
                  }
                  onClick={() =>
                    setLayout((prev) =>
                      prev
                        ? {
                            ...prev,
                            layout: {
                              category: prev.layout.category
                                ? { ...prev.layout.category, shape: "circle" }
                                : {
                                    _id: generateRandomId(20),
                                    images: [],
                                    columns: 4,
                                    shape: "circle",
                                  },
                            } as PageLayoutDocument,
                            isModified: true,
                          }
                        : undefined,
                    )
                  }
                >
                  Circle shape
                </div>
                <div
                  className={
                    layout.layout?.category?.shape === "square"
                      ? "bg-rose-500 text-white"
                      : "hover:bg-rose-100 bg-rose-50 text-rose-700"
                  }
                  onClick={() =>
                    setLayout((prev) =>
                      prev
                        ? {
                            ...prev,
                            layout: {
                              category: prev.layout.category
                                ? { ...prev.layout.category, shape: "square" }
                                : {
                                    _id: generateRandomId(20),
                                    images: [],
                                    columns: 4,
                                    shape: "square",
                                  },
                            } as PageLayoutDocument,
                            isModified: true,
                          }
                        : undefined,
                    )
                  }
                >
                  Square shape
                </div>
              </div>

              {layout.layout.category?.shape &&
              ["circle", "square"].includes(layout.layout.category?.shape) ? (
                <>
                  {/* SCROLLABLE ================================ */}
                  <div className=" pt-7 flex items-center justify-start gap-2">
                    <CustomToggle
                      label=""
                      toggled={layout.layout.category?.scrollable || false}
                      onToggle={(val: boolean) =>
                        setLayout((prev) =>
                          prev === undefined
                            ? undefined
                            : {
                                ...prev,
                                layout: {
                                  category: prev.layout.category
                                    ? {
                                        ...prev.layout.category,
                                        scrollable: val,
                                      }
                                    : {
                                        _id: generateRandomId(20),
                                        scrollable: val,
                                        columns: 4,
                                        shape: "square",
                                        images: [],
                                      },
                                } as PageLayoutDocument,
                                isModified: true,
                              },
                        )
                      }
                    />

                    <span>Scrollable</span>
                  </div>

                  {/* SELECT COLUMNS ================================ */}
                  {layout.layout.category &&
                  !layout.layout.category?.scrollable ? (
                    <div className="text-sm pt-3 flex items-center justify-start gap-3 *:px-3.5 *:py-1 *:rounded-lg *:border *:border-rose-500 *:transition-all *:duration-300 *:cursor-pointer">
                      {[2, 3, 4, 5, 6, 8].map((cols) => (
                        <div
                          className={
                            layout.layout?.category?.columns === cols &&
                            imgFreq >= 0
                              ? "bg-rose-500 text-white whitespace-nowrap"
                              : "hover:bg-rose-100 bg-rose-50 text-rose-700 whitespace-nowrap"
                          }
                          onClick={() => {
                            setImgFreq((prev) => {
                              switch (cols) {
                                case 2:
                                  return 6;
                                case 3:
                                  return 9;
                                case 4:
                                  return 8;
                                case 5:
                                  return 10;
                                case 6:
                                  return 12;
                                case 8:
                                  return 8;
                              }
                              return 8;
                            });
                            setLayout((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    layout: {
                                      category: prev.layout.category
                                        ? ({
                                            ...prev.layout.category,
                                            columns: cols,
                                            scrollable: false,
                                          } as LayoutCategoryDocument)
                                        : {
                                            _id: generateRandomId(20),
                                            shape: "square",
                                            columns: cols,
                                            categories: [],
                                            scrollable: false,
                                            images: [],
                                          },
                                    } as PageLayoutDocument,
                                  }
                                : undefined,
                            );
                          }}
                          key={cols}
                        >
                          {cols} cols
                        </div>
                      ))}
                    </div>
                  ) : (
                    <></>
                  )}

                  {/* SELECT IMAGES ================================ */}
                  {layout.layout.category &&
                  (layout.layout.category?.scrollable ||
                    (!layout.layout.category?.scrollable && imgFreq >= 0)) ? (
                    <>
                      <div className="min-w-max py-5 ">
                        <SelectImage
                          name=""
                          selectMultiple
                          maxSelections={imgFreq}
                          label=""
                          className="max-w-[500px]"
                          onChangeValue={(selectedIds: string[]) => {
                            const prevImages =
                              layout.layout.category &&
                              layout.layout.category?.images
                                ? (layout.layout.category
                                    .images as QuickLinkDocument[])
                                : [];

                            const prevIds = prevImages.map(({ image }) =>
                              typeof image === "string"
                                ? image
                                : (image as ImageDocument)?._id || "",
                            );

                            if (
                              selectedIds.length === prevIds.length &&
                              selectedIds.every((id, i) => id === prevIds[i])
                            )
                              return;

                            const newImages = selectedIds.map((id) => {
                              const existingImage = prevImages.find((img) => {
                                const imgId =
                                  typeof img.image === "string"
                                    ? img.image
                                    : (img.image as ImageDocument)?._id;
                                return imgId === id;
                              });
                              if (existingImage) return existingImage;

                              const img = allImages.find(
                                (img) => String(img._id) === String(id),
                              );
                              return {
                                _id: generateRandomId(20),
                                label: "",
                                path: "",
                                image: img,
                              };
                            }) as QuickLinkDocument[];

                            setLayout((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    layout: {
                                      category:
                                        prev.layout && prev.layout.category
                                          ? {
                                              ...prev.layout.category,
                                              images: newImages,
                                            }
                                          : {
                                              images: newImages,
                                              columns: 4,
                                              shape: "square",
                                              scrollable: false,
                                              _id: generateRandomId(20),
                                            },
                                    } as any,
                                  }
                                : undefined,
                            );
                          }}
                          value={
                            (layout.layout.category &&
                            layout.layout.category?.images
                              ? (
                                  layout.layout.category
                                    .images as QuickLinkDocument[]
                                )
                                  .filter((x) => x !== undefined)
                                  .map((lt) =>
                                    typeof lt.image === "string"
                                      ? lt.image
                                      : (lt.image as ImageDocument)?._id || "",
                                  )
                                  .filter((x) => x !== "")
                              : []) as string[]
                          }
                          manage="image"
                        />
                      </div>

                      {/* ENTER ADDITIONAL DETAILS ============================================ */}
                      {layout.layout.category &&
                      layout.layout.category?.images &&
                      ((layout.layout.category?.scrollable === true &&
                        (layout.layout.category?.images as QuickLinkDocument[])
                          .map(({ image }) => image)
                          .filter((x) => x !== undefined && x !== "").length >
                          0) ||
                        (layout.layout.category?.scrollable === false &&
                          allowedImageCounts(imgFreq).includes(
                            (
                              layout.layout.category
                                .images as QuickLinkDocument[]
                            )
                              .map(({ image }) => image)
                              .filter((x) => x !== undefined && x !== "")
                              .length,
                          ))) ? (
                        <div className="flex flex-col justify-start items-start py-4">
                          <span className="text-2xl font-light">Edit Data</span>
                          <div
                            className={`${layout.layout.category?.scrollable === true ? "flex items-center justify-start overflow-auto" : `grid grid-cols-2 sm:grid-cols-${layout.layout.category?.columns || 2}`} ${layout.layout.category?.shape === "square" ? "*:rounded-lg" : "*:rounded-full"} *:aspect-square auto-rows-min gap-2.5 pt-3.5 scrollbar-hide w-full max-w-[600px]`}
                          >
                            {(
                              (layout.layout.category?.images as any[]) || []
                            ).map((imageItem, index) => (
                              <Popover key={imageItem?._id || index}>
                                <PopoverTrigger asChild>
                                  <div
                                    className={`bg-charcoal-3/15 grid place-items-center transition-all duration-300 cursor-pointer hover:bg-charcoal-3/25 w-full`}
                                    key={index}
                                  >
                                    {index + 1}
                                  </div>
                                </PopoverTrigger>

                                <PopoverContent
                                  side="right"
                                  sideOffset={10}
                                  className="flex flex-col justify-start outline-none border-none rounded-2xl !z-[950] px-5 relative w-[400px]"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xl font-light pt-1 pb-1.5">
                                      Tile No. {index + 1}
                                    </span>
                                    <div className=" text-xs text-blue-500">
                                      Use tab to navigate
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-[40px_1fr] items-center">
                                    <span className="text-charcoal-3 translate-y-px">
                                      <PictureInPicture2
                                        strokeWidth={1.5}
                                        width={17}
                                        height={17}
                                      />
                                    </span>
                                    <div className="py-2 mb-2">
                                      <SelectImage
                                        name={`image-${index}`}
                                        manage="image"
                                        selectMultiple={false}
                                        value={
                                          (layout.layout.category &&
                                          layout.layout.category?.images
                                            ? (() => {
                                                const img = (
                                                  layout.layout.category
                                                    .images as QuickLinkDocument[]
                                                )[index]?.image;
                                                if (typeof img === "string")
                                                  return img;
                                                return (
                                                  (img as ImageDocument)?._id ||
                                                  ""
                                                );
                                              })()
                                            : "") as any
                                        }
                                        onChangeValue={(newId) => {
                                          const img = allImages.find(
                                            (i) => String(i._id) === String(newId),
                                          );
                                          if (!img) return;
                                          setLayout((prev) =>
                                            prev
                                              ? ({
                                                  ...prev,
                                                  isModified: true,
                                                  layout: {
                                                    ...prev.layout,
                                                    category: {
                                                      ...(prev.layout
                                                        .category || {}),
                                                      images: (
                                                        prev.layout.category
                                                          ?.images as any[]
                                                      ).map((item, i) =>
                                                        i === index
                                                          ? {
                                                              ...item,
                                                              image: img,
                                                            }
                                                          : item,
                                                      ),
                                                    } as any,
                                                  } as any,
                                                } as any)
                                              : undefined,
                                          );
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-[40px_1fr] items-center">
                                    <span className="text-charcoal-3 translate-y-px">
                                      <Tag
                                        strokeWidth={1.5}
                                        width={17}
                                        height={17}
                                      />
                                    </span>
                                    <Input
                                      type="text"
                                      errorCheck={false}
                                      validCheck={false}
                                      isRequired={false}
                                      name="label"
                                      customStyle={`${customInputStyle} !min-w-[300px] !max-w-[300px]`}
                                      customValue={{
                                        value:
                                          layout.layout.category &&
                                          layout.layout.category?.images
                                            ? (
                                                layout.layout.category
                                                  .images as QuickLinkDocument[]
                                              ).at(index)?.label || ""
                                            : "",
                                        setValue: (str: string) => {
                                          setLayout((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  isModified: true,
                                                  layout: {
                                                    ...prev.layout,
                                                    category: prev.layout
                                                      .category
                                                      ? {
                                                          ...prev.layout
                                                            .category,
                                                          images:
                                                            prev.layout.category
                                                              .images.length > 0
                                                              ? (
                                                                  prev.layout
                                                                    .category
                                                                    .images as QuickLinkDocument[]
                                                                ).map(
                                                                  (img, i) =>
                                                                    i === index
                                                                      ? {
                                                                          ...img,
                                                                          label:
                                                                            str,
                                                                        }
                                                                      : img,
                                                                )
                                                              : [
                                                                  {
                                                                    _id: generateRandomId(
                                                                      20,
                                                                    ),
                                                                    label: str,
                                                                    path: "",
                                                                  },
                                                                ],
                                                        }
                                                      : {},
                                                  } as any,
                                                }
                                              : undefined,
                                          );
                                        },
                                      }}
                                      placeholder="Label"
                                    />

                                    <span className="text-charcoal-3 translate-y-px">
                                      <Hash
                                        strokeWidth={1.5}
                                        width={17}
                                        height={17}
                                      />
                                    </span>
                                    <Input
                                      type="text"
                                      errorCheck={false}
                                      validCheck={false}
                                      isRequired={false}
                                      name="path"
                                      customStyle={`${customInputStyle} !min-w-[300px] !max-w-[300px]`}
                                      customValue={{
                                        value:
                                          layout.layout.category &&
                                          layout.layout.category?.images
                                            ? (
                                                layout.layout.category
                                                  .images as QuickLinkDocument[]
                                              ).at(index)?.path || ""
                                            : "",
                                        setValue: (str: string) => {
                                          setLayout((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  isModified: true,
                                                  layout: {
                                                    ...prev.layout,
                                                    category: prev.layout
                                                      .category
                                                      ? {
                                                          ...prev.layout
                                                            .category,
                                                          images:
                                                            prev.layout.category
                                                              .images.length > 0
                                                              ? (
                                                                  prev.layout
                                                                    .category
                                                                    .images as QuickLinkDocument[]
                                                                ).map(
                                                                  (img, i) =>
                                                                    i === index
                                                                      ? {
                                                                          ...img,
                                                                          path: str,
                                                                        }
                                                                      : img,
                                                                )
                                                              : [
                                                                  {
                                                                    _id: generateRandomId(
                                                                      20,
                                                                    ),
                                                                    path: str,
                                                                    label: "",
                                                                  },
                                                                ],
                                                        }
                                                      : {},
                                                  } as any,
                                                }
                                              : undefined,
                                          );
                                        },
                                      }}
                                      placeholder="Path"
                                    />

                                    <div className="col-span-2 pt-4 mt-2 border-t border-charcoal-3/10 w-full">
                                      <Button
                                        variant="ghost"
                                        className="w-full !text-rose-500 hover:!bg-rose-50 !justify-start !px-3 h-11 flex items-center gap-3 transition-all duration-300 rounded-xl"
                                        onClick={() => {
                                          setLayout((prev) => {
                                            if (
                                              !prev ||
                                              !prev.layout?.category?.images
                                            )
                                              return prev;

                                            const newImages = (
                                              prev.layout.category
                                                .images as QuickLinkDocument[]
                                            ).filter((_, i) => i !== index);

                                            return {
                                              ...prev,
                                              isModified: true,
                                              layout: {
                                                ...prev.layout,
                                                category: {
                                                  ...prev.layout.category,
                                                  images: newImages,
                                                },
                                              } as any,
                                            };
                                          });
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="font-semibold text-sm">
                                          Delete This Tile
                                        </span>
                                      </Button>
                                    </div>

                                    <span className="text-charcoal-3 translate-y-px">
                                      <ListOrderedIcon
                                        strokeWidth={1.5}
                                        width={17}
                                        height={17}
                                      />
                                    </span>
                                    <Input
                                      type="number"
                                      errorCheck={false}
                                      validCheck={false}
                                      isRequired={false}
                                      name="order"
                                      customStyle={`${customInputStyle} !min-w-[300px] !max-w-[300px]`}
                                      customValue={{
                                        value: String(index + 1),
                                        setValue: (str: string) => {
                                          const indexToSwap = index;
                                          const indexToSwapWith = Math.min(
                                            (layout.layout.category?.images?.length || 1) - 1,
                                            Math.max(0, parseInt(str) - 1),
                                          );
                                          if (indexToSwap === indexToSwapWith)
                                            return;

                                          setLayout((prev) => {
                                            if (
                                              !prev ||
                                              !prev.layout?.category?.images
                                            )
                                              return prev;

                                            const images = prev.layout.category
                                              .images as QuickLinkDocument[];
                                            const imageObj =
                                              (images.at(indexToSwap)
                                                ?.image as ImageDocument) ||
                                              undefined;
                                            const imageObjBeingSwapped =
                                              (images.at(indexToSwapWith)
                                                ?.image as ImageDocument) ||
                                              undefined;

                                            return {
                                              ...prev,
                                              isModified: true,
                                              layout: {
                                                ...prev.layout,
                                                category: {
                                                  ...prev.layout.category,
                                                  images: images.map(
                                                    (img, i) =>
                                                      i === indexToSwap
                                                        ? {
                                                            ...img,
                                                            image:
                                                              imageObjBeingSwapped,
                                                          }
                                                        : i === indexToSwapWith
                                                          ? {
                                                              ...img,
                                                              image: imageObj,
                                                            }
                                                          : img,
                                                  ),
                                                },
                                              } as any,
                                            };
                                          });
                                        },
                                      }}
                                      placeholder="Image"
                                    />
                                  </div>
                                </PopoverContent>
                              </Popover>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-red-500">
                          Select{" "}
                          {layout.layout.category?.scrollable === true
                            ? `at least 1`
                            : `total ${allowedImageCounts(imgFreq)[0] || 4} to ${imgFreq}`}{" "}
                          images to continue forward.
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-red-500 py-5">
                      Select desired column count
                    </div>
                  )}

                  {/* EXTRA SPACING ============================================ */}
                  <div className="flex items-center justify-start gap-2 pt-8">
                    <CustomToggle
                      label=""
                      toggled={(layout as any).extraSpacing || false}
                      onToggle={(val: boolean) =>
                        setLayout((prev) =>
                          prev === undefined
                            ? undefined
                            : { ...prev, extraSpacing: val, isModified: true },
                        )
                      }
                    />

                    <span>Extra Spacing</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-red-500 text-sm py-5">
                    Select a shape to proceed
                  </div>
                </>
              )}

              {/* CUSTOM BG */}
              <div className="flex items-center justify-start gap-2 scale-95 pt-6 -translate-x-2">
                <Input
                  type="color"
                  errorCheck={false}
                  isRequired={false}
                  name="bg-color"
                  validCheck={false}
                  labelConfig={{ label: "Custom Background" }}
                  customValue={{
                    value: layout.customBG || "#000",
                    setValue: (shade: string) => {
                      setLayout((prev) =>
                        prev
                          ? {
                              ...prev,
                              customBG:
                                shade === "#000" || shade === "#000000"
                                  ? undefined
                                  : shade,
                            }
                          : undefined,
                      );
                    },
                  }}
                />
              </div>
            </section>

            {/* PREVIEW ============================================ */}
            <section className="pl-7 sticky top-5 w-full min-w-0 overflow-hidden">
              {layout &&
              layout.layout &&
              layout.layout.category &&
              layout.layout.category?.shape &&
              layout.layout.category?.columns &&
              layout.layout.category?.images.length > 0 &&
              layout.layout.category &&
              layout.layout.category?.images &&
              ((layout.layout.category?.scrollable === true &&
                (layout.layout.category?.images as QuickLinkDocument[])
                  .map(({ image }) => image)
                  .filter((x) => x !== undefined && x !== "").length > 0) ||
                (layout.layout.category?.scrollable === false &&
                  allowedImageCounts(imgFreq).includes(
                    (layout.layout.category?.images as QuickLinkDocument[])
                      .map(({ image }) => image)
                      .filter((x) => x !== undefined && x !== "").length,
                  ))) ? (
                <>
                  <div className="text-center pb-8 font-light text-2xl">
                    Preview
                  </div>
                  <UpdatedCategoryTiles
                    asPreview
                    columns={layout.layout.category?.columns || 4}
                    shape={layout.layout.category?.shape || "circle"}
                    scrollable={Boolean(layout.layout.category?.scrollable)}
                    categoryList={(
                      layout.layout.category?.images as QuickLinkDocument[]
                    ).map(({ _id, label, path, image }) => ({
                      _id: String(_id),
                      image: {
                        alt:
                          (image as ImageDocument)?.alt ||
                          (image as ImageDocument)?.defaultAlt ||
                          "",
                        url: (image as ImageDocument)?.url || "",
                      },
                      label,
                      link: path,
                    }))}
                  />
                </>
              ) : (
                <div className="text-charcoal-3 pt-5 flex flex-col items-center justify-start gap-4">
                  <PictureInPicture2 strokeWidth={1} width={42} height={42} />
                  <span className="text-sm">
                    Insert adequately correct data to show preview
                  </span>
                </div>
              )}
            </section>
          </div>
        </>
      ) : (
        <></>
      )}

      {/* TOP RIGHT GRADIENT ----------------- */}
      <div className="absolute -top-0.5 -right-0.5 h-36 w-3/5 bg-rose-200 [mask-image:radial-gradient(90%_90%_at_top_right,white_5%,transparent)]" />
    </section>
  );
}

// FOR BANNERS #####################################################################
const BannerImageRow = ({
  index,
  banner,
  setLayout,
  noBottomBorder,
  allImages
}: {
  index: number;
  banner: BannerImageDocument;
  setLayout: SetStateType<DynamicLayoutStructure | undefined>;
  noBottomBorder?: boolean;
  allImages: ImageDocument[];
}) => {
  return (
    <>
      {/* INDEX ------------------ */}
      <div
        className={`h-[161px] flex items-center justify-center italic font-medium text-charcoal-3 !border-l-0 text-center ${noBottomBorder ? "!border-b-0" : ""}`}
      >
        {index + 1}.
      </div>

      {/* DESKTOP IMAGE ------------------ */}
      <div
        className={`h-[161px] flex items-center justify-center ${noBottomBorder ? "!border-b-0" : ""}`}
      >
        <SelectImage
          manage="image"
          name=""
          isRequired={false}
          label=""
          selectMultiple={false}
          onChangeValue={(newValue: string) => {
            const relevantImageDoc = allImages.find(
              ({ _id }) => String(_id) === String(newValue)
            );
            if (relevantImageDoc) {
              setLayout((prev) =>
                prev
                  ? {
                      ...prev,
                      layout: {
                        banner: prev.layout.banner
                          ? {
                              ...prev.layout.banner,
                              images: prev.layout.banner.images.length
                                ? prev.layout.banner.images.map((img) =>
                                    img._id === banner._id
                                      ? { ...img, desktop: relevantImageDoc }
                                      : img
                                  )
                                : []
                            }
                          : undefined
                      } as unknown as PageLayoutDocument
                    }
                  : undefined
              );
            }
          }}
          value={
            (typeof banner.desktop === "string"
              ? banner.desktop
              : String((banner.desktop as ImageDocument)?._id || "")) || ""
          }
          className="!aspect-[15/9]"
          wrapperClassName="!border-0 !w-40 rounded-2xl h-32"
        />
      </div>

      {/* MOBILE IMAGE ------------------ */}
      <div
        className={`h-[161px] flex items-center justify-center ${noBottomBorder ? "!border-b-0" : ""}`}
      >
        <SelectImage
          manage="image"
          name=""
          isRequired={false}
          label=""
          selectMultiple={false}
          onChangeValue={(newValue: string) => {
            const relevantImageDoc = allImages.find(
              ({ _id }) => String(_id) === String(newValue)
            );
            if (relevantImageDoc) {
              setLayout((prev) =>
                prev
                  ? {
                      ...prev,
                      layout: {
                        banner: prev.layout.banner
                          ? {
                              ...prev.layout.banner,
                              images: prev.layout.banner.images.length
                                ? prev.layout.banner.images.map((img) =>
                                    img._id === banner._id
                                      ? { ...img, mobile: relevantImageDoc }
                                      : img
                                  )
                                : []
                            }
                          : undefined
                      } as unknown as PageLayoutDocument
                    }
                  : undefined
              );
            }
          }}
          value={
            (typeof banner.mobile === "string"
              ? banner.mobile
              : String((banner.mobile as ImageDocument)?._id || "")) || ""
          }
          className="!aspect-[15/9]"
          wrapperClassName="!border-0 !w-40 rounded-2xl h-32"
        />
      </div>

      {/* LINK ------------------ */}
      <div
        className={`h-[161px] flex items-center ${noBottomBorder ? "!border-b-0" : ""}`}
      >
        <Input
          type="text"
          errorCheck={false}
          validCheck={false}
          isRequired={false}
          name="link"
          placeholder="/link-to-page"
          customValue={{
            value: banner.path || "",
            setValue: (newVal: string) => {
              setLayout((prev) =>
                prev
                  ? {
                      ...prev,
                      layout: {
                        banner: prev.layout.banner
                          ? {
                              ...prev.layout.banner,
                              images: prev.layout.banner.images.length
                                ? prev.layout.banner.images.map((img) =>
                                    String(img._id) ===
                                    String(banner._id)
                                      ? { ...img, path: newVal }
                                      : img
                                  )
                                : []
                            }
                          : undefined
                      } as unknown as PageLayoutDocument
                    }
                  : undefined
              );
            }
          }}
          customStyle={`${customInputStyle} !w-auto !min-w-[100px] !py-0 !border-none`}
        />
      </div>

      {/* DELETE ------------------ */}
      <div
        onClick={() =>
          setLayout((prev) =>
            prev
              ? {
                  ...prev,
                  layout: {
                    banner: prev.layout.banner
                      ? {
                          ...prev.layout.banner,
                          images: prev.layout.banner.images.filter(
                            ({ _id }) =>
                              String(_id) !== String(banner._id)
                          )
                        }
                      : undefined
                  } as unknown as PageLayoutDocument
                }
              : undefined
          )
        }
        className={`h-[161px] flex items-center cursor-pointer transition-all duration-300 hover:text-red-500 hover:bg-red-50 ${noBottomBorder ? "!border-b-0" : ""}`}
      >
        <Trash2
          width={19}
          height={19}
          strokeWidth={1.5}
        />
      </div>
    </>
  );
};
