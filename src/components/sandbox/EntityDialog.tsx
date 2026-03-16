"use client";

import * as React from "react";

type FieldType = "text" | "textarea" | "select";

export type EntityDialogOption = {
  label: string;
  value: string; // uuid or ""
};

export type EntityDialogField = {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;

  // For select fields
  options?: EntityDialogOption[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields: EntityDialogField[];
  initial?: Record<string, any>;
  submitLabel?: string;
  onSubmit: (values: Record<string, any>) => Promise<void>;
};

export default function EntityDialog({
  open,
  onClose,
  title,
  subtitle,
  fields,
  initial,
  submitLabel = "Create",
  onSubmit,
}: Props) {
  const [values, setValues] = React.useState<Record<string, any>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setValues(initial ?? {});
      setError(null);
      setSubmitting(false);
    }
  }, [open, initial]);

  if (!open) return null;

  const update = (key: string, val: any) =>
    setValues((v) => ({ ...v, [key]: val }));

  const validate = () => {
    for (const f of fields) {
      if (f.required) {
        const v = values[f.key];
        if (v === undefined || v === null || String(v).trim() === "") {
          return `${f.label} is required.`;
        }
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const vErr = validate();
    if (vErr) {
      setError(vErr);
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(values);
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-white">{title}</div>
            {subtitle ? (
              <div className="mt-1 text-sm text-white/60">{subtitle}</div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {fields.map((f) => {
            const t: FieldType = f.type ?? "text";
            const common =
              "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-white/20";

            return (
              <label key={f.key} className="block">
                <div className="mb-1 text-sm text-white/80">
                  {f.label}
                  {f.required ? <span className="text-red-400"> *</span> : null}
                </div>

                {t === "textarea" ? (
                  <textarea
                    className={common}
                    rows={5}
                    value={values[f.key] ?? ""}
                    placeholder={f.placeholder ?? ""}
                    onChange={(e) => update(f.key, e.target.value)}
                  />
                ) : t === "select" ? (
                  <select
                    className={common}
                    value={values[f.key] ?? ""}
                    onChange={(e) => update(f.key, e.target.value)}
                  >
                    <option value="">{f.placeholder ?? "Select..."}</option>
                    {(f.options ?? []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={common}
                    value={values[f.key] ?? ""}
                    placeholder={f.placeholder ?? ""}
                    onChange={(e) => update(f.key, e.target.value)}
                  />
                )}
              </label>
            );
          })}

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl border border-white/10 bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
