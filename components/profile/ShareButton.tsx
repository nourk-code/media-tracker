"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareButton() {
  function copy() {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  }

  return (
    <Button
      variant="outline"
      onClick={copy}
      className="border-white/20 text-white hover:bg-white/10 gap-2"
    >
      <Share2 className="w-4 h-4" />
      Share
    </Button>
  );
}
