import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/i18n/LanguageProvider";
import sahaiAvatar from "@/assets/sahai-avatar-v3.png";
import { findHelpdeskLocations, getHelpdeskLocation } from "@/data/helpdesk-locations";
import {
  Keyboard,
  List,
  MapPin,
  Mic,
  Navigation,
  Phone,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

type Msg = { id: number; role: "user" | "assistant"; text: string; locationIds?: string[] };
type PromptKey = "schemes" | "application" | "track" | "volunteer" | "pmkisan";
type ProfileStep = "name" | "age" | "district" | "occupation" | "income" | null;
type Profile = {
  name?: string;
  age?: string;
  district?: string;
  occupation?: string;
  income?: string;
};

type VoiceRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type VoiceWindow = Window & {
  SpeechRecognition?: new () => VoiceRecognition;
  webkitSpeechRecognition?: new () => VoiceRecognition;
};

const PROMPT_KEYS: PromptKey[] = ["schemes", "application", "track", "volunteer", "pmkisan"];

function classify(text: string): PromptKey | "fallback" {
  const value = text.toLocaleLowerCase();
  if (value.includes("pm-kisan") || value.includes("pm kisan") || value.includes("kisan"))
    return "pmkisan";
  if (
    value.includes("apply") ||
    value.includes("application") ||
    value.includes("form") ||
    value.includes("അപേക്ഷ")
  )
    return "application";
  if (value.includes("track") || value.includes("status") || value.includes("നില")) return "track";
  if (value.includes("volunteer") || value.includes("വോളണ്ടിയർ")) return "volunteer";
  if (
    value.includes("scheme") ||
    value.includes("eligib") ||
    value.includes("പദ്ധതി") ||
    value.includes("യോഗ്യത")
  )
    return "schemes";
  return "fallback";
}

export function SahAI() {
  const { t, lang } = useLang();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const isHelpdeskPage = path === "/helpdesk";
  const hideFloatingTrigger = path.startsWith("/apply/");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceReply, setVoiceReply] = useState(true);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showTopicMenu, setShowTopicMenu] = useState(!isHelpdeskPage);
  const [locatorMode, setLocatorMode] = useState(isHelpdeskPage);
  const [profileStep, setProfileStep] = useState<ProfileStep>(null);
  const [profile, setProfile] = useState<Profile>({});
  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<VoiceRecognition | null>(null);

  const pageWelcome = isHelpdeskPage
    ? lang === "ml"
      ? "നിങ്ങളുടെ ജില്ലയോ സമീപ സ്ഥലമോ പറയൂ. ഏറ്റവും അടുത്ത ഹെൽപ്പ്ഡെസ്ക് കണ്ടെത്താൻ ഞാൻ സഹായിക്കാം."
      : "Tell me your district or nearby place. I will help you find the nearest helpdesk."
    : t.sahai.welcome;

  const speakText = useCallback(
    (text: string) => {
      if (!voiceReply || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "ml" ? "ml-IN" : "en-IN";
      utterance.rate = lang === "ml" ? 0.88 : 0.94;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [lang, voiceReply],
  );

  const pushAssistant = useCallback(
    (text: string, locationIds?: string[]) => {
      setMessages((current) => [
        ...current,
        { id: nextId.current++, role: "assistant", text, locationIds },
      ]);
      window.setTimeout(() => speakText(text), 120);
    },
    [speakText],
  );

  useEffect(() => {
    if (!open || messages.length) return;
    const welcome = pageWelcome;
    setMessages([{ id: nextId.current++, role: "assistant", text: welcome }]);
    window.setTimeout(() => speakText(welcome), 250);
  }, [messages.length, open, pageWelcome, speakText]);

  useEffect(() => {
    setOpen(false);
    setMessages([]);
    setLocatorMode(isHelpdeskPage);
    setShowTopicMenu(!isHelpdeskPage);
    setInput("");
    setProfile({});
    setProfileStep(null);
  }, [isHelpdeskPage, path]);

  useEffect(() => {
    const handleLocatorOpen = () => {
      const intro =
        lang === "ml"
          ? "\u0d28\u0d3f\u0d19\u0d4d\u0d19\u0d33\u0d41\u0d1f\u0d46 \u0d1c\u0d3f\u0d32\u0d4d\u0d32\u0d2f\u0d4b \u0d38\u0d4d\u0d25\u0d32\u0d2e\u0d4b \u0d2a\u0d31\u0d2f\u0d42. \u0d0f\u0d31\u0d4d\u0d31\u0d35\u0d41\u0d02 \u0d05\u0d1f\u0d41\u0d24\u0d4d\u0d24 \u0d39\u0d46\u0d7d\u0d2a\u0d4d\u0d2a\u0d4d\u0d21\u0d46\u0d38\u0d4d\u0d15\u0d4d \u0d1e\u0d3e\u0d7b \u0d15\u0d23\u0d4d\u0d1f\u0d46\u0d24\u0d4d\u0d24\u0d3e\u0d02."
          : "Tell me your district or place. I will find the nearest matching helpdesk.";
      setLocatorMode(true);
      setShowTopicMenu(false);
      setOpen(true);
      setInput("");
      setProfile({});
      setProfileStep(null);
      setMessages([{ id: nextId.current++, role: "assistant", text: intro }]);
      window.setTimeout(() => speakText(intro), 250);
    };

    window.addEventListener("sahai:open-helpdesk-locator", handleLocatorOpen);
    return () => window.removeEventListener("sahai:open-helpdesk-locator", handleLocatorOpen);
  }, [lang, speakText]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [isListening, isSpeaking, messages, open, showKeyboard, showTopicMenu]);

  useEffect(
    () => () => {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    },
    [],
  );

  function profileReply(text: string) {
    if (!profileStep) return false;
    if (profileStep === "name") {
      setProfile((current) => ({ ...current, name: text }));
      setProfileStep("age");
      pushAssistant(
        lang === "ml"
          ? `നന്ദി ${text}. നിങ്ങളുടെ പ്രായം എത്രയാണ്?`
          : `Thank you, ${text}. What is your age?`,
      );
      return true;
    }
    if (profileStep === "age") {
      setProfile((current) => ({ ...current, age: text }));
      setProfileStep("district");
      pushAssistant(
        lang === "ml"
          ? "നിങ്ങൾ കേരളത്തിലെ ഏത് ജില്ലയിലാണ് താമസിക്കുന്നത്?"
          : "Which district in Kerala do you live in?",
      );
      return true;
    }
    if (profileStep === "district") {
      setProfile((current) => ({ ...current, district: text }));
      setProfileStep("occupation");
      pushAssistant(
        lang === "ml"
          ? "നിങ്ങളുടെ പ്രധാന തൊഴിൽ എന്താണ്? ഉദാഹരണം: കർഷകൻ, തൊഴിലാളി, വിദ്യാർത്ഥി, സ്വയംതൊഴിൽ."
          : "What is your main occupation—for example farmer, worker, student or self-employed?",
      );
      return true;
    }
    if (profileStep === "occupation") {
      setProfile((current) => ({ ...current, occupation: text }));
      setProfileStep("income");
      pushAssistant(
        lang === "ml"
          ? "നിങ്ങളുടെ കുടുംബത്തിന്റെ ഏകദേശ വാർഷിക വരുമാനം എത്രയാണ്? കൃത്യമായ തുക പറയേണ്ടതില്ല."
          : "What is your household’s approximate annual income? You do not need to give an exact amount.",
      );
      return true;
    }

    const completed = { ...profile, income: text };
    setProfile(completed);
    setProfileStep(null);
    const occupation = (completed.occupation ?? "").toLocaleLowerCase();
    const suggestions =
      occupation.includes("കർഷ") || occupation.includes("farmer")
        ? lang === "ml"
          ? "PM-KISAN, PM Fasal Bima Yojana, PM Shram Yogi Maandhan"
          : "PM-KISAN, PM Fasal Bima Yojana and PM Shram Yogi Maandhan"
        : occupation.includes("student") || occupation.includes("വിദ്യാർ")
          ? lang === "ml"
            ? "Vidya Lakshmi, PM POSHAN, Skill India"
            : "Vidya Lakshmi, PM POSHAN and Skill India"
          : occupation.includes("self") ||
              occupation.includes("സ്വയം") ||
              occupation.includes("business")
            ? lang === "ml"
              ? "PM MUDRA Yojana, Stand-Up India, Skill India"
              : "PM MUDRA Yojana, Stand-Up India and Skill India"
            : lang === "ml"
              ? "Ayushman Bharat, PM Suraksha Bima, PM Jeevan Jyoti Bima"
              : "Ayushman Bharat, PM Suraksha Bima and PM Jeevan Jyoti Bima";
    pushAssistant(
      lang === "ml"
        ? `${completed.name ?? "നന്ദി"}, പ്രാഥമിക വിവരങ്ങൾ പ്രകാരം ${suggestions} എന്നിവ ആദ്യം പരിശോധിക്കാം. ഇത് അന്തിമ യോഗ്യതാ തീരുമാനം അല്ല. അടുത്തതായി രേഖകളും പദ്ധതി നിബന്ധനകളും പരിശോധിച്ച് ഞാൻ അപേക്ഷ പൂരിപ്പിക്കാൻ സഹായിക്കും.`
        : `${completed.name ?? "Thank you"}, based on these initial details we can first check ${suggestions}. This is not a final eligibility decision. I’ll next help verify the documents and complete the application.`,
    );
    return true;
  }

  function startSchemeInterview(label: string) {
    setShowTopicMenu(false);
    setMessages((current) => [...current, { id: nextId.current++, role: "user", text: label }]);
    setProfile({});
    setProfileStep(null);
    window.setTimeout(
      () =>
        pushAssistant(
          lang === "ml"
            ? "കൃത്യമായ പദ്ധതി പൊരുത്തം കണ്ടെത്താൻ SahAIയുടെ സമ്പൂർണ്ണ യോഗ്യതാ പരിശോധന ഉപയോഗിക്കാം. താഴെയുള്ള ‘SahAI സംസാരിച്ച് പരിശോധിക്കാം’ ബട്ടൺ അമർത്തൂ."
            : "For an accurate scheme match, use SahAI's complete guided eligibility check. Select ‘Check by speaking with SahAI’ below.",
        ),
      250,
    );
  }

  function send(rawText: string) {
    const text = rawText.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: nextId.current++, role: "user", text }]);
    setInput("");
    if (locatorMode) {
      const matches = findHelpdeskLocations(text).slice(0, 3);
      const reply = matches.length
        ? lang === "ml"
          ? "\u0d28\u0d3f\u0d19\u0d4d\u0d19\u0d7e\u0d15\u0d4d\u0d15\u0d1f\u0d41\u0d24\u0d4d\u0d24\u0d41\u0d33\u0d4d\u0d33 \u0d39\u0d46\u0d7d\u0d2a\u0d4d\u0d2a\u0d4d\u0d21\u0d46\u0d38\u0d4d\u0d15\u0d41\u0d15\u0d7e \u0d15\u0d23\u0d4d\u0d1f\u0d46\u0d24\u0d4d\u0d24\u0d3f."
          : "I found the nearest matching helpdesks."
        : lang === "ml"
          ? "\u0d06 \u0d38\u0d4d\u0d25\u0d32\u0d24\u0d4d\u0d24\u0d3f\u0d28\u0d4d \u0d38\u0d2e\u0d40\u0d2a\u0d2e\u0d41\u0d33\u0d4d\u0d33 \u0d39\u0d46\u0d7d\u0d2a\u0d4d\u0d2a\u0d4d\u0d21\u0d46\u0d38\u0d4d\u0d15\u0d4d \u0d15\u0d23\u0d4d\u0d1f\u0d46\u0d24\u0d4d\u0d24\u0d3e\u0d28\u0d3e\u0d2f\u0d3f\u0d32\u0d4d\u0d32. \u0d1c\u0d3f\u0d32\u0d4d\u0d32\u0d2f\u0d41\u0d1f\u0d46 \u0d2a\u0d47\u0d30\u0d4b \u0d05\u0d1f\u0d41\u0d24\u0d4d\u0d24 \u0d2a\u0d1f\u0d4d\u0d1f\u0d23\u0d2e\u0d4b \u0d2a\u0d31\u0d2f\u0d42."
          : "I could not find a matching helpdesk. Please say the district name or a nearby town.";
      window.setTimeout(
        () =>
          pushAssistant(
            reply,
            matches.map((location) => location.id),
          ),
        300,
      );
      return;
    }
    setShowTopicMenu(false);
    if (profileReply(text)) return;
    const key = classify(text);
    if (key === "schemes") {
      setProfile({});
      setProfileStep(null);
    }
    const reply =
      key === "schemes"
        ? lang === "ml"
          ? "താഴെയുള്ള ‘SahAI സംസാരിച്ച് പരിശോധിക്കാം’ ഉപയോഗിച്ച് നമുക്ക് സമ്പൂർണ്ണ പരിശോധന തുടങ്ങാം."
          : "Use ‘Check by speaking with SahAI’ below to begin the complete check."
        : key === "fallback"
          ? t.sahai.replies.fallback
          : t.sahai.replies[key];
    window.setTimeout(() => pushAssistant(reply), 300);
  }

  function sendPrompt(key: PromptKey) {
    setShowTopicMenu(false);
    const label = t.sahai.quickPrompts[key];
    if (key === "schemes") {
      startSchemeInterview(label);
      return;
    }
    setMessages((current) => [...current, { id: nextId.current++, role: "user", text: label }]);
    window.setTimeout(() => pushAssistant(t.sahai.replies[key]), 300);
  }

  function handleMic() {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const voiceWindow = window as VoiceWindow;
    const Recognition = voiceWindow.SpeechRecognition ?? voiceWindow.webkitSpeechRecognition;
    if (!Recognition) {
      pushAssistant(t.sahai.voiceUnavailable);
      setShowKeyboard(true);
      return;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    const recognition = new Recognition();
    recognition.lang = lang === "ml" ? "ml-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript) send(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
      pushAssistant(t.sahai.voiceUnavailable);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          setMessages([]);
          setLocatorMode(isHelpdeskPage);
          setShowTopicMenu(!isHelpdeskPage);
          setInput("");
          setProfile({});
          setProfileStep(null);
        }
      }}
    >
      {!hideFloatingTrigger && (
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Open SahAI voice assistant"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary px-3 py-2.5 text-primary-foreground shadow-lg ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-xl sm:bottom-6 sm:right-6 sm:px-4 sm:py-3"
          >
            <span className="relative flex h-10 w-10 items-center justify-center overflow-visible rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/30">
              <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                <img
                  src={sahaiAvatar}
                  alt=""
                  className="h-full w-full scale-[1.32] object-contain"
                  loading="lazy"
                  width={256}
                  height={256}
                />
              </span>
            </span>
            <span className="text-sm font-bold tracking-wide">SahAI</span>
          </button>
        </SheetTrigger>
      )}

      <SheetContent
        side="right"
        className="flex w-full max-w-[100vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border bg-card px-4 py-3 text-left">
          <div className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center overflow-visible rounded-full bg-muted ring-1 ring-border">
              <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                <img
                  src={sahaiAvatar}
                  alt="SahAI"
                  className="h-full w-full scale-[1.32] object-contain"
                  loading="lazy"
                  width={256}
                  height={256}
                />
              </span>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-secondary" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base">SahAI</SheetTitle>
                <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary">
                  AI
                </span>
              </div>
              <SheetDescription className="text-xs">{t.sahai.subtext}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-auto max-w-[88%] break-words rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground [overflow-wrap:anywhere]"
                  : "mr-auto max-w-[92%] break-words rounded-2xl rounded-bl-sm bg-card px-3.5 py-2.5 text-sm leading-relaxed text-foreground shadow-sm ring-1 ring-border [overflow-wrap:anywhere]"
              }
            >
              <p>{message.text}</p>
              {message.locationIds?.map((locationId) => {
                const location = getHelpdeskLocation(locationId);
                if (!location) return null;
                return (
                  <div
                    key={location.id}
                    className="mt-3 rounded-xl border border-border bg-background p-3 text-left"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <div className="font-semibold text-foreground">{location.name}</div>
                        <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {location.address}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {location.phones.map((phone) => (
                        <Button key={phone} asChild size="sm" className="h-8 px-2.5 text-xs">
                          <a href={`tel:${phone}`}>
                            <Phone className="h-3.5 w-3.5" />
                            {phone}
                          </a>
                        </Button>
                      ))}
                      <Button asChild size="sm" variant="outline" className="h-8 px-2.5 text-xs">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Navigation className="h-3.5 w-3.5" />
                          {lang === "ml"
                            ? "\u0d35\u0d34\u0d3f\u0d15\u0d3e\u0d1f\u0d4d\u0d1f\u0d3f"
                            : "Directions"}
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {!locatorMode && showTopicMenu && (
            <div className="space-y-2 pt-1">
              <Button asChild className="w-full justify-between" variant="outline">
                <Link to="/eligibility" search={{ scheme: undefined }} onClick={() => setOpen(false)}>
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {lang === "ml"
                      ? "SahAI \u0d38\u0d02\u0d38\u0d3e\u0d30\u0d3f\u0d1a\u0d4d\u0d1a\u0d4d \u0d2a\u0d30\u0d3f\u0d36\u0d4b\u0d27\u0d3f\u0d15\u0d4d\u0d15\u0d3e\u0d02"
                      : "Check by speaking with SahAI"}
                  </span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </Button>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {PROMPT_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => sendPrompt(key)}
                    className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground/80 transition hover:border-primary hover:text-primary"
                  >
                    {t.sahai.quickPrompts[key]}
                  </button>
                ))}
              </div>
            </div>
          )}
          {isListening && (
            <div className="mr-auto inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              {t.sahai.listening}
            </div>
          )}
          {isSpeaking && (
            <div className="mr-auto inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm ring-1 ring-border">
              <Volume2 className="h-3.5 w-3.5 text-primary" />
              {t.sahai.speaking}
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card px-3 py-2">
          <div
            className={`rounded-2xl border p-2 transition-colors ${isListening ? "border-secondary/40 bg-secondary/[0.07]" : "border-primary/20 bg-primary/[0.04]"}`}
          >
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                <span
                  aria-hidden="true"
                  className={`absolute inset-1 rounded-full ${isListening ? "animate-ping bg-secondary/35 [animation-duration:1s]" : "animate-ping bg-primary/25 [animation-duration:2.4s]"}`}
                />
                <span
                  aria-hidden="true"
                  className={`absolute inset-2 rounded-full ${isListening ? "animate-pulse bg-secondary/20" : "bg-primary/10"}`}
                />
                <button
                  type="button"
                  onClick={handleMic}
                  aria-label={isListening ? t.sahai.listening : t.sahai.voiceHint}
                  aria-pressed={isListening}
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${isListening ? "bg-secondary" : "bg-primary"}`}
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground">
                  {isListening ? t.sahai.listening : t.sahai.voiceHint}
                </div>
              </div>
              {isListening && (
                <div className="flex h-7 items-center gap-1" aria-hidden="true">
                  <span className="h-3 w-1 animate-pulse rounded-full bg-secondary" />
                  <span className="h-6 w-1 animate-pulse rounded-full bg-secondary [animation-delay:150ms]" />
                  <span className="h-4 w-1 animate-pulse rounded-full bg-secondary [animation-delay:300ms]" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-1">
            {!locatorMode && (
              <button
                type="button"
                onClick={() => setShowTopicMenu((value) => !value)}
                aria-expanded={showTopicMenu}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <List className="h-3.5 w-3.5" />
                {lang === "ml" ? "മെനു" : "Topics"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowKeyboard((value) => !value)}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Keyboard className="h-3.5 w-3.5" />{" "}
              {showKeyboard ? t.sahai.hideKeyboard : t.sahai.typeInstead}
            </button>
            <button
              type="button"
              onClick={() => setVoiceReply((value) => !value)}
              aria-pressed={voiceReply}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {voiceReply ? (
                <Volume2 className="h-3.5 w-3.5 text-primary" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}{" "}
              {t.sahai.voiceReply}
            </button>
          </div>

          {showKeyboard && (
            <div className="mt-3 flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send(input);
                  }
                }}
                placeholder={t.sahai.inputPlaceholder}
                rows={1}
                className="min-h-[42px] flex-1 resize-none"
                lang={lang}
              />
              <Button
                type="button"
                size="icon"
                onClick={() => send(input)}
                aria-label={t.sahai.send}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
