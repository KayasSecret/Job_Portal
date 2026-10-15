import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Premium animated deletion confirmation modal.
 * Shows the exact item name, cascading impact warning, and protects against accidental deletion.
 */
const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  title = "Delete Record",
  itemName = "",
  itemType = "record",
  warningMessage,
  onConfirm,
  deleting = false,
}) => {
  const getWarning = () => {
    if (warningMessage) return warningMessage;
    if (itemType === "company") {
      return "Deleting this company will permanently remove all associated job requisitions, candidate pipelines, and brand assets. This action cannot be undone.";
    }
    if (itemType === "job") {
      return "Deleting this requisition will permanently remove all candidate applications and pipeline data linked to this role. This action cannot be undone.";
    }
    if (itemType === "applicant") {
      return "Removing this candidate will permanently delete their application from this hiring pipeline. This action cannot be undone.";
    }
    return "This action is permanent and cannot be undone.";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-3xl p-6 bg-white border border-rose-100 shadow-[0_25px_60px_-15px_rgba(244,63,94,0.25)] z-[100]">
        <DialogHeader className="flex flex-col items-center text-center">
          {/* Animated Danger Badge */}
          <motion.div
            initial={{ scale: 0.8, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center mb-4 shadow-inner"
          >
            <Trash2 size={26} className="text-rose-600" />
          </motion.div>

          <DialogTitle className="text-xl font-black text-gray-950 tracking-tight">
            {title}
          </DialogTitle>

          <DialogDescription className="text-xs text-gray-500 mt-1 max-w-sm">
            Please confirm that you want to proceed with this permanent deletion.
          </DialogDescription>
        </DialogHeader>

        {/* Item preview card */}
        <div className="my-4 p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100/90 text-left">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-gray-700">Item to remove: </span>
              <span className="font-extrabold text-gray-900 break-words">
                "{itemName || "Selected item"}"
              </span>
              <p className="mt-1 text-gray-500 leading-relaxed text-[11.5px]">
                {getWarning()}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={() => onOpenChange(false)}
            className="h-10 px-4 rounded-xl border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Delete Permanently</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
