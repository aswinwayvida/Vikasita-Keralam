import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  CircleX,
  FileCheck2,
  FileText,
  Headphones,
  Mic,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
  Volume2,
  VolumeX,
} from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/i18n/LanguageProvider";
import { schemes } from "@/data/schemes";
import sahaiAvatar from "@/assets/sahai-avatar-v3.png";
import {
  evaluateEligibility,
  getAnswerLabel,
  getSchemeQuestions,
  getVisibleQuestions,
  parseVoiceAnswer,
  questionSectionLabels,
  type EligibilityAnswers,
  type EligibilityLanguage,
  type EligibilityMatch,
  type EligibilityQuestion,
} from "@/lib/eligibility-engine";
import { ELIGIBILITY_PROFILE_SESSION_KEY, EMAIL_NOT_PROVIDED } from "@/lib/citizen-profile";

export const Route = createFileRoute("/eligibility")({
  validateSearch: (search: Record<string, unknown>) => ({
    scheme: typeof search.scheme === "string" ? search.scheme : undefined,
  }),
  head: () => ({
    meta: [
      { title: "യോഗ്യത പരിശോധിക്കാം · Vikasita Keralam" },
      {
        name: "description",
        content: "Malayalam-first guided eligibility screening for Central Government schemes.",
      },
    ],
  }),
  component: Eligibility,
});

type Mode = "voice" | "form";
type Phase = "intro" | "questions" | "results";

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

const DEMO_OTP = "123456";

const copy = {
  ml: {
    eyebrow: "കേന്ദ്ര പദ്ധതി യോഗ്യതാ സഹായി",
    title: "നിങ്ങൾക്കുള്ള പദ്ധതികൾ കൃത്യമായി കണ്ടെത്താം",
    intro: "പ്രാഥമിക യോഗ്യതാ ഫലം 3 മിനിറ്റിൽ",
    voiceCta: "SahAI സംസാരിച്ച് പരിശോധിക്കാം",
    voiceDesc:
      "SahAI ഓരോ ചോദ്യവും മലയാളത്തിൽ ചോദിക്കും. ഉത്തരം പറയുകയോ വലിയ ബട്ടണുകൾ അമർത്തുകയോ ചെയ്യാം.",
    formCta: "ഫോം ഉപയോഗിച്ച് പരിശോധിക്കാം",
    formDesc:
      "ഓരോ ചോദ്യവും വായിച്ച് ഉത്തരം തിരഞ്ഞെടുക്കാം. എപ്പോൾ വേണമെങ്കിലും SahAI മോഡിലേക്ക് മാറാം.",
    privacy: "ആവശ്യമായ വിവരങ്ങൾ മാത്രം ചോദിക്കുന്ന ലളിതമായ യോഗ്യതാ പരിശോധന.",
    noGuarantee:
      "ഇത് പ്രാഥമിക യോഗ്യതാ പരിശോധനയാണ്. അന്തിമ തീരുമാനം ബന്ധപ്പെട്ട പദ്ധതി അധികാരിയുടേതാണ്.",
    listening: "SahAI കേൾക്കുന്നു…",
    tapMic: "മൈക്ക് അമർത്തി ഉത്തരം പറയൂ",
    voiceReady: "SahAI നിങ്ങളുടെ ഉത്തരത്തിനായി തയ്യാറാണ്",
    voiceError: "ഉത്തരം വ്യക്തമായില്ല. വീണ്ടും പറയുകയോ താഴെയുള്ള ഓപ്ഷൻ തിരഞ്ഞെടുക്കുകയോ ചെയ്യൂ.",
    answerCaptured: "കേട്ട ഉത്തരം",
    next: "അടുത്തത്",
    back: "പിന്നിലേക്ക്",
    restart: "വീണ്ടും തുടങ്ങുക",
    switchToVoice: "SahAI മോഡിലേക്ക് മാറുക",
    switchToForm: "ഫോം മോഡിലേക്ക് മാറുക",
    progress: "പൂർത്തിയായി",
    profile: "നിങ്ങളുടെ ഉത്തരങ്ങൾ",
    sessionOnly: "ഉത്തരങ്ങൾ ഈ ബ്രൗസർ സെഷനിൽ മാത്രം സൂക്ഷിക്കും.",
    resultEyebrow: "യോഗ്യതാ പരിശോധന പൂർത്തിയായി",
    resultTitle: "നിങ്ങൾക്കായി കണ്ടെത്തിയ പദ്ധതികൾ",
    strong: "ശക്തമായ പൊരുത്തം",
    possible: "കൂടുതൽ പരിശോധന വേണം",
    strongDesc: "നൽകിയ ഉത്തരങ്ങൾ പദ്ധതിയുടെ പ്രാഥമിക നിബന്ധനകളുമായി പൊരുത്തപ്പെടുന്നു.",
    possibleDesc: "ചില വിവരങ്ങളോ ഔദ്യോഗിക രേഖകളോ കൂടി പരിശോധിക്കണം.",
    whyMatched: "എന്തുകൊണ്ട് പൊരുത്തപ്പെട്ടു",
    verify: "ഇനി പരിശോധിക്കേണ്ടത്",
    documents: "സാധാരണ ആവശ്യമായ രേഖകൾ",
    documentsNote: "രേഖകൾ ഇപ്പോൾ അപ്‌ലോഡ് ചെയ്യേണ്ടതില്ല.",
    details: "പദ്ധതി വിശദാംശങ്ങൾ",
    helpdesk: "അപേക്ഷാ സഹായം നേടുക",
    hearResults: "SahAI ഫലം വായിക്കട്ടെ",
    editAnswers: "ഉത്തരങ്ങൾ തിരുത്തുക",
    notMatched: "നിലവിലെ ഉത്തരങ്ങൾ പ്രകാരം പൊരുത്തപ്പെടാത്ത പദ്ധതികൾ",
    matches: "പദ്ധതികൾ കണ്ടെത്തി",
    ageInvalid: "1 മുതൽ 120 വരെ ശരിയായ പ്രായം നൽകുക.",
    nameInvalid: "ശരിയായ പൂർണ്ണമായ പേര് നൽകുക.",
    mobileInvalid: "ശരിയായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.",
    emailInvalid: "ശരിയായ ഇമെയിൽ വിലാസം നൽകുക.",
    skipEmail: "ഇമെയിൽ നൽകാതെ തുടരുക",
    changeEmail: "ഇമെയിൽ മാറ്റുക",
    sendOtp: "OTP അയയ്ക്കുക",
    otpPlaceholder: "6 അക്ക OTP",
    verifyOtp: "സ്ഥിരീകരിക്കുക",
    otpSent: "OTP അയച്ചു",
    otpInvalid: "ശരിയായ OTP നൽകുക.",
    changeNumber: "നമ്പർ മാറ്റുക",
    continueSaved: "മുൻപ് നൽകിയ ഉത്തരങ്ങളോടെ തുടരാം",
    clearSaved: "പുതിയ പരിശോധന തുടങ്ങുക",
  },
  en: {
    eyebrow: "Central scheme eligibility assistant",
    title: "Find schemes that genuinely match your profile",
    intro: "Initial eligibility result in 3 minutes.",
    voiceCta: "Check by speaking with SahAI",
    voiceDesc:
      "SahAI asks one question at a time. Answer by speaking or using the large on-screen choices.",
    formCta: "Use the guided form",
    formDesc: "Read and answer each question. You can switch to SahAI mode at any time.",
    privacy: "A simple eligibility check that asks only the relevant questions.",
    noGuarantee:
      "This is an initial eligibility screening. Final approval rests with the responsible scheme authority.",
    listening: "SahAI is listening…",
    tapMic: "Tap the microphone and answer",
    voiceReady: "SahAI is ready for your answer",
    voiceError: "I could not match that answer. Please try again or tap one of the choices below.",
    answerCaptured: "Heard answer",
    next: "Next",
    back: "Back",
    restart: "Start again",
    switchToVoice: "Switch to SahAI mode",
    switchToForm: "Switch to form mode",
    progress: "complete",
    profile: "Your answers",
    sessionOnly: "Answers remain only in this browser session.",
    resultEyebrow: "Eligibility check complete",
    resultTitle: "Schemes identified for you",
    strong: "Strong match",
    possible: "Verification required",
    strongDesc: "Your answers align with the scheme's initial eligibility conditions.",
    possibleDesc: "Some details or official records still need to be verified.",
    whyMatched: "Why it matched",
    verify: "What still needs verification",
    documents: "Documents commonly required",
    documentsNote: "You do not need to upload documents now.",
    details: "Scheme details",
    helpdesk: "Get application assistance",
    hearResults: "Let SahAI read the result",
    editAnswers: "Edit answers",
    notMatched: "Schemes not matched by the current answers",
    matches: "schemes identified",
    ageInvalid: "Enter a valid age between 1 and 120.",
    nameInvalid: "Enter a valid full name.",
    mobileInvalid: "Enter a valid 10-digit mobile number.",
    emailInvalid: "Enter a valid email address.",
    skipEmail: "Continue without email",
    changeEmail: "Change email",
    sendOtp: "Send OTP",
    otpPlaceholder: "6-digit OTP",
    verifyOtp: "Verify",
    otpSent: "OTP sent",
    otpInvalid: "Enter the correct OTP.",
    changeNumber: "Change number",
    continueSaved: "Continue with saved answers",
    clearSaved: "Start a new check",
  },
};

function Eligibility() {
  const { lang } = useLang();
  const language = lang as EligibilityLanguage;
  const text = copy[language];
  const { scheme: requestedSchemeId } = Route.useSearch();
  const selectedScheme = useMemo(
    () => schemes.find((scheme) => scheme.id === requestedSchemeId),
    [requestedSchemeId],
  );
  const [mode, setMode] = useState<Mode | null>("form");
  const [phase, setPhase] = useState<Phase>("questions");
  const [answers, setAnswers] = useState<EligibilityAnswers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [numberDraft, setNumberDraft] = useState("");
  const [textDraft, setTextDraft] = useState("");
  const [mobileDraft, setMobileDraft] = useState("");
  const [otpDraft, setOtpDraft] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [emailOtpDraft, setEmailOtpDraft] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceReply, setVoiceReply] = useState(true);
  const [lastTranscript, setLastTranscript] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [hasSavedAnswers, setHasSavedAnswers] = useState(false);
  const recognitionRef = useRef<VoiceRecognition | null>(null);
  const resultAnnounced = useRef(false);

  const getQuestionsForProfile = useCallback(
    (profile: EligibilityAnswers) =>
      selectedScheme
        ? getSchemeQuestions(selectedScheme.id, profile)
        : getVisibleQuestions(profile),
    [selectedScheme],
  );
  const visibleQuestions = useMemo(
    () => getQuestionsForProfile(answers),
    [answers, getQuestionsForProfile],
  );
  const currentQuestion = visibleQuestions[currentIndex];
  const schemesToEvaluate = useMemo(
    () => (selectedScheme ? [selectedScheme] : schemes),
    [selectedScheme],
  );
  const evaluated = useMemo(
    () => evaluateEligibility(answers, schemesToEvaluate),
    [answers, schemesToEvaluate],
  );
  const strongMatches = evaluated.filter((match) => match.status === "strong");
  const possibleMatches = evaluated.filter((match) => match.status === "possible");
  const notMatched = evaluated.filter((match) => match.status === "not-matched");

  const speak = useCallback(
    (message: string) => {
      if (!voiceReply || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = language === "ml" ? "ml-IN" : "en-IN";
      utterance.rate = language === "ml" ? 0.86 : 0.92;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [language, voiceReply],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.sessionStorage.getItem(ELIGIBILITY_PROFILE_SESSION_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as EligibilityAnswers;
      if (!Object.keys(parsed).length) return;

      const questions = getQuestionsForProfile(parsed);
      const unansweredIndex = questions.findIndex((question) => !parsed[question.id]);
      setAnswers(parsed);
      setHasSavedAnswers(true);
      setCurrentIndex(unansweredIndex === -1 ? 0 : unansweredIndex);
      setPhase(unansweredIndex === -1 ? "results" : "questions");
    } catch {
      window.sessionStorage.removeItem(ELIGIBILITY_PROFILE_SESSION_KEY);
    }
  }, [getQuestionsForProfile]);

  useEffect(() => {
    if (typeof window === "undefined" || !Object.keys(answers).length) return;
    window.sessionStorage.setItem(ELIGIBILITY_PROFILE_SESSION_KEY, JSON.stringify(answers));
    setHasSavedAnswers(true);
  }, [answers]);

  useEffect(() => {
    setNumberDraft(currentQuestion?.type === "number" ? (answers[currentQuestion.id] ?? "") : "");
    setTextDraft(currentQuestion?.type === "text" ? (answers[currentQuestion.id] ?? "") : "");
    setMobileDraft(currentQuestion?.type === "phone" ? (answers[currentQuestion.id] ?? "") : "");
    setEmailDraft(currentQuestion?.type === "email" && answers[currentQuestion.id] !== EMAIL_NOT_PROVIDED ? (answers[currentQuestion.id] ?? "") : "");
    setOtpDraft("");
    setOtpSent(false);
    setOtpError("");
    setEmailOtpDraft("");
    setEmailOtpSent(false);
    setEmailOtpError("");
    setValidationError("");
    setVoiceError("");
    setLastTranscript("");
  }, [answers, currentQuestion?.id, currentQuestion?.type]);

  useEffect(() => {
    if (mode !== "voice" || phase !== "questions" || !currentQuestion) return;
    const timer = window.setTimeout(() => speak(currentQuestion.label[language]), 220);
    return () => window.clearTimeout(timer);
  }, [currentQuestion, language, mode, phase, speak]);

  useEffect(() => {
    if (mode !== "voice" || phase !== "results" || resultAnnounced.current) return;
    resultAnnounced.current = true;
    const message =
      language === "ml"
        ? `പരിശോധന പൂർത്തിയായി. ${strongMatches.length} ശക്തമായ പൊരുത്തവും ${possibleMatches.length} കൂടുതൽ പരിശോധിക്കേണ്ട പൊരുത്തവും കണ്ടെത്തി.`
        : `The check is complete. I found ${strongMatches.length} strong matches and ${possibleMatches.length} matches that need verification.`;
    const timer = window.setTimeout(() => speak(message), 300);
    return () => window.clearTimeout(timer);
  }, [language, mode, phase, possibleMatches.length, speak, strongMatches.length]);

  useEffect(
    () => () => {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    },
    [],
  );

  function startCheck(selectedMode: Mode, continueSaved = false) {
    const profile = continueSaved ? answers : {};
    if (!continueSaved) {
      setAnswers({});
      if (typeof window !== "undefined") window.sessionStorage.removeItem(ELIGIBILITY_PROFILE_SESSION_KEY);
      setHasSavedAnswers(false);
    }
    const questions = getQuestionsForProfile(profile);
    const unansweredIndex = questions.findIndex((question) => !profile[question.id]);
    setMode(selectedMode);
    setCurrentIndex(unansweredIndex === -1 ? 0 : unansweredIndex);
    setPhase(unansweredIndex === -1 && Object.keys(profile).length ? "results" : "questions");
    setLastTranscript("");
    setVoiceError("");
    resultAnnounced.current = false;
  }

  function submitName() {
    if (!currentQuestion || currentQuestion.id !== "fullName") return;
    const name = textDraft.trim().replace(/\s+/g, " ");
    if (name.length < 2) {
      setValidationError(text.nameInvalid);
      return;
    }
    answerQuestion(currentQuestion, name);
  }

  function requestOtp() {
    if (!/^[6-9]\d{9}$/.test(mobileDraft)) {
      setValidationError(text.mobileInvalid);
      return;
    }
    setValidationError("");
    setOtpDraft("");
    setOtpError("");
    setOtpSent(true);
  }

  function verifyOtp() {
    if (!currentQuestion || currentQuestion.id !== "mobile") return;
    if (otpDraft !== DEMO_OTP) {
      setOtpError(text.otpInvalid);
      return;
    }
    setOtpError("");
    answerQuestion(currentQuestion, mobileDraft);
  }

  function requestEmailOtp() {
    const email = emailDraft.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError(text.emailInvalid);
      return;
    }
    setEmailDraft(email);
    setValidationError("");
    setEmailOtpDraft("");
    setEmailOtpError("");
    setEmailOtpSent(true);
  }

  function verifyEmailOtp() {
    if (!currentQuestion || currentQuestion.id !== "email") return;
    if (emailOtpDraft !== DEMO_OTP) {
      setEmailOtpError(text.otpInvalid);
      return;
    }
    setEmailOtpError("");
    answerQuestion(currentQuestion, emailDraft);
  }

  function skipEmail() {
    if (!currentQuestion || currentQuestion.id !== "email") return;
    answerQuestion(currentQuestion, EMAIL_NOT_PROVIDED);
  }

  function answerQuestion(question: EligibilityQuestion, value: string) {
    if (question.id === "age") {
      const age = Number(value);
      if (!Number.isInteger(age) || age < 1 || age > 120) {
        setValidationError(text.ageInvalid);
        return;
      }
    }

    const nextAnswers = { ...answers, [question.id]: value };
    const nextQuestions = getQuestionsForProfile(nextAnswers);
    const answeredPosition = nextQuestions.findIndex((item) => item.id === question.id);
    setAnswers(nextAnswers);
    setValidationError("");

    if (answeredPosition >= nextQuestions.length - 1) {
      setPhase("results");
      resultAnnounced.current = false;
      return;
    }
    setCurrentIndex(answeredPosition + 1);
  }

  function goBack() {
    if (currentIndex > 0) setCurrentIndex((index) => index - 1);
  }

  function restart() {
    recognitionRef.current?.stop();
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
      window.sessionStorage.removeItem(ELIGIBILITY_PROFILE_SESSION_KEY);
    }
    setAnswers({});
    setMode("form");
    setPhase("questions");
    setCurrentIndex(0);
    setHasSavedAnswers(false);
    setLastTranscript("");
    setVoiceError("");
    resultAnnounced.current = false;
  }

  function handleRecognizedAnswer(transcript: string) {
    if (!currentQuestion) return;
    setLastTranscript(transcript);
    const value = parseVoiceAnswer(currentQuestion, transcript);
    if (!value) {
      setVoiceError(text.voiceError);
      return;
    }
    setVoiceError("");
    window.setTimeout(() => answerQuestion(currentQuestion, value), 450);
  }

  function handleMic() {
    if (!currentQuestion) return;
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const voiceWindow = window as VoiceWindow;
    const Recognition = voiceWindow.SpeechRecognition ?? voiceWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceError(
        language === "ml"
          ? "ഈ ബ്രൗസറിൽ ശബ്ദം തിരിച്ചറിയൽ ലഭ്യമല്ല. താഴെയുള്ള ഓപ്ഷൻ തിരഞ്ഞെടുക്കൂ."
          : "Voice recognition is unavailable in this browser. Please use the choices below.",
      );
      return;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setVoiceError("");
    setLastTranscript("");
    const recognition = new Recognition();
    recognition.lang = language === "ml" ? "ml-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript) handleRecognizedAnswer(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setVoiceError(text.voiceError);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

  const progress =
    phase === "results"
      ? 100
      : Math.round(((currentIndex + 1) / Math.max(visibleQuestions.length, 1)) * 100);

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/[0.06] via-background to-secondary/[0.05]">
        <div className="vk-container-narrow vk-eligibility-hero">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/85 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> {text.eyebrow}
          </div>
          <h1 className="vk-hero-title mt-4 max-w-3xl font-display text-foreground">
            {selectedScheme
              ? language === "ml"
                ? selectedScheme.ml + " യോഗ്യത പരിശോധിക്കാം"
                : "Check eligibility for " + selectedScheme.en
              : text.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {selectedScheme
              ? language === "ml"
                ? "ഈ പദ്ധതിക്കാവശ്യമായ ചോദ്യങ്ങൾ മാത്രം ചോദിക്കും. മുമ്പ് നൽകിയ വിവരങ്ങൾ വീണ്ടും ചോദിക്കില്ല."
                : "Only questions required for this scheme will be asked. Previously supplied answers will be reused."
              : text.intro}
          </p>
        </div>
      </section>

      {phase === "intro" ? (
        <IntroPanel
          language={language}
          hasSavedAnswers={hasSavedAnswers}
          onStart={(selectedMode) => startCheck(selectedMode)}
          onContinue={(selectedMode) => startCheck(selectedMode, true)}
          onClear={restart}
        />
      ) : phase === "questions" && currentQuestion && mode ? (
        <section className="vk-section-shell-narrow vk-eligibility-question-shell">
          <div className="mb-3 flex items-center justify-between gap-3">
            {currentIndex > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> {text.back}
              </button>
            ) : (
              <span aria-hidden="true" />
            )}
            <Button type="button" variant="ghost" size="sm" onClick={restart}>
              <RotateCcw className="mr-1.5 h-4 w-4" />
              {text.restart}
            </Button>
          </div>

          {selectedScheme && answers.mobile && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-secondary/20 bg-secondary/[0.06] px-4 py-3 text-sm">
              <span className="inline-flex items-center gap-2 font-semibold text-secondary">
                <BadgeCheck className="h-4 w-4" />
                {language === "ml"
                  ? "മൊബൈൽ സ്ഥിരീകരിച്ചു · ••••••" + answers.mobile.slice(-4)
                  : "Mobile verified · ••••••" + answers.mobile.slice(-4)}
              </span>
              <span className="text-xs text-muted-foreground">
                {language === "ml"
                  ? "മുൻപ് നൽകിയ പ്രസക്തമായ വിവരങ്ങൾ ഉപയോഗിക്കുന്നു"
                  : "Reusing relevant answers from this session"}
              </span>
            </div>
          )}

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{questionSectionLabels[currentQuestion.section][language]}</span>
              <span>
                {progress}% {text.progress}
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              aria-label={`${progress}% ${text.progress}`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
              {mode === "voice" && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/[0.05] p-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background ring-1 ring-border">
                    <img
                      src={sahaiAvatar}
                      alt="SahAI"
                      className="h-full w-full scale-[1.3] object-contain"
                      width={256}
                      height={256}
                    />
                  </span>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-primary">
                      SahAI{" "}
                      <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] text-secondary">
                        AI
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-foreground/80">
                      {currentQuestion.label[language]}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                {language === "ml" ? `ചോദ്യം ${currentIndex + 1}` : `Question ${currentIndex + 1}`}
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl">
                {currentQuestion.label[language]}
              </h2>
              <p className="sr-only">{currentQuestion.helper[language]}</p>

              {mode === "voice" && (
                <div
                  className={`mt-6 rounded-2xl border p-4 ${isListening ? "border-secondary/40 bg-secondary/[0.06]" : "border-primary/15 bg-muted/30"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                      <span
                        aria-hidden="true"
                        className={`absolute inset-1 rounded-full ${isListening ? "animate-ping bg-secondary/35 [animation-duration:1s]" : "animate-ping bg-primary/20 [animation-duration:2.4s]"}`}
                      />
                      <button
                        type="button"
                        onClick={handleMic}
                        aria-label={isListening ? text.listening : text.tapMic}
                        aria-pressed={isListening}
                        className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${isListening ? "bg-secondary" : "bg-primary"}`}
                      >
                        <Mic className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">
                        {isListening ? text.listening : text.tapMic}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {isListening
                          ? language === "ml"
                            ? "ഉത്തരം പറഞ്ഞ ശേഷം കാത്തിരിക്കൂ"
                            : "Speak your answer and wait"
                          : text.voiceReady}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVoiceReply((value) => !value)}
                      className="rounded-full p-2 text-muted-foreground hover:bg-background"
                      aria-label={voiceReply ? "Mute SahAI" : "Enable SahAI voice"}
                      aria-pressed={voiceReply}
                    >
                      {voiceReply ? (
                        <Volume2 className="h-5 w-5 text-primary" />
                      ) : (
                        <VolumeX className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {lastTranscript && (
                    <div className="mt-3 rounded-xl bg-background px-3 py-2 text-xs">
                      <span className="font-semibold text-primary">{text.answerCaptured}:</span>{" "}
                      {lastTranscript}
                    </div>
                  )}
                  {voiceError && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      <CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {voiceError}
                    </div>
                  )}
                  {isSpeaking && (
                    <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <Volume2 className="h-3.5 w-3.5 text-primary" />
                      {language === "ml"
                        ? "SahAI ചോദ്യം വായിക്കുന്നു…"
                        : "SahAI is reading the question…"}
                    </div>
                  )}
                </div>
              )}

              {currentQuestion.type === "text" ? (
                <div className="mt-5 max-w-xl">
                  <Input
                    type="text"
                    autoComplete="name"
                    value={textDraft}
                    onChange={(event) => setTextDraft(event.target.value.slice(0, 80))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") submitName();
                    }}
                    placeholder={language === "ml" ? "പൂർണ്ണമായ പേര്" : "Full name"}
                    className="h-14 rounded-xl text-lg"
                    aria-label={currentQuestion.label[language]}
                    autoFocus
                  />
                  {validationError && (
                    <p className="mt-2 text-xs text-destructive">{validationError}</p>
                  )}
                  <Button type="button" size="lg" className="mt-4 min-w-36" onClick={submitName}>
                    {text.next}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : currentQuestion.type === "phone" ? (
                <div className="mt-5 max-w-2xl">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <Input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={mobileDraft}
                      disabled={otpSent}
                      onChange={(event) =>
                        setMobileDraft(event.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !otpSent) requestOtp();
                      }}
                      placeholder={
                        language === "ml" ? "10 അക്ക മൊബൈൽ നമ്പർ" : "10-digit mobile number"
                      }
                      className="h-14 rounded-xl text-lg disabled:opacity-75"
                      aria-label={currentQuestion.label[language]}
                      autoFocus
                    />
                    {!otpSent && (
                      <Button type="button" size="lg" className="h-14" onClick={requestOtp}>
                        {text.sendOtp}
                      </Button>
                    )}
                  </div>
                  {validationError && (
                    <p className="mt-2 text-xs text-destructive">{validationError}</p>
                  )}
                  {otpSent && (
                    <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-primary">
                          {text.otpSent} · ••••••{mobileDraft.slice(-4)}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpDraft("");
                            setOtpError("");
                          }}
                          className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                          {text.changeNumber}
                        </button>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <Input
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          value={otpDraft}
                          onChange={(event) => {
                            setOtpDraft(event.target.value.replace(/\D/g, "").slice(0, 6));
                            setOtpError("");
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") verifyOtp();
                          }}
                          placeholder={text.otpPlaceholder}
                          className="h-14 rounded-xl text-lg tracking-[0.28em]"
                          aria-label={text.otpPlaceholder}
                          autoFocus
                        />
                        <Button type="button" size="lg" className="h-14" onClick={verifyOtp}>
                          {text.verifyOtp}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      {otpError && <p className="mt-2 text-xs text-destructive">{otpError}</p>}
                    </div>
                  )}
                </div>
              ) : currentQuestion.type === "email" ? (
                <div className="mt-5 max-w-2xl">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <Input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={emailDraft}
                      disabled={emailOtpSent}
                      onChange={(event) => {
                        setEmailDraft(event.target.value.slice(0, 120));
                        setValidationError("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !emailOtpSent) requestEmailOtp();
                      }}
                      placeholder={language === "ml" ? "ഇമെയിൽ വിലാസം" : "Email address"}
                      className="h-14 rounded-xl text-lg disabled:opacity-75"
                      aria-label={currentQuestion.label[language]}
                      autoFocus
                    />
                    {!emailOtpSent && <Button type="button" size="lg" className="h-14" onClick={requestEmailOtp}>{text.sendOtp}</Button>}
                  </div>
                  {validationError && <p className="mt-2 text-xs text-destructive">{validationError}</p>}
                  {!emailOtpSent && <Button type="button" variant="ghost" className="mt-2" onClick={skipEmail}>{text.skipEmail}</Button>}
                  {emailOtpSent && (
                    <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-primary">{text.otpSent} · {emailDraft}</p>
                        <button type="button" onClick={() => { setEmailOtpSent(false); setEmailOtpDraft(""); setEmailOtpError(""); }} className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">{text.changeEmail}</button>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <Input type="text" inputMode="numeric" autoComplete="one-time-code" value={emailOtpDraft} onChange={(event) => { setEmailOtpDraft(event.target.value.replace(/\D/g, "").slice(0, 6)); setEmailOtpError(""); }} onKeyDown={(event) => { if (event.key === "Enter") verifyEmailOtp(); }} placeholder={text.otpPlaceholder} className="h-14 rounded-xl text-lg tracking-[0.28em]" aria-label={text.otpPlaceholder} autoFocus />
                        <Button type="button" size="lg" className="h-14" onClick={verifyEmailOtp}>{text.verifyOtp}<ArrowRight className="ml-2 h-4 w-4" /></Button>
                      </div>
                      {emailOtpError && <p className="mt-2 text-xs text-destructive">{emailOtpError}</p>}
                    </div>
                  )}
                </div>
              ) : currentQuestion.type === "number" ? (
                <div className="mt-5 max-w-sm">
                  <Input
                    inputMode="numeric"
                    autoComplete="off"
                    value={numberDraft}
                    onChange={(event) =>
                      setNumberDraft(event.target.value.replace(/\D/g, "").slice(0, 3))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") answerQuestion(currentQuestion, numberDraft);
                    }}
                    placeholder={language === "ml" ? "ഉദാ: 62" : "Example: 62"}
                    className="h-14 rounded-xl text-lg"
                    aria-label={currentQuestion.label[language]}
                    autoFocus
                  />
                  {validationError && (
                    <p className="mt-2 text-xs text-destructive">{validationError}</p>
                  )}
                  <Button
                    type="button"
                    size="lg"
                    className="mt-4 min-w-36"
                    onClick={() => answerQuestion(currentQuestion, numberDraft)}
                  >
                    {text.next}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className={`mt-5 grid gap-3 ${currentQuestion.id === "district" ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2"}`}
                >
                  {currentQuestion.options?.map((item) => {
                    const selected = answers[currentQuestion.id] === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => answerQuestion(currentQuestion, item.value)}
                        aria-pressed={selected}
                        className={`group flex min-h-14 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-background hover:border-primary/40 hover:bg-primary/[0.04]"}`}
                      >
                        <span>{item.label[language]}</span>
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${selected ? "border-white/50 bg-white/15" : "border-border bg-muted group-hover:border-primary/40"}`}
                        >
                          {selected && <Check className="h-3.5 w-3.5" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <ProfileSummary language={language} answers={answers} questions={visibleQuestions} />
          </div>
        </section>
      ) : selectedScheme && evaluated[0] ? (
        <SchemeResultPanel
          language={language}
          match={evaluated[0]}
          onEdit={() => {
            setPhase("questions");
            setCurrentIndex(0);
            resultAnnounced.current = false;
          }}
          onRestart={restart}
        />
      ) : (
        <ResultsPanel
          language={language}
          strongMatches={strongMatches}
          possibleMatches={possibleMatches}
          notMatched={notMatched}
          onEdit={() => {
            setPhase("questions");
            setCurrentIndex(0);
            resultAnnounced.current = false;
          }}
          onRestart={restart}
        />
      )}
    </PublicLayout>
  );
}

function IntroPanel({
  language,
  hasSavedAnswers,
  onStart,
  onContinue,
  onClear,
}: {
  language: EligibilityLanguage;
  hasSavedAnswers: boolean;
  onStart: (mode: Mode) => void;
  onContinue: (mode: Mode) => void;
  onClear: () => void;
}) {
  const text = copy[language];
  return (
    <section className="vk-section-shell-narrow vk-eligibility-intro">
      {hasSavedAnswers && (
        <div className="mb-6 flex flex-col justify-between gap-3 rounded-2xl border border-secondary/20 bg-secondary/[0.06] p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <FileCheck2 className="h-5 w-5 text-secondary" />
            <span className="text-sm font-medium">{text.continueSaved}</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onContinue("voice")}>
              SahAI
            </Button>
            <Button size="sm" variant="outline" onClick={onClear}>
              {text.clearSaved}
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onStart("voice")}
          className="group relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.09] via-card to-secondary/[0.08] p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-background shadow-md ring-1 ring-primary/15">
              <img
                src={sahaiAvatar}
                alt="SahAI"
                className="h-full w-full scale-[1.3] object-contain"
                width={256}
                height={256}
              />
            </span>
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/25 [animation-duration:2.5s]" />
              <Mic className="relative h-6 w-6" />
            </span>
          </div>
          <div className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {language === "ml" ? "ശുപാർശ ചെയ്യുന്നു" : "Recommended"}
          </div>
          <h2 className="mt-2 font-display text-xl font-bold sm:text-2xl">{text.voiceCta}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{text.voiceDesc}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            {language === "ml" ? "സംസാരിച്ച് തുടങ്ങാം" : "Start speaking"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onStart("form")}
          className="group rounded-3xl border border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg sm:p-6"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-primary">
            <FileText className="h-7 w-7" />
          </span>
          <h2 className="mt-5 font-display text-xl font-bold sm:text-2xl">{text.formCta}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{text.formDesc}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            {language === "ml" ? "ഫോം തുടങ്ങാം" : "Start the form"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </button>
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground sm:grid-cols-2">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
          <span>{text.privacy}</span>
        </div>
        <div className="flex items-start gap-2.5">
          <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{text.noGuarantee}</span>
        </div>
      </div>
    </section>
  );
}

function ProfileSummary({
  language,
  answers,
  questions,
}: {
  language: EligibilityLanguage;
  answers: EligibilityAnswers;
  questions: EligibilityQuestion[];
}) {
  const text = copy[language];
  const completed = questions.filter((question) => answers[question.id]);
  return (
    <aside className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-semibold">{text.profile}</h3>
          <p className="text-xs text-muted-foreground">
            {completed.length} / {questions.length}
          </p>
        </div>
      </div>
      <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {completed.length ? (
          completed.map((question) => (
            <div key={question.id} className="rounded-xl bg-muted/45 px-3 py-2.5">
              <div className="line-clamp-1 text-[11px] text-muted-foreground">
                {question.label[language]}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                {answers[question.id] === EMAIL_NOT_PROVIDED ? (language === "ml" ? "നൽകിയിട്ടില്ല" : "Not provided") : getAnswerLabel(question, answers[question.id]!, language)}
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
            {language === "ml"
              ? "ആദ്യ ഉത്തരം നൽകിയാൽ ഇവിടെ കാണാം."
              : "Your answers will appear here."}
          </p>
        )}
      </div>
      <div className="mt-4 flex items-start gap-2 border-t border-border pt-4 text-[11px] leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
        {text.sessionOnly}
      </div>
    </aside>
  );
}

function SchemeResultPanel({
  language,
  match,
  onEdit,
  onRestart,
}: {
  language: EligibilityLanguage;
  match: EligibilityMatch;
  onEdit: () => void;
  onRestart: () => void;
}) {
  const eligible = match.status === "strong";
  const needsVerification = match.status === "possible";
  const title = eligible
    ? language === "ml"
      ? "നൽകിയ വിവരങ്ങൾ പ്രകാരം ഈ പദ്ധതിക്ക് അപേക്ഷിക്കാൻ നിങ്ങൾ പ്രാഥമികമായി യോഗ്യരാണ്"
      : "Based on the information provided, you are initially eligible to apply for this scheme"
    : needsVerification
      ? language === "ml"
        ? "നൽകിയ വിവരങ്ങൾ പ്രകാരം യോഗ്യത സ്ഥിരീകരിക്കാൻ കൂടുതൽ പരിശോധന ആവശ്യമാണ്"
        : "More verification is needed to confirm your eligibility based on the information provided"
      : language === "ml"
        ? "ക്ഷമിക്കണം, നൽകിയ വിവരങ്ങൾ പ്രകാരം നിങ്ങൾ നിലവിൽ ഈ പദ്ധതിക്ക് യോഗ്യനല്ല"
        : "Sorry, based on the information provided, you are currently not eligible for this scheme";
  const description = eligible
    ? language === "ml"
      ? "അപേക്ഷാ സഹായത്തിലേക്ക് തുടരാം. അന്തിമ യോഗ്യതയും അംഗീകാരവും ബന്ധപ്പെട്ട പദ്ധതി അധികാരിയുടെ പരിശോധനയ്ക്കും തീരുമാനത്തിനും വിധേയമാണ്."
      : "You can continue to application assistance. Final eligibility and approval are subject to verification and decision by the responsible scheme authority."
    : needsVerification
      ? language === "ml"
        ? "ചില വിവരങ്ങളോ ഔദ്യോഗിക രേഖകളോ പരിശോധിച്ച ശേഷമേ യോഗ്യത സ്ഥിരീകരിക്കാനാകൂ. അന്തിമ തീരുമാനം ബന്ധപ്പെട്ട പദ്ധതി അധികാരിയുടേതാണ്."
        : "Some information or official records must be verified before eligibility can be confirmed. The final decision rests with the responsible scheme authority."
      : language === "ml"
        ? "നൽകിയ ഉത്തരങ്ങളിൽ ഒന്നോ അതിലധികമോ നിലവിലെ പ്രാഥമിക യോഗ്യതാ നിബന്ധനകളുമായി പൊരുത്തപ്പെടുന്നില്ല. ഉത്തരങ്ങൾ തെറ്റാണെങ്കിൽ തിരുത്തി വീണ്ടും പരിശോധിക്കാം."
        : "One or more answers do not meet the current initial eligibility conditions. If any answer is incorrect, you can edit it and check again.";
  const tone = eligible
    ? "border-secondary/25 bg-gradient-to-br from-secondary/[0.10] via-card to-secondary/[0.04]"
    : needsVerification
      ? "border-primary/25 bg-gradient-to-br from-primary/[0.10] via-card to-primary/[0.04]"
      : "border-destructive/20 bg-gradient-to-br from-destructive/[0.07] via-card to-primary/[0.03]";
  const iconTone = eligible
    ? "bg-secondary/10 text-secondary"
    : needsVerification
      ? "bg-primary/10 text-primary"
      : "bg-destructive/10 text-destructive";

  return (
    <section className="vk-section-shell-narrow">
      <article className={`rounded-3xl border p-6 shadow-sm sm:p-8 ${tone}`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconTone}`}
              >
                {eligible ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : needsVerification ? (
                  <CircleHelp className="h-6 w-6" />
                ) : (
                  <CircleX className="h-6 w-6" />
                )}
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {language === "ml" ? "യോഗ്യതാ പരിശോധന പൂർത്തിയായി" : "Eligibility check complete"}
                </div>
                <div className="mt-1 text-sm font-semibold text-primary">
                  {match.scheme[language]}
                </div>
              </div>
            </div>
            <h2 className="mt-5 max-w-4xl font-display text-2xl font-bold leading-tight sm:text-3xl">
              {title}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onEdit}>
              {language === "ml" ? "ഉത്തരങ്ങൾ തിരുത്തുക" : "Edit answers"}
            </Button>
            <Button type="button" variant="ghost" onClick={onRestart}>
              <RotateCcw className="mr-1.5 h-4 w-4" />
              {language === "ml" ? "പുതിയ പരിശോധന" : "New check"}
            </Button>
          </div>
        </div>

        {!eligible && match.failedCriteria.length > 0 && (
          <div className="mt-6 rounded-2xl border border-border/80 bg-background/75 p-4">
            <div className="text-xs font-semibold text-muted-foreground">
              {language === "ml"
                ? "നിലവിലെ ഉത്തരങ്ങളിൽ പൊരുത്തപ്പെടാത്ത നിബന്ധന"
                : "Condition not met by the current answers"}
            </div>
            <ul className="mt-2 space-y-1.5">
              {match.failedCriteria.slice(0, 3).map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm leading-6">
                  <CircleX className="mt-1 h-3.5 w-3.5 shrink-0 text-destructive" />
                  {item[language]}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 border-t border-border/70 pt-5">
          {eligible ? (
            <Button asChild size="lg">
              <Link to="/apply/$schemeId" params={{ schemeId: match.scheme.id }}>
                {language === "ml"
                  ? "അപേക്ഷാ സഹായത്തിലേക്ക് തുടരുക"
                  : "Continue to application assistance"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : needsVerification ? (
            <Button asChild size="lg">
              <Link to="/helpdesk">
                {language === "ml" ? "ഹെൽപ്പ്ഡെസ്ക് സഹായം നേടുക" : "Get helpdesk assistance"}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
          <Button asChild size="lg" variant="outline">
            <Link to="/schemes/$id" params={{ id: match.scheme.id }}>
              {language === "ml" ? "പദ്ധതി വിശദാംശങ്ങൾ" : "View scheme details"}
            </Link>
          </Button>
        </div>
      </article>
    </section>
  );
}
function ResultsPanel({
  language,
  strongMatches,
  possibleMatches,
  notMatched,
  onEdit,
  onRestart,
}: {
  language: EligibilityLanguage;
  strongMatches: EligibilityMatch[];
  possibleMatches: EligibilityMatch[];
  notMatched: EligibilityMatch[];
  onEdit: () => void;
  onRestart: () => void;
}) {
  const text = copy[language];
  const totalMatches = strongMatches.length + possibleMatches.length;
  return (
    <section className="vk-section-shell-narrow">
      <div className="rounded-3xl border border-secondary/20 bg-gradient-to-br from-secondary/[0.09] via-card to-primary/[0.05] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
              <BadgeCheck className="h-4 w-4" />
              {text.resultEyebrow}
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold">{text.resultTitle}</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{totalMatches}</span> {text.matches}.{" "}
              {text.noGuarantee}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onEdit}>
              {text.editAnswers}
            </Button>
            <Button type="button" variant="ghost" onClick={onRestart}>
              <RotateCcw className="mr-1.5 h-4 w-4" />
              {text.restart}
            </Button>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 font-semibold text-secondary">
            <CheckCircle2 className="h-4 w-4" />
            {strongMatches.length} {text.strong}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 font-semibold text-primary">
            <CircleHelp className="h-4 w-4" />
            {possibleMatches.length} {text.possible}
          </span>
        </div>
      </div>

      {strongMatches.length > 0 && (
        <ResultGroup
          language={language}
          title={text.strong}
          description={text.strongDesc}
          matches={strongMatches}
        />
      )}
      {possibleMatches.length > 0 && (
        <ResultGroup
          language={language}
          title={text.possible}
          description={text.possibleDesc}
          matches={possibleMatches}
          possible
        />
      )}

      <details className="mt-8 rounded-2xl border border-border bg-card p-5">
        <summary className="cursor-pointer text-sm font-semibold">
          {text.notMatched} ({notMatched.length})
        </summary>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {notMatched.map((match) => (
            <Link
              key={match.scheme.id}
              to="/schemes/$id"
              params={{ id: match.scheme.id }}
              className="rounded-xl bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground transition hover:text-primary"
            >
              {match.scheme[language]}
            </Link>
          ))}
        </div>
      </details>

      <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-primary/15 bg-primary/[0.05] p-4 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        {text.privacy} {text.documentsNote}
      </div>
    </section>
  );
}

function ResultGroup({
  language,
  title,
  description,
  matches,
  possible = false,
}: {
  language: EligibilityLanguage;
  title: string;
  description: string;
  matches: EligibilityMatch[];
  possible?: boolean;
}) {
  return (
    <div className="mt-10">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${possible ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}
        >
          {possible ? <CircleHelp className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        </span>
        <div>
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {matches.map((match) => (
          <SchemeMatchCard
            key={match.scheme.id}
            language={language}
            match={match}
            possible={possible}
          />
        ))}
      </div>
    </div>
  );
}

function SchemeMatchCard({
  language,
  match,
  possible,
}: {
  language: EligibilityLanguage;
  match: EligibilityMatch;
  possible: boolean;
}) {
  const text = copy[language];
  return (
    <article
      className={`rounded-2xl border bg-card p-5 shadow-sm ${possible ? "border-primary/15" : "border-secondary/20"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {match.scheme.ministry[language]}
          </div>
          <h3 className="mt-1 font-display text-xl font-bold">{match.scheme[language]}</h3>
          <p className="mt-2 text-sm font-medium text-primary">{match.scheme.benefit[language]}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${possible ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}
        >
          {possible ? text.possible : text.strong}
        </span>
      </div>

      {match.matchedCriteria.length > 0 && (
        <div className="mt-5 rounded-xl bg-secondary/[0.06] p-3.5">
          <div className="text-xs font-semibold text-secondary">{text.whyMatched}</div>
          <ul className="mt-2 space-y-1.5">
            {match.matchedCriteria.slice(0, 4).map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-xs leading-5">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
                {item[language]}
              </li>
            ))}
          </ul>
        </div>
      )}

      {match.pendingCriteria.length > 0 && (
        <div className="mt-3 rounded-xl bg-primary/[0.05] p-3.5">
          <div className="text-xs font-semibold text-primary">{text.verify}</div>
          <ul className="mt-2 space-y-1.5">
            {match.pendingCriteria.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-xs leading-5">
                <CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                {item[language]}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <FileCheck2 className="h-4 w-4 text-muted-foreground" />
          {text.documents}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {match.documents.map((document, index) => (
            <span
              key={index}
              className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground"
            >
              {document[language]}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
        <Button asChild size="sm">
          <Link to="/helpdesk">
            {text.helpdesk}
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/schemes/$id" params={{ id: match.scheme.id }}>
            {text.details}
          </Link>
        </Button>
      </div>
    </article>
  );
}
