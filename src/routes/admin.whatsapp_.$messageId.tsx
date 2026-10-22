import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCheck, Eye, MessageCircle, Send } from "lucide-react";
import { whatsappCampaigns } from "@/data/volunteers";
import { useLang } from "@/i18n/LanguageProvider";
export const Route = createFileRoute("/admin/whatsapp_/$messageId")({
  head: () => ({ meta: [{ title: "Message details · Admin" }] }),
  component: MessageDetails,
});
function MessageDetails() {
  const { messageId } = Route.useParams();
  const { lang } = useLang();
  const c = whatsappCampaigns.find((x) => x.id === messageId);
  if (!c)
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        Message not found
      </div>
    );
  const delivered = Math.round((c.delivered / c.sent) * 100);
  const read = Math.round((c.read / c.sent) * 100);
  return (
    <div className="space-y-5">
      <div>
        <Link
          to="/admin/whatsapp"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Citizen messages
        </Link>
        <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{c.name[lang]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sent on {new Date(c.date).toLocaleDateString("en-IN")}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={Send} value={c.sent.toLocaleString()} label="Sent" />
        <Metric
          icon={CheckCheck}
          value={`${delivered}%`}
          label={`${c.delivered.toLocaleString()} delivered`}
        />
        <Metric icon={Eye} value={`${read}%`} label={`${c.read.toLocaleString()} read`} />
      </div>
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-bold">Message preview</h2>
        </div>
        <div className="mt-4 max-w-2xl rounded-2xl rounded-tl-sm bg-secondary/10 p-4 text-sm leading-6">
          This is a preview of the citizen message. Final content and recipient details will appear
          here.
        </div>
      </section>
    </div>
  );
}
function Metric({ icon: Icon, value, label }: { icon: typeof Send; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
