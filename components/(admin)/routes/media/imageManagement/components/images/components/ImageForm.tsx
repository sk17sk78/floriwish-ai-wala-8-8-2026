"use client";

// icons
import { ImagePlus } from "lucide-react";

// hooks
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "@/store/withType";
import { useToast } from "@/components/ui/use-toast";

// redux
import { selectFolder } from "@/store/features/media/folderSlice";

// components
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import Input from "@/lib/Forms/Input/Input";
import Select from "@/lib/Forms/FileSelect/ImageSelectInput";
import Submit from "@/lib/Forms/Submit_Reset/Submit";

// types
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type SelectedImages } from "@/lib/Forms/FileSelect/static/types";

export default function ImageForm(
  props: {
    userName?: string;
    onUpload: (images: ImageDocument[]) => void;
  } & (
    | {
        withFolders?: false;
      }
    | {
        withFolders: true;
        selectedFolder: string;
      }
  )
) {
  // props
  const { userName, withFolders, onUpload } = props;

  // hooks
  const { toast } = useToast();

  const { documents: folders, options: folderOptions } = useSelector((state) =>
    selectFolder.documentList(state, {
      deleted: false,
      sortBy: "label",
      orderBy: "asc"
    })
  );

  // states
  const [open, setOpen] = useState(false);
  const [folderId, setFolderId] = useState<string>(
    withFolders ? props.selectedFolder : ""
  );
  const [selectedImages, setSelectedImages] = useState<ImageDocument[]>([]);

  // event handlers
  const handleSelectImages = (incomingImages: SelectedImages[]) => {
    const folder =
      withFolders && folderId
        ? folders.find(({ _id }) => String(_id) === String(folderId))
        : undefined;

    setSelectedImages(
      incomingImages.map(
        ({ alt, extension, width, height, size, data }) =>
          ({
            defaultAlt: alt,
            width,
            height,
            extension,
            data,
            size,
            ...(withFolders
              ? {
                  folderId: folder?._id || "",
                  folderName: folder?.name || ""
                }
              : {}),
            createdBy: userName || "Admin",
            updatedBy: userName || "Admin"
          }) as ImageDocument
      )
    );
  };

  const handleUpload = () => {
    if (!selectedImages.length) {
      toast({
        title: "WARNING",
        description: "No Images Selected",
        variant: "warning"
      });
      return;
    }

    if (withFolders && !folderId) {
      toast({
        title: "WARNING",
        description: "Please select a folder to upload image",
        variant: "warning"
      });
      return;
    }

    onUpload(selectedImages);
    setOpen(false);
    setSelectedImages([]);
    toast({
      title: "SUCCESS",
      description: `${selectedImages.length} image(s) uploaded successfully`,
      variant: "success"
    });
  };

  useEffect(() => {
    if (withFolders) {
      const folder = folderId
        ? folders.find(({ _id }) => String(_id) === String(folderId))
        : undefined;

      setSelectedImages((prevImages) =>
        prevImages.map(
          (selectedImage) =>
            ({
              ...selectedImage,
              ...(withFolders
                ? {
                    folderId: folder?._id || "",
                    folderName: folder?.name || ""
                  }
                : {})
            }) as ImageDocument
        )
      );
    }
  }, [withFolders, folders, folderId]);

  useEffect(() => {
    if ("selectedFolder" in props) {
      setFolderId(props.selectedFolder);
    }
  }, [props]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Upload New Image"
          className="p-1.5 transition-all duration-300 hover:bg-emerald-100/50 hover:text-emerald-700 active:scale-95 aspect-square rounded-full flex items-center justify-center border-none bg-transparent cursor-pointer"
        >
          <ImagePlus
            strokeWidth={1.5}
            width={24}
            height={24}
          />
        </button>
      </DialogTrigger>
      <DialogContent
        overlayClassName="!z-[100001]"
        className="sm:min-w-[600px] md:min-w-[760px] flex flex-col justify-start gap-0 overflow-auto scrollbar-hide !z-[100002]"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-900 pb-2">
            Upload Image(s)
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {withFolders && (
            <Input
              type="dropdown"
              isRequired
              errorCheck={false}
              validCheck={false}
              labelConfig={{
                label: "Folder",
                layoutStyle: "grid grid-cols-[140px_1fr] items-center"
              }}
              name="folder"
              nullOption
              customInitialValuePlaceholderLabel="Select Folder"
              className="my-2"
              options={folderOptions}
              customValue={{
                value: folderId,
                setValue: setFolderId
              }}
            />
          )}
          <Select
            type="image"
            isRequired
            labelConfig={{ label: "Images" }}
            name="images"
            multipleAllowed
            showEmptyFieldError={true}
            emptyFieldErrorText="At least one image is required"
            onImagesSelect={handleSelectImages}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer"
              onClick={() => {
                setSelectedImages([]);
              }}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleUpload}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              Upload
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
