"use client";

import { useState } from "react";
import SaleApplicationDrawer, { type SaleApplicationDetail } from "./SaleApplicationDrawer";

export default function SaleApplicationViewButton({ application }: { application: SaleApplicationDetail }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-bold text-brand-blue hover:underline">
        Xem hồ sơ
      </button>
      {open && <SaleApplicationDrawer application={application} onClose={() => setOpen(false)} />}
    </>
  );
}
