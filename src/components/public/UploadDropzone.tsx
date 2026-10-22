import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { Upload, Image as ImageIcon } from "lucide-react";

export function UploadDropzone() {
  const { t } = useLang();
  const [files, setFiles] = useState<string[]>([]);
  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-6 py-10 text-center transition hover:border-primary/60">
        <Upload className="h-6 w-6 text-primary" />
        <span className="text-sm font-medium">{t.janashabdam.form.upload}</span>
        <span className="text-xs text-muted-foreground">{t.janashabdam.form.uploadHint}</span>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const list = Array.from(e.target.files ?? []).map((f) => f.name);
            setFiles((prev) => [...prev, ...list].slice(0, 4));
          }}
        />
      </label>
      {files.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {files.map((f) => (
            <li key={f} className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-2 text-xs text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5 text-primary" /> <span className="truncate">{f}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}