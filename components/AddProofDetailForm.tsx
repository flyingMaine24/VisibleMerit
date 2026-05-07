"use client";

import { useState } from "react";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
};

export function AddProofDetailForm({ action }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="proof-detail-form">
      <button className="button secondary" onClick={() => setOpen((current) => !current)} type="button">
        Add more proof detail
      </button>
      {open && (
        <form action={action} className="field-stack">
          <label>
            Add one concrete proof detail
            <span>Example: volume handled, time saved, fewer errors, number of people trained, or what changed.</span>
            <textarea name="proofDetail" required />
          </label>
          <button type="submit">Update preview</button>
        </form>
      )}
    </div>
  );
}
