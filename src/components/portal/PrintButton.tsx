"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Uses the browser's print dialog — choose "Save as PDF" to download. */
export function PrintButton() {
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Download size={18} aria-hidden /> Download receipt (PDF)
    </Button>
  );
}
