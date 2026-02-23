"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePatchItem } from "@/lib/hooks/useCollection";
import { toast } from "sonner";
import type { CollectionItem, MediaStatus } from "@/lib/types/collection";
import { STATUS_LABELS } from "@/lib/types/collection";

interface EditMediaDialogProps {
  item: CollectionItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMediaDialog({
  item,
  open,
  onOpenChange,
}: EditMediaDialogProps) {
  const [status, setStatus] = useState<MediaStatus>(item.status);
  const NO_RATING_VALUE = "__none__";
  const [rating, setRating] = useState<string>(
    item.user_rating != null ? String(item.user_rating) : NO_RATING_VALUE
  );
  const [notes, setNotes] = useState(item.user_notes ?? "");
  const patchItem = usePatchItem();

  async function handleSave() {
    await patchItem.mutateAsync({
      id: item.id,
      update: {
        status,
        user_rating:
        rating && rating !== NO_RATING_VALUE ? parseInt(rating) : null,
        user_notes: notes || null,
        date_completed:
          status === "completed" && !item.date_completed
            ? new Date().toISOString().split("T")[0]
            : item.date_completed,
      },
    });
    toast.success("Updated!");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#13131f] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">{item.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-gray-300">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as MediaStatus)}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/10">
                {(Object.keys(STATUS_LABELS) as MediaStatus[]).map((s) => (
                  <SelectItem key={s} value={s} className="text-white">
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-gray-300">Your Rating (1–10)</Label>
            <Select
              value={rating}
              onValueChange={setRating}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="No rating" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/10">
                <SelectItem value={NO_RATING_VALUE} className="text-white">
                  No rating
                </SelectItem>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={String(n)} className="text-white">
                    {n} / 10
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-gray-300">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Your thoughts..."
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-gray-400"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={patchItem.isPending}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {patchItem.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
