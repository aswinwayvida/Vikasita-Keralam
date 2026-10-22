import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";

export function GeneratedTextDialog({ open, onOpenChange, title, text }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; text: string;
}) {
  const { t } = useLang();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-4 font-sans text-sm leading-relaxed">{text}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t.common.close}</Button>
          <Button onClick={() => { void navigator.clipboard.writeText(text); toast.success(t.common.copied); }}>
            <Copy className="mr-1.5 h-3.5 w-3.5" /> {t.common.copy}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}