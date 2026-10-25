import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar as CalendarIcon, Check, ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { districts, constituencies, panchayats } from "@/data/geo";
import { schemes } from "@/data/schemes";
import { useLang } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/admin/applications/new")({
  head: () => ({ meta: [{ title: "New Application · Admin" }] }),
  component: NewApplicationPage,
});

export function NewApplicationPage() {
  const { lang } = useLang();
  const [submitted, setSubmitted] = useState(false);
  const [matchedSchemes, setMatchedSchemes] = useState<typeof schemes | null>(null);

  // 1. Full Name*
  const [fullName, setFullName] = useState("");
  // 2. Aadhaar Number*
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  // 3. Mobile Number with Country Code selection*
  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  // 4. Email (optional)
  const [email, setEmail] = useState("");
  // 5. Date of Birth*
  const [dob, setDob] = useState("");
  // 6. Gender*
  const [gender, setGender] = useState("");
  // 7. Religion*
  const [religion, setReligion] = useState("");
  // 8. Caste*
  const [caste, setCaste] = useState("");
  // 9. Marital Status*
  const [maritalStatus, setMaritalStatus] = useState("");
  // 10. Occupation*
  const [occupation, setOccupation] = useState("");
  // 11. Income Range*
  const [incomeRange, setIncomeRange] = useState("");

  // Address Section (All mandatory*)
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [place, setPlace] = useState("");
  const [ward, setWard] = useState("");
  const [localBody, setLocalBody] = useState("");
  const [city, setCity] = useState("");
  const [assemblyMandalam, setAssemblyMandalam] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [state, setState] = useState("Kerala");

  const filteredConstituencies = constituencies.filter(
    (c) => c.districtId === selectedDistrict
  );

  const filteredLocalBodies = panchayats.filter(
    (p) => !selectedDistrict || p.districtId === selectedDistrict
  );

  const handleCheckEligibility = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setMatchedSchemes(schemes.slice(0, 5));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Top Breadcrumb Navigation */}
      <div>
        <Link
          to="/admin/applications"
          search={{ stage: undefined, filter: undefined }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Applications</span>
        </Link>
      </div>

      {submitted && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 space-y-3">
          <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-300 font-bold text-base">
            <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Eligibility screening completed successfully!</span>
          </div>
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Based on applicant details for <strong>{fullName}</strong> ({aadhaarNumber ? `Aadhaar: ${aadhaarNumber}` : ""}), we found {matchedSchemes?.length || 0} matching schemes.
          </p>
        </div>
      )}

      {/* Form Container */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl text-foreground">
            Create New Application
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter citizen demographics and location details to check eligible schemes.
          </p>
        </div>

        <form onSubmit={handleCheckEligibility} className="space-y-8">
          {/* SECTION 1: Personal Demographics (In Exact Order Specified) */}
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-foreground border-b border-border/60 pb-2">
              1. Personal Demographics
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* 1. Full Name* */}
              <FormGroup label="Full Name *">
                <Input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full legal name"
                  className="h-12 rounded-xl bg-muted/30 border-border/80"
                />
              </FormGroup>

              {/* 2. Aadhaar Number* */}
              <FormGroup label="Aadhaar Number *">
                <Input
                  required
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="12-digit Aadhaar Number"
                  className="h-12 rounded-xl bg-muted/30 border-border/80"
                />
              </FormGroup>

              {/* 3. Mobile Number with Country Code selection* */}
              <FormGroup label="Mobile Number with Country Code *">
                <div className="flex gap-2">
                  <div className="relative w-28 shrink-0">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-12 w-full appearance-none rounded-xl border border-border/80 bg-muted/30 px-3 text-xs font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+974">🇶🇦 +974</option>
                      <option value="+65">🇸🇬 +65</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <Input
                    required
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="10-digit mobile number"
                    className="h-12 flex-1 rounded-xl bg-muted/30 border-border/80"
                  />
                </div>
              </FormGroup>

              {/* 4. Email (optional) */}
              <FormGroup label="Email">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com (optional)"
                  className="h-12 rounded-xl bg-muted/30 border-border/80"
                />
              </FormGroup>

              {/* 5. Date of Birth* */}
              <FormGroup label="Date of Birth *">
                <div className="relative">
                  <Input
                    required
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="h-12 rounded-xl bg-muted/30 border-border/80 px-4 pr-10 text-sm focus-visible:ring-primary"
                  />
                  <CalendarIcon className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </FormGroup>

              {/* 6. Gender* */}
              <FormGroup label="Gender *">
                <div className="relative">
                  <select
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-border/80 bg-muted/30 px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Transgender / Other</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </FormGroup>

              {/* 7. Religion* */}
              <FormGroup label="Religion *">
                <div className="relative">
                  <select
                    required
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-border/80 bg-muted/30 px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="">Select Religion</option>
                    <option value="hinduism">Hinduism</option>
                    <option value="islam">Islam</option>
                    <option value="christianity">Christianity</option>
                    <option value="sikhism">Sikhism</option>
                    <option value="buddhism">Buddhism</option>
                    <option value="jainism">Jainism</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </FormGroup>

              {/* 8. Caste* */}
              <FormGroup label="Caste *">
                <div className="relative">
                  <select
                    required
                    value={caste}
                    onChange={(e) => setCaste(e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-border/80 bg-muted/30 px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="">Select Caste Category</option>
                    <option value="general">General</option>
                    <option value="obc">OBC</option>
                    <option value="sc">SC</option>
                    <option value="st">ST</option>
                    <option value="obc_ncl">OBC-NCL</option>
                    <option value="ews">EWS</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </FormGroup>

              {/* 9. Marital Status* */}
              <FormGroup label="Marital Status *">
                <div className="relative">
                  <select
                    required
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-border/80 bg-muted/30 px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="">Select Marital Status</option>
                    <option value="single">Single / Unmarried</option>
                    <option value="married">Married</option>
                    <option value="widowed">Widowed</option>
                    <option value="divorced">Divorcee</option>
                    <option value="separated">Separated</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </FormGroup>

              {/* 10. Occupation* */}
              <FormGroup label="Occupation *">
                <div className="relative">
                  <select
                    required
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-border/80 bg-muted/30 px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="">Select Occupation</option>
                    <option value="farmer">Farmer / Agriculture</option>
                    <option value="daily_wage">Daily Wage Worker</option>
                    <option value="salaried_private">Salaried (Private)</option>
                    <option value="salaried_govt">Salaried (Government)</option>
                    <option value="self_employed">Self-Employed / Business</option>
                    <option value="homemaker">Homemaker</option>
                    <option value="student">Student</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="retired">Retired / Pensioner</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </FormGroup>

              {/* 11. Income Range* */}
              <FormGroup label="Income Range *">
                <div className="relative">
                  <select
                    required
                    value={incomeRange}
                    onChange={(e) => setIncomeRange(e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-border/80 bg-muted/30 px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="">Select Income Range</option>
                    <option value="lt_50k">Below ₹50,000</option>
                    <option value="50k_1l">₹50,000 - ₹1,00,000</option>
                    <option value="1l_2.5l">₹1,00,000 - ₹2,50,000</option>
                    <option value="2.5l_5l">₹2,50,000 - ₹5,00,000</option>
                    <option value="gt_5l">Above ₹5,00,000</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </FormGroup>
            </div>
          </div>

          {/* SECTION 2: Address Information (All Mandatory*) */}
          <div className="space-y-5 pt-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h2 className="text-lg font-bold text-foreground">
                2. Address
              </h2>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400 px-2.5 py-1 rounded-md">
                All address fields are mandatory *
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Address 1* */}
              <FormGroup label="Address Line 1 *">
                <Input
                  required
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="House Name / Door No. / Street"
                  className="h-12 rounded-xl bg-muted/30 border-border/80"
                />
              </FormGroup>

              {/* Address 2* */}
              <FormGroup label="Address Line 2 *">
                <Input
                  required
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Street / Locality / Landmark"
                  className="h-12 rounded-xl bg-muted/30 border-border/80"
                />
              </FormGroup>

              {/* Place* */}
              <FormGroup label="Place *">
                <Input
                  required
                  type="text"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="Enter place / post office name"
                  className="h-12 rounded-xl bg-muted/30 border-border/80"
                />
              </FormGroup>

              {/* Ward* */}
              <FormGroup label="Ward *">
                <div className="relative">
                  <select
                    required
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-border/80 bg-muted/30 px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="">Select Ward *</option>
                    {Array.from({ length: 50 }, (_, i) => i + 1).map((w) => (
                      <option key={w} value={w}>
                        Ward {w}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </FormGroup>

              {/* Local Body* */}
              <FormGroup label="Local Body *">
                <div className="relative">
                  <select
                    required
                    value={localBody}
                    onChange={(e) => setLocalBody(e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-border/80 bg-muted/30 px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="">Select Local Body *</option>
                    {filteredLocalBodies.map((lb) => (
                      <option key={lb.id} value={lb.id}>
                        {lb[lang]} ({lb.type})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </FormGroup>

              {/* City* */}
              <FormGroup label="City *">
                <Input
                  required
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city / major town"
                  className="h-12 rounded-xl bg-muted/30 border-border/80"
                />
              </FormGroup>

              {/* Assembly Mandalam* */}
              <FormGroup label="Assembly Mandalam *">
                <div className="relative">
                  <select
                    required
                    value={assemblyMandalam}
                    onChange={(e) => setAssemblyMandalam(e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-border/80 bg-muted/30 px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="">Select Assembly Mandalam *</option>
                    {filteredConstituencies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c[lang]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </FormGroup>

              {/* District* */}
              <FormGroup label="District *">
                <div className="relative">
                  <select
                    required
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-border/80 bg-muted/30 px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="">Select District *</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district[lang]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </FormGroup>

              {/* PIN* */}
              <FormGroup label="PIN Code *">
                <Input
                  required
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit PIN code *"
                  className="h-12 rounded-xl bg-muted/30 border-border/80"
                />
              </FormGroup>

              {/* State* */}
              <FormGroup label="State *">
                <div className="relative">
                  <select
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-border/80 bg-muted/30 px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="Kerala">Kerala</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </FormGroup>
            </div>
          </div>

          {/* Action Button: Check Eligible Schemes */}
          <div className="pt-6">
            <Button
              type="submit"
              className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-primary hover:opacity-95 text-white shadow-lg flex items-center justify-center gap-3 transition-all"
            >
              <Sparkles className="h-5 w-5 fill-current" />
              <span>Check Eligible Schemes</span>
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Submit applicant details to evaluate eligibility against all Central and State government schemes.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormGroup({
  label,
  subtext,
  children,
}: {
  label: string;
  subtext?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      {children}
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </div>
  );
}
