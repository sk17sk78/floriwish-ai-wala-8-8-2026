// config
import { OPTIMIZE_IMAGE } from "@/config/image";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { CustomSelectInputType, SelectedImages } from "./static/types";
import { IMAGE_MAX_SIZE } from "@/common/constants/imageMaxSize";
import { getImageProps } from "./utils/getImageProps";
import { getImgData } from "./utils/getImgData";
import NextImage from "@/components/custom/NextImage";
import { MousePointerClick, Plus, Trash, X } from "lucide-react";

export default function Select(props: CustomSelectInputType) {
  const {
    type,
    customValue,
    isRequired,
    multipleAllowed,
    name,
    showEmptyFieldError,
    className,
    customStyles,
    isDisabled,
    onImagesSelect
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<SelectedImages[]>([]);
  const [imgSelectedAtleastOnce, setImgSelectedAtleastOnce] =
    useState<boolean>(false);

  const handleMaskedInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImgFieldChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (files && files.length) {
      const imgArr: SelectedImages[] = [];

      for (let i = 0; i < files.length; i++) {
        const imgFile = files[i] as File;

        if (imgFile.size <= IMAGE_MAX_SIZE) {
          const imgData = await getImgData(imgFile);
          const img = await getImageProps(imgData);

          if (img && imgData) {
            const aboutImg: SelectedImages = {
              alt: imgFile.name
                .split(".")[0]
                .replace(/[^A-Za-z0-9\s]/g, "")
                .replace(/\s+/g, " "),
              data: imgData.split(",")[1],
              extension: imgFile.type.split("/")[1] || "webp",
              height: img.height,
              width: img.width,
              name: imgFile.name,
              size: imgFile.size,
              url: URL.createObjectURL(imgFile)
            };

            imgArr.push(aboutImg);
          }
        }
      }

      setImages((prev) => [...prev, ...imgArr]);
    }
  };

  const handleImgDelete = (imgSrc: string) =>
    setImages((prev) => prev.filter(({ url }) => url !== imgSrc));

  const deleteAllImages = () => setImages([]);

  useEffect(() => {
    if (images.length && !imgSelectedAtleastOnce)
      setImgSelectedAtleastOnce(true);
  }, [imgSelectedAtleastOnce, images]);

  useEffect(() => {
    onImagesSelect(images);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  return (
    <div
      className={` ${images.length ? "pb-4 pt-2 border" : "border-[3px] border-dashed"} ${showEmptyFieldError ? (images.length || !imgSelectedAtleastOnce ? "border-charcoal-3/30" : "border-rose-300/80") : "border-charcoal-3/30"} overflow-hidden rounded-xl mt-3 mb-5 gap-4`}
    >
      {images.length ? (
        <div className="flex flex-col justify-start">
          <div className="flex items-center justify-between px-4 pb-1.5 mb-5 border-b border-charcoal-3/30">
            <span className="text-lg font-medium">Selected Images ({images.length})</span>
            <div className="flex items-center justify-end gap-2">
              <div
                className="rounded-full transition-all duration-300 cursor-pointer p-2 hover:bg-charcoal-3/10"
                onClick={handleMaskedInputClick}
                title="Add more images"
              >
                <Plus
                  strokeWidth={1.5}
                  height={22}
                  width={22}
                />
              </div>

              <div
                className="rounded-full transition-all duration-300 cursor-pointer p-2 hover:bg-rose-100 hover:text-rose-500"
                onClick={deleteAllImages}
                title="Clear all"
              >
                <Trash
                  strokeWidth={1.5}
                  height={22}
                  width={22}
                  className="scale-90"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 px-4 py-2">
            {images.map(({ url, alt }, index) => {
              return (
                <div
                  key={index}
                  className="relative rounded-xl border border-charcoal-3/30 overflow-hidden flex items-center justify-center aspect-square shadow-xs group"
                >
                  <NextImage
                    src={url}
                    alt={alt || "Image"}
                    draggable={false}
                    height={100}
                    width={500}
                    className="w-full h-full object-cover object-center rounded-xl"
                  />
                  <div
                    onClick={() => handleImgDelete(url)}
                    className="absolute top-1.5 right-1.5 rounded-full bg-red-600/90 text-white p-1 cursor-pointer transition-all duration-200 hover:bg-red-700 shadow-md"
                  >
                    <X
                      strokeWidth={2}
                      width={14}
                      height={14}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // NO IMAGE SELECTED YET
        <div
          onClick={handleMaskedInputClick}
          className={`cursor-pointer flex items-center justify-center flex-col gap-2 py-12 px-5 w-full text-center hover:bg-zinc-50/60 transition-colors ${imgSelectedAtleastOnce && showEmptyFieldError ? "text-rose-400 bg-rose-50/50" : "text-charcoal-3/60"} ${className || ""}`}
        >
          <MousePointerClick
            strokeWidth={1.5}
            width={36}
            height={36}
            className="text-emerald-600"
          />
          <span className="text-sm font-medium text-zinc-700">
            {imgSelectedAtleastOnce && showEmptyFieldError
              ? props.emptyFieldErrorText
              : "Click to Browse & Upload Images"}
          </span>
          <span className="text-[11px] text-zinc-400">JPG, PNG, WEBP up to 5MB</span>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        name={name}
        accept={
          type === "image"
            ? "image/*"
            : type === "video"
              ? "video/*"
              : type === "pdf"
                ? "application/pdf"
                : ""
        }
        multiple={multipleAllowed}
        className="hidden"
        required={isRequired || false}
        disabled={isDisabled || false}
        onChange={handleImgFieldChange}
      />
    </div>
  );
}
