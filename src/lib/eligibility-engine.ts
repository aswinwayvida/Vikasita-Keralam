import type { Scheme } from "@/data/schemes";

export type EligibilityLanguage = "ml" | "en";
export type BilingualText = Record<EligibilityLanguage, string>;

export type QuestionId =
  | "fullName"
  | "mobile"
  | "email"
  | "age"
  | "gender"
  | "maritalStatus"
  | "district"
  | "residenceType"
  | "socialCategory"
  | "minorityStatus"
  | "disabilityStatus"
  | "disabilityPercentage"
  | "annualIncome"
  | "rationCard"
  | "occupation"
  | "landStatus"
  | "educationLevel"
  | "workerType"
  | "businessStatus"
  | "maternityStatus"
  | "bankAccount"
  | "puccaHouse"
  | "lpgConnection"
  | "toiletAccess";

export type EligibilityAnswers = Partial<Record<QuestionId, string>>;
export type QuestionSection = "personal" | "location" | "social" | "livelihood" | "readiness";

export type EligibilityOption = {
  value: string;
  label: BilingualText;
  keywords: string[];
};

export type EligibilityQuestion = {
  id: QuestionId;
  section: QuestionSection;
  type: "text" | "phone" | "email" | "number" | "choice";
  label: BilingualText;
  helper: BilingualText;
  options?: EligibilityOption[];
  when?: (answers: EligibilityAnswers) => boolean;
};

export type CriterionState = "met" | "failed" | "unknown";

type RuleCriterion = {
  label: BilingualText;
  pending: BilingualText;
  evaluate: (answers: EligibilityAnswers) => CriterionState;
};

type SchemeRule = {
  schemeId: string;
  criteria: RuleCriterion[];
  documents: BilingualText[];
};

export type EligibilityMatch = {
  scheme: Scheme;
  status: "strong" | "possible" | "not-matched";
  matchedCriteria: BilingualText[];
  pendingCriteria: BilingualText[];
  failedCriteria: BilingualText[];
  documents: BilingualText[];
};

const bi = (ml: string, en: string): BilingualText => ({ ml, en });

const option = (value: string, ml: string, en: string, keywords: string[] = []): EligibilityOption => ({
  value,
  label: bi(ml, en),
  keywords: [ml, en, value, ...keywords].map((keyword) => keyword.toLocaleLowerCase()),
});

const unknownOption = option("unknown", "അറിയില്ല", "I don't know", ["അറിയില്ല", "not sure", "don't know"]);

const yesNoUnknown = (): EligibilityOption[] => [
  option("yes", "അതെ", "Yes", ["ഉണ്ട്", "yes", "ആണ്"]),
  option("no", "അല്ല", "No", ["ഇല്ല", "no", "അല്ല"]),
  unknownOption,
];

const yesNo = (): EligibilityOption[] => yesNoUnknown().slice(0, 2);

export const questionSectionLabels: Record<QuestionSection, BilingualText> = {
  personal: bi("വ്യക്തിഗത വിവരം", "About you"),
  location: bi("താമസ വിവരം", "Residence"),
  social: bi("കുടുംബവും സാമൂഹിക വിവരവും", "Household & social profile"),
  livelihood: bi("പഠനവും തൊഴിലും", "Education & livelihood"),
  readiness: bi("അടിസ്ഥാന സൗകര്യങ്ങൾ", "Application readiness"),
};

const districts: Array<[string, string, string]> = [
  ["tvm", "തിരുവനന്തപുരം", "Thiruvananthapuram"],
  ["klm", "കൊല്ലം", "Kollam"],
  ["pta", "പത്തനംതിട്ട", "Pathanamthitta"],
  ["alp", "ആലപ്പുഴ", "Alappuzha"],
  ["ktm", "കോട്ടയം", "Kottayam"],
  ["idk", "ഇടുക്കി", "Idukki"],
  ["ekm", "എറണാകുളം", "Ernakulam"],
  ["tsr", "തൃശ്ശൂർ", "Thrissur"],
  ["pkd", "പാലക്കാട്", "Palakkad"],
  ["mlp", "മലപ്പുറം", "Malappuram"],
  ["kkd", "കോഴിക്കോട്", "Kozhikode"],
  ["wnd", "വയനാട്", "Wayanad"],
  ["knr", "കണ്ണൂർ", "Kannur"],
  ["ksd", "കാസർഗോഡ്", "Kasaragod"],
];

export const eligibilityQuestions: EligibilityQuestion[] = [
  {
    id: "fullName",
    section: "personal",
    type: "text",
    label: bi("നിങ്ങളുടെ പേര് എന്താണ്?", "What is your full name?"),
    helper: bi("പൂർണ്ണമായ പേര് നൽകുക.", "Enter your full name."),
  },
  {
    id: "mobile",
    section: "personal",
    type: "phone",
    label: bi("നിങ്ങളുടെ മൊബൈൽ നമ്പർ നൽകുക", "Enter your mobile number"),
    helper: bi("OTP ഉപയോഗിച്ച് മൊബൈൽ നമ്പർ സ്ഥിരീകരിക്കുക.", "Verify your mobile number using an OTP."),
  },
  {
    id: "email",
    section: "personal",
    type: "email",
    label: bi("നിങ്ങളുടെ ഇമെയിൽ വിലാസം നൽകുക (ഐച്ഛികം)", "Enter your email address (optional)"),
    helper: bi("ഇമെയിൽ നൽകിയാൽ OTP ഉപയോഗിച്ച് സ്ഥിരീകരിക്കണം.", "If provided, verify the email address using an OTP."),
  },
  {
    id: "age",
    section: "personal",
    type: "number",
    label: bi("നിങ്ങളുടെ പ്രായം എത്രയാണ്?", "What is your age?"),
    helper: bi("പൂർണ്ണമായ വയസ്സ് നൽകുക. ഉദാഹരണം: 62", "Enter completed years. Example: 62"),
  },
  {
    id: "gender",
    section: "personal",
    type: "choice",
    label: bi("നിങ്ങളുടെ ലിംഗം തിരഞ്ഞെടുക്കൂ", "Select your gender"),
    helper: bi("ചില പദ്ധതികൾ സ്ത്രീകൾക്കും പെൺകുട്ടികൾക്കും പ്രത്യേകമായതാണ്.", "Some schemes are designed for women and girl children."),
    options: [
      option("male", "പുരുഷൻ", "Male", ["man"]),
      option("female", "സ്ത്രീ", "Female", ["woman"]),
      option("transgender", "ട്രാൻസ്‌ജെൻഡർ", "Transgender"),
      option("prefer_not", "പറയാൻ താൽപര്യമില്ല", "Prefer not to say"),
    ],
  },
  {
    id: "maritalStatus",
    section: "personal",
    type: "choice",
    label: bi("നിങ്ങളുടെ വൈവാഹിക നില എന്താണ്?", "What is your marital status?"),
    helper: bi("വിധവാ സഹായം പോലുള്ള പദ്ധതികൾ കണ്ടെത്താൻ ഇത് സഹായിക്കും.", "This helps identify schemes linked to family status."),
    options: [
      option("single", "അവിവാഹിതൻ / അവിവാഹിത", "Single"),
      option("married", "വിവാഹിതൻ / വിവാഹിത", "Married"),
      option("widowed", "വിധവ / വിഭാര്യൻ", "Widowed"),
      option("separated", "വേർപിരിഞ്ഞത് / വിവാഹമോചനം", "Separated / divorced"),
      unknownOption,
    ],
  },
  {
    id: "district",
    section: "location",
    type: "choice",
    label: bi("കേരളത്തിലെ ഏത് ജില്ലയിലാണ് താമസം?", "Which Kerala district do you live in?"),
    helper: bi("പ്രാദേശിക സഹായകേന്ദ്രവും ലഭ്യതയും കണ്ടെത്താൻ ജില്ല ഉപയോഗിക്കും.", "District helps us connect you to local assistance."),
    options: districts.map(([value, ml, en]) => option(value, ml, en)),
  },
  {
    id: "residenceType",
    section: "location",
    type: "choice",
    label: bi("താമസ പ്രദേശം ഏത് വിഭാഗത്തിലാണ്?", "What type of area do you live in?"),
    helper: bi("ഗ്രാമ–നഗര പദ്ധതികളുടെ നിബന്ധനകൾ വ്യത്യസ്തമായേക്കാം.", "Rural and urban scheme conditions can differ."),
    options: [
      option("rural", "ഗ്രാമപ്രദേശം", "Rural"),
      option("urban", "നഗരപ്രദേശം", "Urban"),
    ],
  },
  {
    id: "socialCategory",
    section: "social",
    type: "choice",
    label: bi("നിങ്ങളുടെ സാമൂഹിക വിഭാഗം ഏതാണ്?", "What is your social category?"),
    helper: bi("വിഭാഗം അടിസ്ഥാനമാക്കിയുള്ള സഹായങ്ങൾ കണ്ടെത്താൻ മാത്രം ഉപയോഗിക്കുന്നു.", "Used only to identify category-linked benefits."),
    options: [
      option("general", "ജനറൽ", "General"),
      option("obc", "OBC / SEBC", "OBC / SEBC"),
      option("sc", "പട്ടികജാതി (SC)", "Scheduled Caste (SC)"),
      option("st", "പട്ടികവർഗം (ST)", "Scheduled Tribe (ST)"),
      option("prefer_not", "പറയാൻ താൽപര്യമില്ല", "Prefer not to say"),
    ],
  },
  {
    id: "minorityStatus",
    section: "social",
    type: "choice",
    label: bi("ന്യൂനപക്ഷ വിഭാഗത്തിൽ ഉൾപ്പെടുന്നുണ്ടോ?", "Do you belong to a notified minority community?"),
    helper: bi("ന്യൂനപക്ഷ സ്കോളർഷിപ്പുകളും സഹായങ്ങളും കണ്ടെത്താൻ ഇത് സഹായിക്കും.", "This helps identify minority scholarships and support."),
    options: yesNoUnknown(),
  },
  {
    id: "disabilityStatus",
    section: "social",
    type: "choice",
    label: bi("ഭിന്നശേഷി ഉണ്ടോ?", "Are you a person with disability?"),
    helper: bi("സഹായ ഉപകരണങ്ങളും പ്രത്യേക പദ്ധതികളും കണ്ടെത്താൻ.", "Used to identify disability-specific support."),
    options: yesNoUnknown(),
  },
  {
    id: "disabilityPercentage",
    section: "social",
    type: "choice",
    label: bi("ഭിന്നശേഷി ശതമാനം എത്രയാണ്?", "What is the disability percentage?"),
    helper: bi("സർട്ടിഫിക്കറ്റിലുള്ള ഏകദേശ പരിധി തിരഞ്ഞെടുക്കാം.", "Choose the approximate range on the certificate."),
    when: (answers) => answers.disabilityStatus === "yes",
    options: [
      option("below40", "40%-ൽ താഴെ", "Below 40%"),
      option("fortyPlus", "40% അല്ലെങ്കിൽ കൂടുതൽ", "40% or above"),
      unknownOption,
    ],
  },
  {
    id: "annualIncome",
    section: "social",
    type: "choice",
    label: bi("കുടുംബത്തിന്റെ വാർഷിക വരുമാനം ഏകദേശം എത്രയാണ്?", "What is your approximate annual household income?"),
    helper: bi("കൃത്യമായ തുകയോ രേഖയോ ഇപ്പോൾ വേണ്ട.", "No exact amount or document is required now."),
    options: [
      option("under1", "₹1 ലക്ഷത്തിൽ താഴെ", "Below ₹1 lakh"),
      option("oneToTwoFive", "₹1–2.5 ലക്ഷം", "₹1–2.5 lakh"),
      option("twoFiveToFive", "₹2.5–5 ലക്ഷം", "₹2.5–5 lakh"),
      option("fiveToEight", "₹5–8 ലക്ഷം", "₹5–8 lakh"),
      option("aboveEight", "₹8 ലക്ഷത്തിന് മുകളിൽ", "Above ₹8 lakh"),
      unknownOption,
    ],
  },
  {
    id: "rationCard",
    section: "social",
    type: "choice",
    label: bi("നിങ്ങളുടെ കുടുംബത്തിന്റെ റേഷൻ കാർഡ് വിഭാഗം ഏതാണ്?", "What is your household ration-card category?"),
    helper: bi("മുൻഗണനാ കുടുംബങ്ങൾക്കുള്ള പദ്ധതികൾ പരിശോധിക്കാൻ.", "Used to check schemes for priority households."),
    options: [
      option("aay", "മഞ്ഞ / AAY", "Yellow / AAY"),
      option("bpl", "പിങ്ക് / PHH", "Pink / PHH"),
      option("nps", "നീല / NPS", "Blue / NPS"),
      option("apl", "വെള്ള / NPNS", "White / NPNS"),
      option("none", "റേഷൻ കാർഡ് ഇല്ല", "No ration card"),
      unknownOption,
    ],
  },
  {
    id: "occupation",
    section: "livelihood",
    type: "choice",
    label: bi("നിങ്ങളുടെ പ്രധാന നിലയോ തൊഴിലോ എന്താണ്?", "What is your main occupation or current status?"),
    helper: bi("ഇതനുസരിച്ച് അടുത്ത ചോദ്യങ്ങൾ ചുരുക്കും.", "Your answer determines the next relevant questions."),
    options: [
      option("farmer", "കർഷകൻ", "Farmer", ["കൃഷി"]),
      option("student", "വിദ്യാർത്ഥി", "Student"),
      option("employee", "ശമ്പള ജോലി", "Salaried employee"),
      option("unorganised", "അസംഘടിത തൊഴിലാളി", "Unorganised worker", ["daily wage", "തൊഴിലാളി"]),
      option("selfEmployed", "സ്വയംതൊഴിൽ / സംരംഭകൻ", "Self-employed / entrepreneur", ["business", "ബിസിനസ്"]),
      option("unemployed", "തൊഴിൽ അന്വേഷിക്കുന്നു", "Unemployed / job seeker"),
      option("homemaker", "ഗൃഹനാഥ / ഗൃഹനാഥൻ", "Homemaker"),
      option("retired", "വിരമിച്ചവർ / മുതിർന്ന പൗരൻ", "Retired / senior citizen"),
    ],
  },
  {
    id: "landStatus",
    section: "livelihood",
    type: "choice",
    label: bi("കൃഷിഭൂമിയുമായുള്ള ബന്ധം എന്താണ്?", "What is your relationship to agricultural land?"),
    helper: bi("PM-KISAN പോലുള്ള പദ്ധതികൾക്കായി ഭൂമിയുടെ നില പരിശോധിക്കണം.", "Land status is relevant for schemes such as PM-KISAN."),
    when: (answers) => answers.occupation === "farmer",
    options: [
      option("owner", "സ്വന്തമായി കൃഷിഭൂമി ഉണ്ട്", "Own agricultural land"),
      option("tenant", "പാട്ടകൃഷി / കുത്തക കർഷകൻ", "Tenant farmer"),
      option("labourer", "കാർഷിക തൊഴിലാളി", "Agricultural labourer"),
      unknownOption,
    ],
  },
  {
    id: "educationLevel",
    section: "livelihood",
    type: "choice",
    label: bi("ഇപ്പോൾ ഏത് പഠനനിലയിലാണ്?", "What is your current education level?"),
    helper: bi("വിദ്യാഭ്യാസ സഹായങ്ങളും പരിശീലന പദ്ധതികളും കണ്ടെത്താൻ.", "Used to identify education and training support."),
    when: (answers) => answers.occupation === "student",
    options: [
      option("class1to8", "ക്ലാസ് 1–8", "Class 1–8"),
      option("class9to10", "ക്ലാസ് 9–10", "Class 9–10"),
      option("class11to12", "ക്ലാസ് 11–12", "Class 11–12"),
      option("higherEducation", "ബിരുദം / പി.ജി. / പ്രൊഫഷണൽ", "UG / PG / professional course"),
      option("other", "മറ്റ് പഠനം / പരിശീലനം", "Other study / training"),
    ],
  },
  {
    id: "workerType",
    section: "livelihood",
    type: "choice",
    label: bi("തൊഴിൽ ഏത് മേഖലയിലാണ്?", "Which employment sector applies to you?"),
    helper: bi("അസംഘടിത തൊഴിലാളി പെൻഷൻ പോലുള്ള പദ്ധതികൾക്കായി.", "Relevant for worker pension and social-security schemes."),
    when: (answers) => answers.occupation === "employee" || answers.occupation === "unorganised",
    options: [
      option("organised", "സംഘടിത / സ്ഥിര ജോലി", "Organised / regular employment"),
      option("unorganised", "അസംഘടിത / ദിവസവേതനം", "Unorganised / daily wage"),
      option("gig", "ഗിഗ് / പ്ലാറ്റ്ഫോം ജോലി", "Gig / platform work"),
      unknownOption,
    ],
  },
  {
    id: "businessStatus",
    section: "livelihood",
    type: "choice",
    label: bi("സംരംഭത്തിന്റെ നിലവിലെ അവസ്ഥ എന്താണ്?", "What is the current status of your enterprise?"),
    helper: bi("പുതിയ സംരംഭത്തിനും നിലവിലുള്ള സംരംഭത്തിനും വ്യത്യസ്ത വായ്പകൾ ലഭ്യമാണ്.", "New and existing enterprises may qualify for different support."),
    when: (answers) => answers.occupation === "selfEmployed",
    options: [
      option("new", "പുതിയ സംരംഭം തുടങ്ങണം", "Planning a new enterprise"),
      option("existing", "നിലവിലുള്ള ചെറുകിട സംരംഭം", "Existing micro enterprise"),
      unknownOption,
    ],
  },
  {
    id: "maternityStatus",
    section: "livelihood",
    type: "choice",
    label: bi("ഗർഭിണിയോ മുലയൂട്ടുന്ന അമ്മയോ ആണോ?", "Are you pregnant or a lactating mother?"),
    helper: bi("മാതൃത്വ ആനുകൂല്യങ്ങൾ കണ്ടെത്താൻ മാത്രം.", "Used only to identify maternity benefits."),
    when: (answers) => answers.gender === "female" && Number(answers.age) >= 18 && Number(answers.age) <= 55,
    options: yesNoUnknown(),
  },
  {
    id: "bankAccount",
    section: "readiness",
    type: "choice",
    label: bi("നിങ്ങളുടെ പേരിൽ ബാങ്ക് അക്കൗണ്ട് ഉണ്ടോ?", "Do you have a bank account in your name?"),
    helper: bi("അക്കൗണ്ട് നമ്പർ ഇപ്പോൾ നൽകേണ്ടതില്ല.", "Do not enter an account number now."),
    options: yesNoUnknown(),
  },
  {
    id: "puccaHouse",
    section: "readiness",
    type: "choice",
    label: bi("കുടുംബത്തിന് സുരക്ഷിതമായ പക്കാ വീട് ഉണ്ടോ?", "Does your household own a safe pucca house?"),
    helper: bi("ഭവനസഹായ പദ്ധതികൾ പരിശോധിക്കാൻ.", "Used to check housing-assistance schemes."),
    options: yesNo(),
  },
  {
    id: "lpgConnection",
    section: "readiness",
    type: "choice",
    label: bi("കുടുംബത്തിൽ LPG ഗ്യാസ് കണക്ഷൻ ഉണ്ടോ?", "Does your household have an LPG connection?"),
    helper: bi("ഉജ്ജ്വല പോലുള്ള പദ്ധതികൾ പരിശോധിക്കാൻ.", "Used to check schemes such as Ujjwala."),
    options: yesNoUnknown(),
  },
  {
    id: "toiletAccess",
    section: "readiness",
    type: "choice",
    label: bi("വീട്ടിൽ ഉപയോഗയോഗ്യമായ ശൗചാലയം ഉണ്ടോ?", "Does your home have a usable toilet?"),
    helper: bi("ശുചിത്വ–നിർമാണ സഹായങ്ങൾ പരിശോധിക്കാൻ.", "Used to check sanitation assistance."),
    options: yesNoUnknown(),
  },
];

export function getVisibleQuestions(answers: EligibilityAnswers): EligibilityQuestion[] {
  return eligibilityQuestions.filter((question) => !question.when || question.when(answers));
}

const identityQuestionIds: QuestionId[] = ["fullName", "mobile", "email"];

export const schemeEligibilityQuestionIds: Record<string, QuestionId[]> = {
  pmkisan: ["occupation", "landStatus"],
  pmjjby: ["age", "bankAccount"],
  pmsby: ["age", "bankAccount"],
  apy: ["age", "bankAccount"],
  pmay: ["annualIncome", "puccaHouse"],
  ujjwala: ["age", "gender", "rationCard", "annualIncome", "lpgConnection"],
  mudra: ["age", "occupation"],
  skillindia: ["age", "occupation"],
  pmjay: ["rationCard", "annualIncome"],
  sukanya: ["age", "gender"],
  standup: ["age", "gender", "socialCategory", "occupation", "businessStatus"],
  pmsym: ["age", "occupation", "workerType", "annualIncome"],
  pmfby: ["occupation"],
  pmmvy: ["age", "gender", "maternityStatus"],
  midday: ["occupation", "educationLevel"],
  pmkvy: ["age", "occupation"],
  swachh: ["toiletAccess"],
  vidyalakshmi: ["occupation", "educationLevel"],
};

export function getSchemeQuestions(
  schemeId: string,
  answers: EligibilityAnswers,
): EligibilityQuestion[] {
  const relevantIds = schemeEligibilityQuestionIds[schemeId];
  if (!relevantIds) return getVisibleQuestions(answers);

  const requiredIds = new Set<QuestionId>([...identityQuestionIds, ...relevantIds]);
  return getVisibleQuestions(answers).filter((question) => requiredIds.has(question.id));
}

const read = (answers: EligibilityAnswers, id: QuestionId) => answers[id];
const isUnknown = (value?: string) => !value || value === "unknown" || value === "prefer_not";

const criterion = (
  label: BilingualText,
  pending: BilingualText,
  evaluate: (answers: EligibilityAnswers) => CriterionState,
): RuleCriterion => ({ label, pending, evaluate });

const ageBetween = (min: number, max?: number): RuleCriterion => criterion(
  bi(max ? `പ്രായം ${min}–${max} പരിധിയിൽ` : `പ്രായം ${min} അല്ലെങ്കിൽ കൂടുതൽ`, max ? `Age is within ${min}–${max}` : `Age is ${min} or above`),
  bi("പ്രായപരിധി രേഖയിലൂടെ പരിശോധിക്കണം", "Age needs to be verified"),
  (answers) => {
    const age = Number(read(answers, "age"));
    if (!age) return "unknown";
    return age >= min && (max === undefined || age <= max) ? "met" : "failed";
  },
);

const oneOf = (
  id: QuestionId,
  values: string[],
  label: BilingualText,
  pending: BilingualText,
): RuleCriterion => criterion(label, pending, (answers) => {
  const value = read(answers, id);
  if (isUnknown(value)) return "unknown";
  return values.includes(value!) ? "met" : "failed";
});

const equals = (id: QuestionId, value: string, label: BilingualText, pending: BilingualText): RuleCriterion => oneOf(id, [value], label, pending);

const incomeMaximums: Record<string, number | null> = {
  under1: 100000,
  oneToTwoFive: 250000,
  twoFiveToFive: 500000,
  fiveToEight: 800000,
  aboveEight: Number.POSITIVE_INFINITY,
  unknown: null,
};

const incomeAtMost = (maximum: number, label: BilingualText): RuleCriterion => criterion(
  label,
  bi("വരുമാന സർട്ടിഫിക്കറ്റ് പരിശോധിക്കണം", "Household income needs verification"),
  (answers) => {
    const value = read(answers, "annualIncome");
    if (!value || incomeMaximums[value] === null || incomeMaximums[value] === undefined) return "unknown";
    return incomeMaximums[value]! <= maximum ? "met" : "failed";
  },
);

const commonDocs = {
  identity: bi("തിരിച്ചറിയൽ രേഖ", "Identity proof"),
  bank: bi("ബാങ്ക് പാസ്‌ബുക്ക്", "Bank passbook"),
  income: bi("വരുമാന സർട്ടിഫിക്കറ്റ്", "Income certificate"),
  ration: bi("റേഷൻ കാർഡ്", "Ration card"),
  residence: bi("താമസ സർട്ടിഫിക്കറ്റ്", "Residence proof"),
  land: bi("ഭൂമി / കൃഷി രേഖകൾ", "Land / cultivation records"),
  education: bi("പഠന സ്ഥാപന രേഖകൾ", "Education records"),
  business: bi("സംരംഭ പദ്ധതി / ബിസിനസ് രേഖകൾ", "Business plan / enterprise records"),
  disability: bi("ഭിന്നശേഷി സർട്ടിഫിക്കറ്റ്", "Disability certificate"),
};

const povertyCriterion = criterion(
  bi("മുൻഗണനാ / കുറഞ്ഞ വരുമാന കുടുംബം", "Priority or low-income household"),
  bi("റേഷൻ കാർഡ് അല്ലെങ്കിൽ സാമ്പത്തിക നില പരിശോധിക്കണം", "Priority-household status needs verification"),
  (answers) => {
    const ration = read(answers, "rationCard");
    const income = read(answers, "annualIncome");
    if (["aay", "bpl"].includes(ration ?? "") || ["under1", "oneToTwoFive"].includes(income ?? "")) return "met";
    if (isUnknown(ration) || isUnknown(income)) return "unknown";
    return "failed";
  },
);

const womanOrScSt = criterion(
  bi("സ്ത്രീ അല്ലെങ്കിൽ SC/ST സംരംഭക വിഭാഗം", "Woman or SC/ST entrepreneur category"),
  bi("ലിംഗം / സാമൂഹിക വിഭാഗം പരിശോധിക്കണം", "Gender or social category needs verification"),
  (answers) => {
    const gender = read(answers, "gender");
    const social = read(answers, "socialCategory");
    if (gender === "female" || social === "sc" || social === "st") return "met";
    if (isUnknown(gender) || isUnknown(social)) return "unknown";
    return "failed";
  },
);

const schemeRules: SchemeRule[] = [
  {
    schemeId: "pmkisan",
    criteria: [
      equals("occupation", "farmer", bi("കർഷകനാണ്", "Applicant is a farmer"), bi("കർഷക നില പരിശോധിക്കണം", "Farmer status needs verification")),
      equals("landStatus", "owner", bi("സ്വന്തമായി കൃഷിഭൂമി ഉണ്ട്", "Owns agricultural land"), bi("ഭൂരേഖ പരിശോധിക്കണം", "Land record needs verification")),
    ],
    documents: [commonDocs.identity, commonDocs.bank, commonDocs.land],
  },
  {
    schemeId: "pmjjby",
    criteria: [ageBetween(18, 50), equals("bankAccount", "yes", bi("സ്വന്തം ബാങ്ക് അക്കൗണ്ട് ഉണ്ട്", "Has a bank account"), bi("ബാങ്ക് അക്കൗണ്ട് പരിശോധിക്കണം", "Bank account needs verification"))],
    documents: [commonDocs.identity, commonDocs.bank],
  },
  {
    schemeId: "pmsby",
    criteria: [ageBetween(18, 70), equals("bankAccount", "yes", bi("സ്വന്തം ബാങ്ക് അക്കൗണ്ട് ഉണ്ട്", "Has a bank account"), bi("ബാങ്ക് അക്കൗണ്ട് പരിശോധിക്കണം", "Bank account needs verification"))],
    documents: [commonDocs.identity, commonDocs.bank],
  },
  {
    schemeId: "apy",
    criteria: [ageBetween(18, 40), equals("bankAccount", "yes", bi("സ്വന്തം ബാങ്ക് അക്കൗണ്ട് ഉണ്ട്", "Has a bank account"), bi("ബാങ്ക് അക്കൗണ്ട് പരിശോധിക്കണം", "Bank account needs verification"))],
    documents: [commonDocs.identity, commonDocs.bank],
  },
  {
    schemeId: "pmay",
    criteria: [
      incomeAtMost(500000, bi("വരുമാനം ഭവനസഹായ പരിധിക്കുള്ളിൽ", "Income is within the initial housing-assistance range")),
      equals("puccaHouse", "no", bi("സുരക്ഷിതമായ പക്കാ വീട് ഇല്ല", "Household does not own a safe pucca house"), bi("നിലവിലെ ഭവനസ്ഥിതി പരിശോധിക്കണം", "Current housing status needs verification")),
    ],
    documents: [commonDocs.identity, commonDocs.income, commonDocs.residence, commonDocs.ration],
  },
  {
    schemeId: "ujjwala",
    criteria: [
      ageBetween(18),
      equals("gender", "female", bi("പ്രായപൂർത്തിയായ സ്ത്രീ അപേക്ഷക", "Applicant is an adult woman"), bi("അപേക്ഷകയുടെ വിവരങ്ങൾ പരിശോധിക്കണം", "Applicant details need verification")),
      povertyCriterion,
      equals("lpgConnection", "no", bi("കുടുംബത്തിൽ LPG കണക്ഷൻ ഇല്ല", "Household has no LPG connection"), bi("LPG കണക്ഷൻ നില പരിശോധിക്കണം", "LPG connection status needs verification")),
    ],
    documents: [commonDocs.identity, commonDocs.ration, commonDocs.bank, commonDocs.residence],
  },
  {
    schemeId: "mudra",
    criteria: [
      ageBetween(18),
      oneOf("occupation", ["selfEmployed", "unemployed"], bi("സംരംഭം നടത്തുന്നു അല്ലെങ്കിൽ തുടങ്ങാൻ ഉദ്ദേശിക്കുന്നു", "Runs or plans to start an enterprise"), bi("സംരംഭത്തിന്റെ സ്വഭാവം പരിശോധിക്കണം", "Enterprise status needs verification")),
    ],
    documents: [commonDocs.identity, commonDocs.bank, commonDocs.business],
  },
  {
    schemeId: "skillindia",
    criteria: [ageBetween(15, 45), oneOf("occupation", ["student", "unemployed", "unorganised", "selfEmployed"], bi("നൈപുണ്യ പരിശീലനത്തിന് യോജിക്കുന്ന തൊഴിൽ നില", "Current status aligns with skill training"), bi("പരിശീലന ആവശ്യം പരിശോധിക്കണം", "Training requirement needs verification"))],
    documents: [commonDocs.identity, commonDocs.education],
  },
  {
    schemeId: "pmjay",
    criteria: [povertyCriterion],
    documents: [commonDocs.identity, commonDocs.ration, commonDocs.residence],
  },
  {
    schemeId: "sukanya",
    criteria: [ageBetween(0, 10), equals("gender", "female", bi("10 വയസ്സിന് താഴെയുള്ള പെൺകുട്ടി", "Girl child below 10"), bi("കുട്ടിയുടെ വിവരങ്ങൾ പരിശോധിക്കണം", "Girl-child details need verification"))],
    documents: [commonDocs.identity, commonDocs.bank, commonDocs.residence],
  },
  {
    schemeId: "standup",
    criteria: [ageBetween(18), equals("occupation", "selfEmployed", bi("സംരംഭകയാണ് / സംരംഭകനാണ്", "Applicant is an entrepreneur"), bi("സംരംഭക നില പരിശോധിക്കണം", "Entrepreneur status needs verification")), womanOrScSt, equals("businessStatus", "new", bi("പുതിയ സംരംഭം ആരംഭിക്കാനാണ്", "Planning a new enterprise"), bi("സംരംഭത്തിന്റെ ഘട്ടം പരിശോധിക്കണം", "Enterprise stage needs verification"))],
    documents: [commonDocs.identity, commonDocs.bank, commonDocs.business, commonDocs.income],
  },
  {
    schemeId: "pmsym",
    criteria: [ageBetween(18, 40), oneOf("workerType", ["unorganised", "gig"], bi("അസംഘടിത / ഗിഗ് തൊഴിലാളിയാണ്", "Applicant is an unorganised or gig worker"), bi("തൊഴിൽ വിഭാഗം പരിശോധിക്കണം", "Worker category needs verification")), incomeAtMost(250000, bi("വരുമാനം പ്രാഥമിക പരിധിക്കുള്ളിൽ", "Income is within the initial screening range"))],
    documents: [commonDocs.identity, commonDocs.bank, commonDocs.income],
  },
  {
    schemeId: "pmfby",
    criteria: [equals("occupation", "farmer", bi("കൃഷിയിൽ ഏർപ്പെട്ടിരിക്കുന്നു", "Applicant is engaged in farming"), bi("കൃഷി നില പരിശോധിക്കണം", "Farming status needs verification"))],
    documents: [commonDocs.identity, commonDocs.bank, commonDocs.land],
  },
  {
    schemeId: "pmmvy",
    criteria: [equals("gender", "female", bi("സ്ത്രീ അപേക്ഷക", "Applicant is a woman"), bi("അപേക്ഷകയുടെ വിവരങ്ങൾ പരിശോധിക്കണം", "Applicant details need verification")), equals("maternityStatus", "yes", bi("ഗർഭിണി / മുലയൂട്ടുന്ന അമ്മ", "Pregnant or lactating mother"), bi("മാതൃത്വ നില പരിശോധിക്കണം", "Maternity status needs verification"))],
    documents: [commonDocs.identity, commonDocs.bank, commonDocs.residence],
  },
  {
    schemeId: "midday",
    criteria: [equals("occupation", "student", bi("വിദ്യാർത്ഥിയാണ്", "Applicant is a student"), bi("വിദ്യാർത്ഥി നില പരിശോധിക്കണം", "Student status needs verification")), equals("educationLevel", "class1to8", bi("ക്ലാസ് 1–8ൽ പഠിക്കുന്നു", "Studies in Class 1–8"), bi("പഠനനില പരിശോധിക്കണം", "Class level needs verification"))],
    documents: [commonDocs.identity, commonDocs.education],
  },
  {
    schemeId: "pmkvy",
    criteria: [ageBetween(15, 45), oneOf("occupation", ["student", "unemployed"], bi("വിദ്യാർത്ഥി / തൊഴിൽ അന്വേഷിക്കുന്ന യുവാവ്", "Student or job seeker"), bi("നിലവിലെ തൊഴിൽ നില പരിശോധിക്കണം", "Current status needs verification"))],
    documents: [commonDocs.identity, commonDocs.education, commonDocs.bank],
  },
  {
    schemeId: "swachh",
    criteria: [equals("toiletAccess", "no", bi("വീട്ടിൽ ഉപയോഗയോഗ്യമായ ശൗചാലയം ഇല്ല", "Home has no usable toilet"), bi("ശൗചാലയ നില പരിശോധിക്കണം", "Toilet status needs verification"))],
    documents: [commonDocs.identity, commonDocs.ration, commonDocs.residence],
  },
  {
    schemeId: "vidyalakshmi",
    criteria: [equals("occupation", "student", bi("വിദ്യാർത്ഥിയാണ്", "Applicant is a student"), bi("വിദ്യാർത്ഥി നില പരിശോധിക്കണം", "Student status needs verification")), oneOf("educationLevel", ["class11to12", "higherEducation"], bi("ഉന്നത പഠനത്തിലേക്കുള്ള ഘട്ടത്തിൽ", "At the higher-education stage"), bi("കോഴ്‌സും പ്രവേശനവും പരിശോധിക്കണം", "Course and admission need verification"))],
    documents: [commonDocs.identity, commonDocs.education, commonDocs.bank, commonDocs.income],
  },
];

export function evaluateEligibility(answers: EligibilityAnswers, schemes: Scheme[]): EligibilityMatch[] {
  const rulesByScheme = new Map(schemeRules.map((rule) => [rule.schemeId, rule]));

  return schemes
    .map((scheme): EligibilityMatch => {
      const rule = rulesByScheme.get(scheme.id);
      if (!rule) {
        return {
          scheme,
          status: "possible",
          matchedCriteria: [],
          pendingCriteria: [bi("പദ്ധതിയുടെ വിശദമായ നിബന്ധനകൾ പരിശോധിക്കണം", "Detailed scheme rules need verification")],
          failedCriteria: [],
          documents: [commonDocs.identity],
        };
      }

      const evaluated = rule.criteria.map((item) => ({ item, state: item.evaluate(answers) }));
      const matchedCriteria = evaluated.filter(({ state }) => state === "met").map(({ item }) => item.label);
      const pendingCriteria = evaluated.filter(({ state }) => state === "unknown").map(({ item }) => item.pending);
      const failedCriteria = evaluated.filter(({ state }) => state === "failed").map(({ item }) => item.label);
      const status = failedCriteria.length ? "not-matched" : pendingCriteria.length ? "possible" : "strong";

      return { scheme, status, matchedCriteria, pendingCriteria, failedCriteria, documents: rule.documents };
    })
    .sort((a, b) => {
      const rank = { strong: 0, possible: 1, "not-matched": 2 };
      return rank[a.status] - rank[b.status] || b.matchedCriteria.length - a.matchedCriteria.length;
    });
}

export function getAnswerLabel(question: EligibilityQuestion, value: string, lang: EligibilityLanguage): string {
  if (question.type === "phone") return `••••••${value.slice(-4)}`;
  if (question.type === "text" || question.type === "number") return value;
  return question.options?.find((item) => item.value === value)?.label[lang] ?? value;
}

export function parseVoiceAnswer(question: EligibilityQuestion, transcript: string): string | null {
  const normalized = transcript.trim().toLocaleLowerCase();
  if (!normalized) return null;

  if (question.type === "text") return transcript.trim();
  if (question.type === "phone") return normalized.replace(/\D/g, "").slice(0, 10) || null;

  if (question.type === "number") {
    const digits = normalized.match(/\d{1,3}/)?.[0];
    if (digits) return digits;
    const numberWords: Record<string, string> = {
      eighteen: "18", twenty: "20", thirty: "30", forty: "40", fifty: "50", sixty: "60", seventy: "70",
      "പതിനെട്ട്": "18", "ഇരുപത്": "20", "മുപ്പത്": "30", "നാൽപ്പത്": "40", "അമ്പത്": "50", "അറുപത്": "60", "എഴുപത്": "70",
    };
    return Object.entries(numberWords).find(([word]) => normalized.includes(word))?.[1] ?? null;
  }

  return question.options?.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)))?.value ?? null;
}
