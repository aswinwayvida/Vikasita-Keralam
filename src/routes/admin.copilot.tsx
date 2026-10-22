import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, User, Send } from "lucide-react";

export const Route = createFileRoute("/admin/copilot")({
  head: () => ({ meta: [{ title: "AI Copilot · Admin" }] }),
  component: CopilotPage,
});

type Msg = { role: "user" | "assistant"; text: string };

function CopilotPage() {
  const { lang, t } = useLang();
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: lang === "ml" ? "നമസ്കാരം, സ്റ്റേറ്റ് അഡ്മിൻ. നിങ്ങൾ എന്താണ് അറിയേണ്ടത്?" : "Hello, State Admin. What would you like to know?" },
  ]);

  const prompts = [
    "ഏത് പഞ്ചായത്തുകളിലാണ് ഏറ്റവും കൂടുതൽ തെരുവുനായ പരാതികൾ?",
    "Generate a Malayalam memorandum for verified stray dog complaints in Kollam municipality.",
    "Summarise top public issues in Kollam district this week.",
    "Draft a responsible public statement without making unverified allegations.",
  ];

  function send(text: string) {
    if (!text.trim()) return;
    const reply = lang === "ml"
      ? `SahAI മറുപടി. "${text}" — ബന്ധപ്പെട്ട വിവരങ്ങൾ ഡാഷ്ബോർഡുകളിൽ ലഭ്യമാണ്.`
      : `SahAI response. "${text}" — supporting data is available in the dashboards.`;
    setMsgs((m) => [...m, { role: "user", text }, { role: "assistant", text: reply }]);
    setInput("");
  }

  return (
    <div className="space-y-4">
      <h1 className="section-underline font-display text-2xl font-bold">{t.admin.copilot}</h1>
      <div className="rounded-xl border border-border bg-card">
        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-5">
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Bot className="h-3.5 w-3.5" /></span>}
              <div className={m.role === "user" ? "max-w-xl rounded-2xl rounded-tr-sm bg-primary px-4 py-2 text-sm text-primary-foreground" : "max-w-2xl text-sm leading-relaxed text-foreground"}>{m.text}</div>
              {m.role === "user" && <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground"><User className="h-3.5 w-3.5" /></span>}
            </div>
          ))}
        </div>
        <div className="border-t border-border p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {prompts.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground/80 hover:border-primary/50 hover:text-primary">{s}</button>)}
          </div>
          <div className="flex gap-2">
            <Textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)} placeholder={lang === "ml" ? "ചോദ്യം എഴുതുക…" : "Ask a question…"} className="min-h-[40px] resize-none" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} />
            <Button onClick={() => send(input)}><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}