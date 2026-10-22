import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { useLang } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, User, Send } from "lucide-react";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [{ title: "SahAI · Voice Assistant" }] }),
  component: Assistant,
});

type Msg = { role: "user" | "assistant"; text: string };

function Assistant() {
  const { lang, t } = useLang();
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: lang === "ml" ? "നമസ്കാരം, ഞാൻ SahAI. ഏത് കേന്ദ്ര പദ്ധതിയെക്കുറിച്ചാണ് അറിയേണ്ടത്?" : "Hello, I'm SahAI. Which central scheme would you like to know about?" },
  ]);

  const suggestions = lang === "ml"
    ? ["PM-Kisan യോഗ്യത എന്താണ്?", "Ayushman Bharat എങ്ങനെ അപേക്ഷിക്കാം?", "PM Awas Yojana രേഖകൾ"]
    : ["What is PM-Kisan eligibility?", "How to apply for Ayushman Bharat?", "PM Awas Yojana documents"];

  function send(text: string) {
    if (!text.trim()) return;
    const reply = lang === "ml"
      ? `"${text}" സംബന്ധിച്ച ഔദ്യോഗിക വിശദാംശങ്ങൾക്ക് ബന്ധപ്പെട്ട കേന്ദ്ര സർക്കാർ പോർട്ടൽ സന്ദർശിക്കുക.`
      : `For official details on "${text}", please visit the relevant Central Government portal.`;
    setMsgs((m) => [...m, { role: "user", text }, { role: "assistant", text: reply }]);
    setInput("");
  }

  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="section-underline font-display text-3xl font-bold">{t.nav.assistant}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{lang === "ml" ? "SahAI-യോട് കേന്ദ്ര പദ്ധതികളെക്കുറിച്ച് മലയാളത്തിൽ ചോദിക്കാം." : "Ask SahAI about Central Government schemes in Malayalam or English."}</p>

        <div className="mt-6 rounded-xl border border-border bg-card">
          <div className="max-h-[480px] space-y-3 overflow-y-auto p-5">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Bot className="h-3.5 w-3.5" /></span>}
                <div className={m.role === "user" ? "rounded-2xl rounded-tr-sm bg-primary px-4 py-2 text-sm text-primary-foreground" : "text-sm leading-relaxed text-foreground"}>{m.text}</div>
                {m.role === "user" && <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground"><User className="h-3.5 w-3.5" /></span>}
              </div>
            ))}
          </div>
          <div className="border-t border-border p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground/80 hover:border-primary/50 hover:text-primary">{s}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)} placeholder={lang === "ml" ? "ചോദ്യം എഴുതുക…" : "Type your question…"} className="min-h-[40px] resize-none" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} />
              <Button onClick={() => send(input)}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
