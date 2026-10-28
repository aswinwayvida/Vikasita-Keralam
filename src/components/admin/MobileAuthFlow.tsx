import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  Headphones,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import mobileAuthHero from "@/assets/mobile-auth-hero.png";
import officialLotus from "@/assets/bjp-official-lotus.png";
import { useLang } from "@/i18n/LanguageProvider";

type MobileAuthFlowProps = {
  onBack: () => void;
  onAuthenticated: () => void;
  onContinueAsGuest: () => void;
  onContactSupport: () => void;
};

type AuthStep = "login" | "otp";
type MobileError = "required" | "invalid" | null;
type OtpError = "required" | "expired" | null;

const EMPTY_OTP = ["", "", "", "", "", ""];
const OTP_EXPIRY_MS = 5 * 60 * 1000;

export function MobileAuthFlow({
  onBack,
  onAuthenticated,
  onContinueAsGuest,
  onContactSupport,
}: MobileAuthFlowProps) {
  const { lang, setLang } = useLang();
  const t = (en: string, ml: string) => (lang === "ml" ? ml : en);
  const [step, setStep] = useState<AuthStep>("login");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState<MobileError>(null);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(EMPTY_OTP);
  const [otpError, setOtpError] = useState<OtpError>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(30);
  const [otpIssuedAt, setOtpIssuedAt] = useState<number | null>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const actionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (actionTimerRef.current !== null) {
        window.clearTimeout(actionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (step !== "otp" || resendSeconds <= 0) return;
    const timer = window.setTimeout(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [step, resendSeconds]);

  useEffect(() => {
    if (step !== "otp") return;
    const timer = window.setTimeout(() => otpInputRefs.current[0]?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [step]);

  const scheduleAction = (callback: () => void, delay = 650) => {
    if (actionTimerRef.current !== null) {
      window.clearTimeout(actionTimerRef.current);
    }
    actionTimerRef.current = window.setTimeout(callback, delay);
  };

  const validateMobile = () => {
    if (!mobile) {
      setMobileError("required");
      return false;
    }
    if (mobile.length !== 10 || !/^[6-9]\d{9}$/.test(mobile)) {
      setMobileError("invalid");
      return false;
    }
    setMobileError(null);
    return true;
  };

  const handleRequestOtp = () => {
    if (requestingOtp || !validateMobile()) return;

    setRequestingOtp(true);
    setOtpDigits(EMPTY_OTP);
    setOtpError(null);
    scheduleAction(() => {
      setRequestingOtp(false);
      setStep("otp");
      setResendSeconds(30);
      setOtpIssuedAt(Date.now());
    }, 700);
  };

  const handleChangeNumber = () => {
    if (requestingOtp || verifying) return;
    setStep("login");
    setOtpDigits(EMPTY_OTP);
    setOtpError(null);
    setResendSeconds(30);
    setOtpIssuedAt(null);
    window.setTimeout(() => mobileInputRef.current?.focus(), 60);
  };

  const handleBack = () => {
    if (step === "otp") {
      handleChangeNumber();
      return;
    }
    onBack();
  };

  const handleMobileChange = (value: string) => {
    setMobile(value.replace(/\D/g, "").slice(0, 10));
    if (mobileError) setMobileError(null);
  };

  const fillOtpDigits = (startIndex: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      const next = [...otpDigits];
      next[startIndex] = "";
      setOtpDigits(next);
      return;
    }

    const next = [...otpDigits];
    digits.split("").forEach((digit, offset) => {
      const targetIndex = startIndex + offset;
      if (targetIndex < next.length) next[targetIndex] = digit;
    });
    setOtpDigits(next);
    setOtpError(null);
    const focusIndex = Math.min(startIndex + digits.length, next.length - 1);
    otpInputRefs.current[focusIndex]?.focus();
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      const next = [...otpDigits];
      next[index - 1] = "";
      setOtpDigits(next);
      otpInputRefs.current[index - 1]?.focus();
      return;
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    if (verifying) return;
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setOtpError("required");
      return;
    }
    if (otpIssuedAt && Date.now() - otpIssuedAt > OTP_EXPIRY_MS) {
      setOtpError("expired");
      return;
    }

    setOtpError(null);
    setVerifying(true);
    scheduleAction(() => {
      setVerifying(false);
      onAuthenticated();
    }, 750);
  };

  const handleResendOtp = () => {
    if (resendSeconds > 0 || resending || verifying) return;
    setResending(true);
    setOtpDigits(EMPTY_OTP);
    setOtpError(null);
    scheduleAction(() => {
      setResending(false);
      setResendSeconds(30);
      setOtpIssuedAt(Date.now());
      otpInputRefs.current[0]?.focus();
    }, 650);
  };

  const maskedMobile = `+91 ••••••${mobile.slice(-4)}`;
  const resendLabel = `00:${String(resendSeconds).padStart(2, "0")}`;

  return (
    <div className="flex min-h-full flex-col bg-white text-[#0a1f44]">
      <div className="relative overflow-hidden bg-[#0a4d9c] flex flex-col">
        {/* Top bar controls so header image faces are completely unobscured */}
        <div className="relative z-10 flex items-center justify-between px-3 pt-2.5 pb-1">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 bg-white/95 text-[#0a1f44] shadow-xs transition-all hover:bg-white active:scale-95 cursor-pointer"
            aria-label={t("Go back", "പിന്നോട്ട് പോകുക")}
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.4]" />
          </button>

          <button
            type="button"
            onClick={() => setLang(lang === "ml" ? "en" : "ml")}
            className="flex h-8 min-w-[58px] items-center justify-center gap-1 rounded-lg border border-white/40 bg-white/95 px-2.5 text-[11px] font-extrabold text-[#0a1f44] shadow-xs transition-all hover:bg-white active:scale-95 cursor-pointer"
            aria-label={t("Change language", "ഭാഷ മാറ്റുക")}
          >
            <span>{lang === "ml" ? "മല" : "EN"}</span>
            <ChevronDown className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Hero banner image with full face visibility */}
        <div className="relative w-full">
          <img
            src={mobileAuthHero}
            alt={t(
              "Vikasita Keralam with BJP lotus emblem and portraits of Rajeev Chandrasekhar and Narendra Modi",
              "ബിജെപി താമര ചിഹ്നവും രാജീവ് ചന്ദ്രശേഖറിന്റെയും നരേന്ദ്ര മോദിയുടെയും ചിത്രങ്ങളും ഉള്പ്പെട്ട വികസിത കേരളം",
            )}
            className="block h-auto w-full object-cover object-top"
          />
        </div>
      </div>

      <section className="relative -mt-5 flex-1 rounded-t-[28px] border-t border-[#f8dccb] bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 shadow-[0_-8px_22px_rgba(11,59,102,0.06)]">
        {step === "login" ? (
          <div className="animate-in fade-in slide-in-from-right-2 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#f4d3bf] bg-[#fff8f2] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#e15307]">
                  <img src={officialLotus} alt="BJP Logo" className="h-4 w-4 object-contain shrink-0" />
                  <span>BJP KERALAM</span>
                </div>
                <h1 className="text-[17px] sm:text-[18px] font-extrabold leading-tight tracking-tight text-[#0a1f44] whitespace-nowrap truncate min-w-0">
                  {t("Welcome to Vikasita Keralam", "വികസിത കേരളത്തിലേക്ക് സ്വാഗതം")}
                </h1>
                <p className="mt-2 text-[13.5px] leading-5 text-[#45516a]">
                  {t("Log in with your mobile number.", "നിങ്ങളുടെ മൊബൈല്‍ നമ്പര്‍ ഉപയോഗിച്ച് ലോഗിന്‍ ചെയ്യുക.")}
                </p>
              </div>
            </div>

            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault();
                handleRequestOtp();
              }}
            >
              <label className="block text-[12.5px] font-extrabold text-[#0a1f44]" htmlFor="mobile-number">
                {t("Mobile number", "മൊബൈല്‍ നമ്പര്‍")}
              </label>
              <div
                className={`mt-2 flex min-h-[52px] items-stretch overflow-hidden rounded-xl border bg-[#fffaf5] transition-all ${
                  mobileError
                    ? "border-rose-400 ring-2 ring-rose-100"
                    : "border-[#f3d2bf] focus-within:border-[#f15a0a] focus-within:ring-2 focus-within:ring-[#f15a0a]/15"
                }`}
              >
                <span className="flex shrink-0 items-center border-r border-[#e9d8cb] px-3.5 text-[13px] font-bold text-[#0a1f44]">
                  +91
                </span>
                <input
                  ref={mobileInputRef}
                  id="mobile-number"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={mobile}
                  onChange={(event) => handleMobileChange(event.target.value)}
                  placeholder={t("Enter 10-digit mobile number", "10 അക്ക മൊബൈല്‍ നമ്പര്‍ നല്‍കുക")}
                  maxLength={10}
                  className="min-w-0 flex-1 bg-transparent px-3.5 text-[14px] font-semibold text-[#0a1f44] outline-none placeholder:font-normal placeholder:text-[#9a9aa2]"
                  aria-invalid={Boolean(mobileError)}
                  aria-describedby={mobileError ? "mobile-error" : "mobile-helper"}
                />
              </div>

              {mobileError ? (
                <p id="mobile-error" role="alert" className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-rose-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {mobileError === "required"
                    ? t("Enter your mobile number.", "നിങ്ങളുടെ മൊബൈല്‍ നമ്പര്‍ നല്‍കുക.")
                    : t("Enter a valid 10-digit Indian mobile number.", "സാധുവായ 10 അക്ക ഇന്ത്യന്‍ മൊബൈല്‍ നമ്പര്‍ നല്‍കുക.")}
                </p>
              ) : (
                <p id="mobile-helper" className="mt-2 text-[11.5px] text-[#5b6478]">
                  {t("We’ll send a verification code by SMS.", "SMS വഴി സ്ഥിരീകരണ കോഡ് അയയ്ക്കും.")}
                </p>
              )}

              <button
                type="submit"
                disabled={requestingOtp}
                className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#f15a0a] px-4 text-[13px] font-extrabold text-white shadow-[0_7px_18px_rgba(241,90,10,0.24)] transition-all hover:bg-[#db4d04] active:scale-[0.99] disabled:cursor-wait disabled:opacity-75 cursor-pointer"
              >
                {requestingOtp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("Sending OTP…", "OTP അയയ്ക്കുന്നു…")}
                  </>
                ) : (
                  t("Get OTP", "OTP ലഭിക്കുക")
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-[11px] leading-5 text-[#596276]">
              {t("By continuing, you agree to our", "തുടരുന്നതിലൂടെ നിങ്ങൾ അംഗീകരിക്കുന്നത്")}{" "}
              <a href="#terms" onClick={(event) => event.preventDefault()} className="font-bold text-[#e15307] underline underline-offset-2">
                {t("Terms of Use", "ഉപയോഗ നിബന്ധനകൾ")}
              </a>{" "}
              {t("and", "ഒപ്പം")}{" "}
              <a href="#privacy" onClick={(event) => event.preventDefault()} className="font-bold text-[#e15307] underline underline-offset-2">
                {t("Privacy Policy", "സ്വകാര്യതാ നയം")}
              </a>
              .
            </p>

            <button
              type="button"
              onClick={onContinueAsGuest}
              className="mt-5 flex min-h-11 w-full items-center gap-3 text-[12.5px] font-extrabold text-[#d9570b] cursor-pointer"
            >
              <span className="h-px flex-1 bg-[#dce1e9]" />
              <span className="whitespace-nowrap">{t("Continue as Guest", "അതിഥിയായി തുടരുക")}</span>
              <span className="h-px flex-1 bg-[#dce1e9]" />
            </button>

            {/* Powered By Wayvida */}
            <div className="mt-4 pb-1 text-center">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                Powered by <span className="font-extrabold text-[#f15a0a]">Wayvida</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-2 duration-200">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f4d3bf] bg-[#fff8f2] px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.08em] text-[#e15307]">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("One-time password", "ഒറ്റത്തവണ പാസ്‌വേഡ്")}
            </div>

            <h1 className="mt-2 text-[26px] font-extrabold leading-[1.08] tracking-[-0.025em] text-[#0a1f44]">
              {t("Verify your number", "നിങ്ങളുടെ നമ്പര്‍ സ്ഥിരീകരിക്കുക")}
            </h1>
            <p className="mt-2 text-[13.5px] leading-5 text-[#45516a]">
              {t("Enter the 6-digit OTP sent to", "അയച്ച 6 അക്ക OTP നൽകുക")}{" "}
              <span className="font-bold text-[#0a1f44]">{maskedMobile}</span>.
            </p>

            <button
              type="button"
              onClick={handleChangeNumber}
              disabled={requestingOtp || verifying || resending}
              className="mt-3 min-h-11 text-[12px] font-extrabold text-[#d9570b] underline underline-offset-4 transition-opacity disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {t("Change number", "നമ്പര്‍ മാറ്റുക")}
            </button>

            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault();
                handleVerifyOtp();
              }}
            >
              <fieldset>
                <legend className="sr-only">{t("Six-digit verification code", "ആറ് അക്ക സ്ഥിരീകരണ കോഡ്")}</legend>
                <div className="grid grid-cols-6 gap-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpInputRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      pattern="[0-9]*"
                      maxLength={index === 0 ? 6 : 1}
                      value={digit}
                      onChange={(event) => fillOtpDigits(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      onFocus={(event) => event.currentTarget.select()}
                      aria-label={t(`OTP digit ${index + 1}`, `OTP അക്കം ${index + 1}`)}
                      aria-invalid={Boolean(otpError)}
                      className={`h-[52px] min-w-0 rounded-xl border bg-[#fffaf5] text-center text-[20px] font-extrabold text-[#0a1f44] outline-none transition-all ${
                        otpError
                          ? "border-rose-400 ring-2 ring-rose-100"
                          : "border-[#f3d2bf] focus:border-[#f15a0a] focus:ring-2 focus:ring-[#f15a0a]/15"
                      }`}
                    />
                  ))}
                </div>
              </fieldset>

              {otpError ? (
                <p role="alert" className="mt-2.5 flex items-start gap-1.5 text-[11px] font-semibold leading-4 text-rose-600">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {otpError === "expired"
                    ? t("This OTP has expired. Resend a new code to continue.", "ഈ OTP കാലഹരണപ്പെട്ടു. തുടരാൻ പുതിയ കോഡ് വീണ്ടും അയയ്ക്കുക.")
                    : t("Enter the complete 6-digit code.", "പൂർണ്ണമായ 6 അക്ക കോഡ് നൽകുക.")}
                </p>
              ) : (
                <p className="mt-2.5 text-[11.5px] text-[#5b6478]">
                  {t("Paste or autofill the code from your SMS.", "SMS-ൽ നിന്നുള്ള കോഡ് പേസ്റ്റ് ചെയ്യുകയോ ഓട്ടോഫിൽ ചെയ്യുകയോ ചെയ്യാം.")}
                </p>
              )}

              <button
                type="submit"
                disabled={verifying || resending}
                className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#f15a0a] px-4 text-[13px] font-extrabold text-white shadow-[0_7px_18px_rgba(241,90,10,0.24)] transition-all hover:bg-[#db4d04] active:scale-[0.99] disabled:cursor-wait disabled:opacity-75 cursor-pointer"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("Verifying…", "സ്ഥിരീകരിക്കുന്നു…")}
                  </>
                ) : (
                  t("Verify & Continue", "സ്ഥിരീകരിച്ച് തുടരുക")
                )}
              </button>
            </form>

            <div className="mt-5 flex min-h-11 items-center justify-center text-[12px] font-semibold text-[#596276]">
              {resending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t("Sending a new code…", "പുതിയ കോഡ് അയയ്ക്കുന്നു…")}
                </span>
              ) : resendSeconds > 0 ? (
                <span>
                  {t("Resend OTP in", "OTP വീണ്ടും അയയ്ക്കാൻ")}{" "}
                  <span className="tabular-nums text-[#0a1f44]">{resendLabel}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={verifying}
                  className="min-h-11 px-2 font-extrabold text-[#d9570b] underline underline-offset-4 disabled:opacity-60 cursor-pointer"
                >
                  {t("Resend OTP", "OTP വീണ്ടും അയയ്ക്കുക")}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onContactSupport}
              className="mx-auto mt-3 flex min-h-11 items-center justify-center gap-2 px-3 text-[12px] font-bold text-[#0a4d9c] cursor-pointer"
            >
              <Headphones className="h-4 w-4" />
              {t("Need help? Contact support", "സഹായം വേണോ? സപ്പോർട്ടിനെ ബന്ധപ്പെടുക")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
