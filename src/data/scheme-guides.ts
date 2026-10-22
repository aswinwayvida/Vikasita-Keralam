import type { Scheme } from "./schemes";

export type GuideLanguage = "ml" | "en";
export type GuideText = Record<GuideLanguage, string>;
export type GuideDocument = GuideText & { uploadable?: boolean };

export type SchemeGuide = {
  summary: GuideText;
  documents: GuideDocument[];
  applicationSteps: GuideText[];
  readinessQuestions: GuideText[];
  supportMode: "guided" | "assisted" | "official-handoff";
  expectedTime: GuideText;
  sourceNote: GuideText;
};

const bi = (ml: string, en: string): GuideText => ({ ml, en });
const information = (ml: string, en: string): GuideDocument => ({ ml, en, uploadable: false });

const commonDocuments = [
  bi("തിരിച്ചറിയൽ രേഖ", "Identity proof"),
  bi("കേരളത്തിലെ വിലാസം തെളിയിക്കുന്ന രേഖ", "Proof of address in Kerala"),
  information(
    "ബാങ്ക് അക്കൗണ്ട് വിവരങ്ങൾ — ഔദ്യോഗിക സമർപ്പണ ഘട്ടത്തിൽ മാത്രം",
    "Bank-account details — only at the official submission stage",
  ),
];

const commonSteps = [
  bi(
    "SahAI ഉപയോഗിച്ച് പ്രാഥമിക യോഗ്യത ഉറപ്പാക്കുക",
    "Complete the initial eligibility check with SahAI",
  ),
  bi(
    "അപേക്ഷയ്ക്കാവശ്യമായ വിവരങ്ങളും രേഖകളും തയ്യാറാക്കുക",
    "Prepare the information and documents required for the application",
  ),
  bi(
    "വികസിത കേരളം ഹെൽപ്പ്ഡെസ്ക് പരിശോധന പൂർത്തിയാക്കുക",
    "Complete the Vikasita Keralam helpdesk review",
  ),
  bi(
    "ലഭ്യമായ ഔദ്യോഗിക മാർഗത്തിലൂടെ അന്തിമ അപേക്ഷ സമർപ്പിക്കുക",
    "Submit through the available official channel",
  ),
];

const categoryNotes: Record<Scheme["category"], GuideText> = {
  agriculture: bi(
    "കർഷകരുടെ ഉടമസ്ഥത, വിള, ബാങ്ക് വിവരങ്ങൾ എന്നിവ ഔദ്യോഗിക രേഖകളുമായി പരിശോധിക്കേണ്ടിവരും.",
    "Landholding, crop and bank details may require verification against official records.",
  ),
  women: bi(
    "കുടുംബം, വരുമാനം, പ്രായം എന്നിവ പദ്ധതിയുടെ ഔദ്യോഗിക നിബന്ധനകൾ പ്രകാരം പരിശോധിക്കും.",
    "Household, income and age details are checked against the scheme's official conditions.",
  ),
  health: bi(
    "അർഹതാ പട്ടികയും കുടുംബ വിവരങ്ങളും ബന്ധപ്പെട്ട ആരോഗ്യ അതോറിറ്റി അന്തിമമായി സ്ഥിരീകരിക്കും.",
    "The responsible health authority makes the final decision using its beneficiary and household records.",
  ),
  education: bi(
    "പഠനനില, പ്രവേശന രേഖ, സ്ഥാപന വിവരങ്ങൾ എന്നിവ ഔദ്യോഗിക ഘട്ടത്തിൽ ആവശ്യമായേക്കാം.",
    "Course, admission and institution records may be required at the official stage.",
  ),
  housing: bi(
    "വീട്, ഭൂമി, വരുമാനം, കുടുംബ വിവരങ്ങൾ എന്നിവ തദ്ദേശ സ്ഥാപന രേഖകളുമായി പരിശോധിച്ചേക്കാം.",
    "Housing, land, income and household details may be checked against local-body records.",
  ),
  employment: bi(
    "പ്രായം, വിദ്യാഭ്യാസം, തൊഴിൽ നില എന്നിവ പരിപാടിയുടെ ഔദ്യോഗിക മാനദണ്ഡങ്ങൾ അനുസരിച്ച് പരിശോധിക്കും.",
    "Age, education and employment status are checked against the programme's official criteria.",
  ),
  welfare: bi(
    "പ്രായം, കുടുംബ വരുമാനം, ബാങ്ക് അക്കൗണ്ട് എന്നിവ പദ്ധതിയനുസരിച്ച് സ്ഥിരീകരിക്കേണ്ടിവരും.",
    "Age, household income and bank-account readiness may require scheme-specific verification.",
  ),
  msme: bi(
    "ബിസിനസ് ആശയം, ഉടമസ്ഥത, വായ്പാ തിരിച്ചടവ് ശേഷി എന്നിവ ബാങ്ക് അല്ലെങ്കിൽ ബന്ധപ്പെട്ട സ്ഥാപനം വിലയിരുത്തും.",
    "The bank or responsible institution evaluates the business proposal, ownership and repayment capacity.",
  ),
};

const detailedGuides: Partial<Record<string, SchemeGuide>> = {
  pmkisan: {
    summary: bi(
      "യോഗ്യരായ ഭൂവുടമ കർഷക കുടുംബങ്ങൾക്ക് വർഷത്തിൽ ₹6,000 മൂന്ന് ഗഡുക്കളായി നൽകുന്ന കേന്ദ്ര സഹായ പദ്ധതി.",
      "A Central Government income-support scheme providing ₹6,000 a year in three instalments to eligible landholding farmer families.",
    ),
    documents: [
      bi("കൃഷിഭൂമി ഉടമസ്ഥത തെളിയിക്കുന്ന രേഖ", "Land-ownership record"),
      bi("തിരിച്ചറിയൽ രേഖ", "Identity proof"),
      information("ബാങ്ക് അക്കൗണ്ട്, IFSC വിവരങ്ങൾ", "Bank-account and IFSC details"),
      information("മൊബൈൽ നമ്പർ", "Mobile number"),
    ],
    applicationSteps: commonSteps,
    readinessQuestions: [
      bi("നിങ്ങളുടെ പേരിൽ കൃഷിഭൂമി ഉണ്ടോ?", "Do you own agricultural land in your name?"),
      bi("ബാങ്ക് അക്കൗണ്ട് സജീവമാണോ?", "Is your bank account active?"),
      bi(
        "ഭൂമി രേഖയിലെ പേരും തിരിച്ചറിയൽ രേഖയിലെ പേരും ഒരുപോലെയാണോ?",
        "Does the name on the land record match the identity document?",
      ),
    ],
    supportMode: "guided",
    expectedTime: bi(
      "വികസിത കേരളം പ്രാഥമിക പരിശോധന: ഏകദേശം 5 മിനിറ്റ്",
      "Vikasita Keralam initial review: about 5 minutes",
    ),
    sourceNote: categoryNotes.agriculture,
  },
  pmjay: {
    summary: bi(
      "അർഹരായ കുടുംബങ്ങൾക്ക് എംപാനൽ ചെയ്ത ആശുപത്രികളിൽ പണരഹിത ചികിത്സാ പരിരക്ഷ നൽകുന്ന ആരോഗ്യ പദ്ധതി.",
      "A health-protection scheme offering cashless care at empanelled hospitals for eligible families.",
    ),
    documents: [
      bi("കുടുംബ തിരിച്ചറിയൽ അല്ലെങ്കിൽ റേഷൻ കാർഡ്", "Family identity or ration card"),
      bi("തിരിച്ചറിയൽ രേഖ", "Identity proof"),
      information("മൊബൈൽ നമ്പർ", "Mobile number"),
    ],
    applicationSteps: commonSteps,
    readinessQuestions: [
      bi(
        "നിങ്ങളുടെ കുടുംബം ഔദ്യോഗിക ഗുണഭോക്തൃ പട്ടികയിൽ ഉണ്ടോ എന്ന് പരിശോധിച്ചിട്ടുണ്ടോ?",
        "Have you checked whether the household appears in the official beneficiary list?",
      ),
      bi(
        "കുടുംബാംഗങ്ങളുടെ വിവരങ്ങൾ റേഷൻ കാർഡിൽ പുതുക്കിയിട്ടുണ്ടോ?",
        "Are household members updated on the ration card?",
      ),
    ],
    supportMode: "guided",
    expectedTime: bi(
      "പ്രാഥമിക പട്ടിക പരിശോധന: ഏകദേശം 3 മിനിറ്റ്",
      "Initial beneficiary-list check: about 3 minutes",
    ),
    sourceNote: categoryNotes.health,
  },
  ujjwala: {
    summary: bi(
      "യോഗ്യരായ ദരിദ്ര കുടുംബങ്ങളിലെ പ്രായപൂർത്തിയായ വനിതയ്ക്ക് LPG കണക്ഷൻ ലഭ്യമാക്കുന്ന പദ്ധതി.",
      "A scheme supporting LPG connections for an adult woman in an eligible low-income household.",
    ),
    documents: [
      bi("റേഷൻ കാർഡ് / കുടുംബ ഘടന രേഖ", "Ration card or household-composition record"),
      bi("അപേക്ഷകയുടെ തിരിച്ചറിയൽ രേഖ", "Applicant's identity proof"),
      bi("വിലാസ രേഖ", "Address proof"),
      information("ബാങ്ക് അക്കൗണ്ട് വിവരങ്ങൾ", "Bank-account details"),
    ],
    applicationSteps: commonSteps,
    readinessQuestions: [
      bi(
        "കുടുംബത്തിൽ നിലവിൽ LPG കണക്ഷൻ ഉണ്ടോ?",
        "Does the household already have an LPG connection?",
      ),
      bi("അപേക്ഷക 18 വയസ്സിന് മുകളിലുള്ള വനിതയാണോ?", "Is the applicant a woman aged 18 or above?"),
    ],
    supportMode: "assisted",
    expectedTime: bi(
      "രേഖാ തയ്യാറെടുപ്പ് പരിശോധന: ഏകദേശം 5 മിനിറ്റ്",
      "Document-readiness check: about 5 minutes",
    ),
    sourceNote: categoryNotes.women,
  },
  pmay: {
    summary: bi(
      "യോഗ്യരായ കുടുംബങ്ങൾക്ക് വീട് നിർമ്മിക്കാനോ മെച്ചപ്പെടുത്താനോ സഹായം നൽകുന്ന ഭവന പദ്ധതി.",
      "A housing programme supporting eligible households to build or improve a home.",
    ),
    documents: [
      bi("കുടുംബ വരുമാന രേഖ", "Household-income proof"),
      bi("വീട് / ഭൂമി സംബന്ധിച്ച രേഖകൾ", "Housing or land records"),
      bi("തദ്ദേശ സ്ഥാപനത്തിലെ താമസ രേഖ", "Local-body residence record"),
      ...commonDocuments.slice(0, 1),
    ],
    applicationSteps: commonSteps,
    readinessQuestions: [
      bi("കുടുംബത്തിന് പക്കാ വീട് ഉണ്ടോ?", "Does the household own a pucca house?"),
      bi(
        "അപേക്ഷിക്കുന്ന സ്ഥലത്തിന്റെ ഭൂമി രേഖകൾ ലഭ്യമാണോ?",
        "Are land records available for the proposed property?",
      ),
    ],
    supportMode: "assisted",
    expectedTime: bi(
      "പ്രാഥമിക വിവര പരിശോധന: ഏകദേശം 7 മിനിറ്റ്",
      "Initial information review: about 7 minutes",
    ),
    sourceNote: categoryNotes.housing,
  },
  mudra: {
    summary: bi(
      "മൈക്രോ സംരംഭങ്ങൾക്ക് ബാങ്കുകൾ വഴി വായ്പാ സഹായം ലഭ്യമാക്കുന്ന പദ്ധതി.",
      "A programme enabling bank finance for eligible micro enterprises.",
    ),
    documents: [
      bi("ബിസിനസ് ആശയം / ലഘു പ്രോജക്ട് റിപ്പോർട്ട്", "Business idea or short project report"),
      bi("ബിസിനസ് വിലാസവും ഉടമസ്ഥതയും തെളിയിക്കുന്ന രേഖ", "Business address and ownership proof"),
      bi("ആവശ്യമായ ബാങ്ക് സ്റ്റേറ്റ്മെന്റുകൾ", "Bank statements requested by the lender"),
      ...commonDocuments.slice(0, 1),
    ],
    applicationSteps: commonSteps,
    readinessQuestions: [
      bi(
        "നിലവിലുള്ളതോ തുടങ്ങാനിരിക്കുന്നതോ ആയ ചെറിയ ബിസിനസ് ഉണ്ടോ?",
        "Do you run or plan to start a micro business?",
      ),
      bi(
        "ആവശ്യമായ വായ്പാ തുകയും ഉപയോഗവും വ്യക്തമാണോ?",
        "Are the required loan amount and purpose clear?",
      ),
    ],
    supportMode: "assisted",
    expectedTime: bi(
      "ബിസിനസ് വിവര പരിശോധന: ഏകദേശം 8 മിനിറ്റ്",
      "Business-readiness review: about 8 minutes",
    ),
    sourceNote: categoryNotes.msme,
  },
  pmjjby: {
    summary: bi(
      "യോഗ്യരായ ബാങ്ക് അക്കൗണ്ട് ഉടമകൾക്ക് കുറഞ്ഞ വാർഷിക പ്രീമിയത്തിൽ ജീവൻ ഇൻഷുറൻസ് പരിരക്ഷ നൽകുന്ന പദ്ധതി.",
      "A low-premium life-insurance scheme for eligible participating bank-account holders.",
    ),
    documents: [
      information("സജീവ സേവിങ്സ് ബാങ്ക് അക്കൗണ്ട്", "Active savings-bank account"),
      bi("തിരിച്ചറിയൽ രേഖ", "Identity proof"),
      information("നോമിനിയുടെ വിവരങ്ങൾ", "Nominee details"),
    ],
    applicationSteps: commonSteps,
    readinessQuestions: [
      bi("18 മുതൽ 50 വരെ പ്രായപരിധിയിലാണോ?", "Are you between 18 and 50 years of age?"),
      bi(
        "ഓട്ടോ-ഡെബിറ്റിനായി സേവിങ്സ് അക്കൗണ്ട് സജീവമാണോ?",
        "Is a savings account active for auto-debit?",
      ),
    ],
    supportMode: "assisted",
    expectedTime: bi(
      "പ്രാഥമിക തയ്യാറെടുപ്പ്: ഏകദേശം 4 മിനിറ്റ്",
      "Initial readiness check: about 4 minutes",
    ),
    sourceNote: categoryNotes.welfare,
  },
};

export function getSchemeGuide(scheme: Scheme): SchemeGuide {
  return (
    detailedGuides[scheme.id] ?? {
      summary: {
        ml: `${scheme.benefit.ml}. അപേക്ഷയ്ക്ക് മുമ്പ് പദ്ധതിയുടെ നിലവിലെ ഔദ്യോഗിക നിബന്ധനകൾ പരിശോധിക്കണം.`,
        en: `${scheme.benefit.en}. Current official conditions must be verified before applying.`,
      },
      documents: commonDocuments,
      applicationSteps: commonSteps,
      readinessQuestions: [
        bi(
          "പദ്ധതിയുടെ പ്രാഥമിക യോഗ്യതാ നിബന്ധനകൾ നിങ്ങൾക്കു പൊരുത്തപ്പെടുന്നുണ്ടോ?",
          "Do you appear to meet the scheme's initial eligibility conditions?",
        ),
        bi("ആവശ്യമായ അടിസ്ഥാന രേഖകൾ ലഭ്യമാണോ?", "Are the basic supporting documents available?"),
      ],
      supportMode: "assisted",
      expectedTime: bi("പ്രാഥമിക പരിശോധന: ഏകദേശം 5 മിനിറ്റ്", "Initial review: about 5 minutes"),
      sourceNote: categoryNotes[scheme.category],
    }
  );
}
