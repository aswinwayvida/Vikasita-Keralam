import { createFileRoute } from "@tanstack/react-router";
import { AdminMobilePreviewModal } from "@/components/admin/AdminMobilePreviewModal";

export const Route = createFileRoute("/mobile")({
  component: MobileStandalonePreviewPage,
});

function MobileStandalonePreviewPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-0 sm:p-4">
      <AdminMobilePreviewModal isOpen={true} standalone={true} />
    </div>
  );
}
