// components
import CartDeliveryAddressContent from "./CartCheckoutDetail";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function CartCheckoutDialog({
  showDialog,
  onChangeShowDialog
}: {
  showDialog: boolean;
  onChangeShowDialog: (showDialog: boolean) => void;
}) {
  return (
    <Dialog
      open={showDialog}
      onOpenChange={onChangeShowDialog}
    >
      <DialogContent className="outline-none z-[950] border-none p-0 bg-ivory-1 w-[calc(100%-24px)] sm:w-full h-[92dvh] sm:h-[85dvh] max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:bottom-4 max-sm:top-auto max-sm:translate-y-0 sm:max-w-[520px] sm:rounded-2xl max-sm:rounded-2xl overflow-hidden flex flex-col gap-0 shadow-2xl">
        <div className="flex-1 min-h-0">
          <CartDeliveryAddressContent
            onClose={() => {
              onChangeShowDialog(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
