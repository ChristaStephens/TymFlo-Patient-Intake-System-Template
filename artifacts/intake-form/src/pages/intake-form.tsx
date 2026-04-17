import { useState, useEffect, useRef, useCallback } from "react";
import {
  Info,
  X,
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  Stethoscope,
  ClipboardList,
  Phone,
  Shield,
  PenLine,
  AlertCircle,
  FileDown,
  Lock,
  Mail,
} from "lucide-react";
import Footer, { PrintFooter } from "@/components/footer";
import { PRACTICE_NAME, PRACTICE_EMAIL } from "@/lib/config";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const STORAGE_KEY = "intake_form_data";
const STEP_KEY = "intake_form_step";

/* ── Medical Condition List ─────────────────────────────────── */

const CONDITIONS: { label: string; key: string }[] = [
  { label: "Allergies", key: "allergies" },
  { label: "Anemia", key: "anemia" },
  { label: "Anxiety Disorder", key: "anxietyDisorder" },
  { label: "Arthritis", key: "arthritis" },
  { label: "Asthma", key: "asthma" },
  { label: "AIDS / HIV", key: "aidsHiv" },
  { label: "Bleeding Disorder", key: "bleedingDisorder" },
  { label: "Blood Transfusion", key: "bloodTransfusion" },
  { label: "Cancer", key: "cancer" },
  { label: "Crohn's Disease", key: "crohnsDisease" },
  { label: "Diabetes", key: "diabetes" },
  { label: "Depression", key: "depression" },
  { label: "DVT", key: "dvt" },
  { label: "GERD", key: "gerd" },
  { label: "Glaucoma", key: "glaucoma" },
  { label: "Heart Disease", key: "heartDisease" },
  { label: "Heart Problems", key: "heartProblems" },
  { label: "Hepatitis A, B, or C", key: "hepatitis" },
  { label: "High Blood Pressure", key: "highBloodPressure" },
  { label: "High Cholesterol", key: "highCholesterol" },
  { label: "IBS", key: "ibs" },
  { label: "Kidney Disorder", key: "kidneyDisorder" },
  { label: "Liver Disorder", key: "liverDisorder" },
  { label: "Lung Disease", key: "lungDisease" },
  { label: "Migraines", key: "migraines" },
  { label: "Osteoporosis", key: "osteoporosis" },
  { label: "Phlebitis", key: "phlebitis" },
  { label: "Skin Disorder", key: "skinDisorder" },
  { label: "Stomach Ulcer", key: "stomachUlcer" },
  { label: "Stroke", key: "stroke" },
  { label: "Thyroid Disease", key: "thyroidDisease" },
  { label: "Tuberculosis", key: "tuberculosis" },
  { label: "Venereal Disease", key: "venerealDisease" },
  { label: "Seizure", key: "seizure" },
  { label: "Sickle Cell", key: "sickleCell" },
];

function capFirst(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pastKey(key: string): string { return `past${capFirst(key)}`; }
function famKey(key: string): string { return `family${capFirst(key)}`; }

/* ── FormData ───────────────────────────────────────────────── */

interface FormData {
  // Personal
  firstName: string; lastName: string; preferredName: string;
  dateOfBirth: string; email: string; phone: string;
  sex: string; genderIdentity: string; pronouns: string;
  race: string; ethnicity: string; preferredLanguage: string;
  // Address
  address: string; city: string; state: string; zip: string;
  // Provider & Visit
  primaryCarePhysician: string;
  pharmacyName: string; pharmacyAddress: string; pharmacyPhone: string;
  reasonForVisit: string; currentMedications: string; allergies: string;
  // Past Medical History — checkboxes
  pastAllergies: boolean; pastAnemia: boolean; pastAnxietyDisorder: boolean;
  pastArthritis: boolean; pastAsthma: boolean; pastAidsHiv: boolean;
  pastBleedingDisorder: boolean; pastBloodTransfusion: boolean;
  pastCancer: boolean; pastCrohnsDisease: boolean; pastDiabetes: boolean;
  pastDepression: boolean; pastDvt: boolean; pastGerd: boolean;
  pastGlaucoma: boolean; pastHeartDisease: boolean; pastHeartProblems: boolean;
  pastHepatitis: boolean; pastHighBloodPressure: boolean; pastHighCholesterol: boolean;
  pastIbs: boolean; pastKidneyDisorder: boolean; pastLiverDisorder: boolean;
  pastLungDisease: boolean; pastMigraines: boolean; pastOsteoporosis: boolean;
  pastPhlebitis: boolean; pastSkinDisorder: boolean; pastStomachUlcer: boolean;
  pastStroke: boolean; pastThyroidDisease: boolean; pastTuberculosis: boolean;
  pastVenerealDisease: boolean; pastSeizure: boolean; pastSickleCell: boolean;
  pastMedicalOther: string;
  // Clinical free-text
  pastSurgeries: string; pastHospitalizations: string; chronicConditions: string;
  // Family Medical History — checkboxes (same 35 conditions)
  familyAllergies: boolean; familyAnemia: boolean; familyAnxietyDisorder: boolean;
  familyArthritis: boolean; familyAsthma: boolean; familyAidsHiv: boolean;
  familyBleedingDisorder: boolean; familyBloodTransfusion: boolean;
  familyCancer: boolean; familyCrohnsDisease: boolean; familyDiabetes: boolean;
  familyDepression: boolean; familyDvt: boolean; familyGerd: boolean;
  familyGlaucoma: boolean; familyHeartDisease: boolean; familyHeartProblems: boolean;
  familyHepatitis: boolean; familyHighBloodPressure: boolean; familyHighCholesterol: boolean;
  familyIbs: boolean; familyKidneyDisorder: boolean; familyLiverDisorder: boolean;
  familyLungDisease: boolean; familyMigraines: boolean; familyOsteoporosis: boolean;
  familyPhlebitis: boolean; familySkinDisorder: boolean; familyStomachUlcer: boolean;
  familyStroke: boolean; familyThyroidDisease: boolean; familyTuberculosis: boolean;
  familyVenerealDisease: boolean; familySeizure: boolean; familySickleCell: boolean;
  familyHistoryOther: string;
  // Social History
  tobaccoUse: string; alcoholUse: string; substanceUse: string;
  // Emergency
  emergencyContactName: string; emergencyContactPhone: string; emergencyContactRelationship: string;
  // Insurance
  relationshipToInsured: string; primaryInsuredName: string; primaryInsuredDOB: string;
  insuranceProvider: string; policyNumber: string; groupNumber: string;
  hasSecondaryInsurance: boolean;
  secondaryInsuranceProvider: string; secondaryPolicyNumber: string; secondaryGroupNumber: string;
  // Legal
  agreeToPrivacyNotice: boolean; agreeToAssignmentOfBenefits: boolean;
  agreeToFinancialResponsibility: boolean; agreeToTerms: boolean;
  signatureText: string; signatureDate: string;
  signatureData: string; signatureTimestamp: string;
}

const BOOL_FALSE_CONDITIONS: Record<string, boolean> = {};
CONDITIONS.forEach(({ key }) => {
  BOOL_FALSE_CONDITIONS[pastKey(key)] = false;
  BOOL_FALSE_CONDITIONS[famKey(key)] = false;
});

const INITIAL_FORM: FormData = {
  firstName: "", lastName: "", preferredName: "",
  dateOfBirth: "", email: "", phone: "",
  sex: "", genderIdentity: "", pronouns: "",
  race: "", ethnicity: "", preferredLanguage: "",
  address: "", city: "", state: "", zip: "",
  primaryCarePhysician: "",
  pharmacyName: "", pharmacyAddress: "", pharmacyPhone: "",
  reasonForVisit: "", currentMedications: "", allergies: "",
  // past medical checkboxes
  pastAllergies: false, pastAnemia: false, pastAnxietyDisorder: false,
  pastArthritis: false, pastAsthma: false, pastAidsHiv: false,
  pastBleedingDisorder: false, pastBloodTransfusion: false,
  pastCancer: false, pastCrohnsDisease: false, pastDiabetes: false,
  pastDepression: false, pastDvt: false, pastGerd: false,
  pastGlaucoma: false, pastHeartDisease: false, pastHeartProblems: false,
  pastHepatitis: false, pastHighBloodPressure: false, pastHighCholesterol: false,
  pastIbs: false, pastKidneyDisorder: false, pastLiverDisorder: false,
  pastLungDisease: false, pastMigraines: false, pastOsteoporosis: false,
  pastPhlebitis: false, pastSkinDisorder: false, pastStomachUlcer: false,
  pastStroke: false, pastThyroidDisease: false, pastTuberculosis: false,
  pastVenerealDisease: false, pastSeizure: false, pastSickleCell: false,
  pastMedicalOther: "",
  pastSurgeries: "", pastHospitalizations: "", chronicConditions: "",
  // family medical checkboxes
  familyAllergies: false, familyAnemia: false, familyAnxietyDisorder: false,
  familyArthritis: false, familyAsthma: false, familyAidsHiv: false,
  familyBleedingDisorder: false, familyBloodTransfusion: false,
  familyCancer: false, familyCrohnsDisease: false, familyDiabetes: false,
  familyDepression: false, familyDvt: false, familyGerd: false,
  familyGlaucoma: false, familyHeartDisease: false, familyHeartProblems: false,
  familyHepatitis: false, familyHighBloodPressure: false, familyHighCholesterol: false,
  familyIbs: false, familyKidneyDisorder: false, familyLiverDisorder: false,
  familyLungDisease: false, familyMigraines: false, familyOsteoporosis: false,
  familyPhlebitis: false, familySkinDisorder: false, familyStomachUlcer: false,
  familyStroke: false, familyThyroidDisease: false, familyTuberculosis: false,
  familyVenerealDisease: false, familySeizure: false, familySickleCell: false,
  familyHistoryOther: "",
  tobaccoUse: "", alcoholUse: "", substanceUse: "",
  emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelationship: "",
  relationshipToInsured: "self", primaryInsuredName: "", primaryInsuredDOB: "",
  insuranceProvider: "", policyNumber: "", groupNumber: "",
  hasSecondaryInsurance: false,
  secondaryInsuranceProvider: "", secondaryPolicyNumber: "", secondaryGroupNumber: "",
  agreeToPrivacyNotice: false, agreeToAssignmentOfBenefits: false,
  agreeToFinancialResponsibility: false, agreeToTerms: false,
  signatureText: "", signatureDate: "",
  signatureData: "", signatureTimestamp: "",
};

/* ── Steps ──────────────────────────────────────────────────── */

const STEPS = [
  { id: "personal", title: "Personal Information", Icon: User },
  { id: "address", title: "Address", Icon: MapPin },
  { id: "provider", title: "Provider & Visit", Icon: Stethoscope },
  { id: "history", title: "Clinical History", Icon: ClipboardList },
  { id: "emergency", title: "Emergency Contact", Icon: Phone },
  { id: "insurance", title: "Insurance", Icon: Shield },
  { id: "legal", title: "Legal & Signature", Icon: PenLine },
] as const;

type FieldErrors = Record<string, string>;

/* ── Storage helpers ────────────────────────────────────────── */

function serializeForm(data: FormData): string { return JSON.stringify(data); }

function deserializeForm(raw: string): FormData | null {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return { ...INITIAL_FORM, ...parsed } as FormData;
    }
    return null;
  } catch { return null; }
}

function loadFromStorage(storage: Storage): FormData | null {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? deserializeForm(raw) : null;
  } catch { return null; }
}

function saveToStorage(storage: Storage, data: FormData): void {
  storage.setItem(STORAGE_KEY, serializeForm(data));
}

function clearFromStorage(storage: Storage): void {
  storage.removeItem(STORAGE_KEY);
  storage.removeItem(STEP_KEY);
}

function formatDate(val: string) {
  if (!val) return "";
  const [y, m, d] = val.split("-");
  if (!y || !m || !d) return val;
  return `${m}/${d}/${y}`;
}

/* ── Validation ─────────────────────────────────────────────── */

function validateStep(stepIndex: number, form: FormData): FieldErrors {
  const errors: FieldErrors = {};
  if (stepIndex === 0) {
    if (!form.firstName.trim()) errors.firstName = "First name is required.";
    if (!form.lastName.trim()) errors.lastName = "Last name is required.";
    if (!form.dateOfBirth) errors.dateOfBirth = "Date of birth is required.";
  }
  if (stepIndex === 2) {
    if (!form.reasonForVisit.trim()) errors.reasonForVisit = "Please describe your reason for visiting.";
  }
  if (stepIndex === 6) {
    if (!form.agreeToPrivacyNotice) errors.agreeToPrivacyNotice = "You must acknowledge the Notice of Privacy Practices.";
    if (!form.agreeToAssignmentOfBenefits) errors.agreeToAssignmentOfBenefits = "You must agree to the Assignment of Benefits.";
    if (!form.agreeToFinancialResponsibility) errors.agreeToFinancialResponsibility = "You must acknowledge financial responsibility.";
    if (!form.signatureText.trim() && !form.signatureData) errors.signatureText = "Please sign by drawing or typing your full legal name.";
  }
  return errors;
}

/* ── CSV Export ─────────────────────────────────────────────── */

function generateCSV(form: FormData): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const pastSelected = CONDITIONS.filter(c => form[pastKey(c.key) as keyof FormData] as boolean).map(c => c.label).join(", ");
  const famSelected = CONDITIONS.filter(c => form[famKey(c.key) as keyof FormData] as boolean).map(c => c.label).join(", ");

  const rows: [string, string][] = [
    ["Last Name", form.lastName],
    ["First Name", form.firstName],
    ["Preferred Name", form.preferredName],
    ["Date of Birth", formatDate(form.dateOfBirth)],
    ["Email", form.email],
    ["Phone", form.phone],
    ["Sex Assigned at Birth", form.sex],
    ["Gender Identity", form.genderIdentity],
    ["Pronouns", form.pronouns],
    ["Race", form.race],
    ["Ethnicity", form.ethnicity],
    ["Preferred Language", form.preferredLanguage],
    ["Address", form.address],
    ["City", form.city],
    ["State", form.state],
    ["ZIP Code", form.zip],
    ["Primary Care Physician", form.primaryCarePhysician],
    ["Pharmacy Name", form.pharmacyName],
    ["Pharmacy Address", form.pharmacyAddress],
    ["Pharmacy Phone", form.pharmacyPhone],
    ["Reason for Visit", form.reasonForVisit],
    ["Current Medications", form.currentMedications],
    ["Drug Allergies", form.allergies],
    ["Past Medical History (Conditions)", pastSelected],
    ["Past Medical History (Other)", form.pastMedicalOther],
    ["Past Surgeries", form.pastSurgeries],
    ["Past Hospitalizations", form.pastHospitalizations],
    ["Chronic Conditions", form.chronicConditions],
    ["Family Medical History (Conditions)", famSelected],
    ["Family Medical History (Other)", form.familyHistoryOther],
    ["Tobacco Use", form.tobaccoUse],
    ["Alcohol Use", form.alcoholUse],
    ["Substance Use", form.substanceUse],
    ["Emergency Contact Name", form.emergencyContactName],
    ["Emergency Contact Phone", form.emergencyContactPhone],
    ["Emergency Contact Relationship", form.emergencyContactRelationship],
    ["Relationship to Primary Insured", form.relationshipToInsured],
    ["Primary Insured Name", form.primaryInsuredName],
    ["Primary Insured DOB", formatDate(form.primaryInsuredDOB)],
    ["Insurance Provider", form.insuranceProvider],
    ["Policy Number", form.policyNumber],
    ["Group Number", form.groupNumber],
    ["Secondary Insurance", form.hasSecondaryInsurance ? "Yes" : "No"],
    ["Secondary Insurance Provider", form.secondaryInsuranceProvider],
    ["Secondary Policy Number", form.secondaryPolicyNumber],
    ["Secondary Group Number", form.secondaryGroupNumber],
    ["Privacy Notice Acknowledged", form.agreeToPrivacyNotice ? "Yes" : "No"],
    ["Assignment of Benefits Agreed", form.agreeToAssignmentOfBenefits ? "Yes" : "No"],
    ["Financial Responsibility Acknowledged", form.agreeToFinancialResponsibility ? "Yes" : "No"],
    ["Patient Certification", form.agreeToTerms ? "Yes" : "No"],
    ["Electronic Signature", form.signatureText || (form.signatureData ? "[Drawn Signature — see PDF]" : "")],
    ["Signature Date/Time", form.signatureTimestamp || form.signatureDate],
  ];
  return rows.map(([k, v]) => `${escape(k)},${escape(v)}`).join("\n");
}

function downloadCSV(form: FormData): void {
  const csv = generateCSV(form);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `patient-intake-${form.lastName || "form"}-${form.firstName || ""}.csv`.replace(/\s+/g, "-").toLowerCase();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── Main Component ─────────────────────────────────────────── */

export default function IntakeForm() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [expandedStep, setExpandedStep] = useState<number>(0);
  const [showDownload, setShowDownload] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [sessionConfirmation, setSessionConfirmation] = useState<string | null>(null);
  const [deviceConfirmation, setDeviceConfirmation] = useState<string | null>(null);
  const [clearConfirmation, setClearConfirmation] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalChecked, setModalChecked] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const modalFirstFocusRef = useRef<HTMLButtonElement>(null);
  const tooltipButtonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const deviceSaveButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sessionData = loadFromStorage(sessionStorage);
    const localData = loadFromStorage(localStorage);
    const data = sessionData ?? localData;
    if (data) setForm(data);
    try {
      const savedStep = sessionStorage.getItem(STEP_KEY) ?? localStorage.getItem(STEP_KEY);
      if (savedStep) {
        const stepNum = parseInt(savedStep, 10);
        if (!isNaN(stepNum) && stepNum >= 0 && stepNum <= STEPS.length) {
          const completed = new Set<number>();
          for (let i = 0; i < stepNum; i++) completed.add(i);
          setCompletedSteps(completed);
          const isAllDone = stepNum >= STEPS.length;
          setCurrentStep(isAllDone ? STEPS.length - 1 : stepNum);
          setExpandedStep(isAllDone ? STEPS.length - 1 : stepNum);
          setShowDownload(isAllDone);
        }
      }
    } catch { /* ignore */ }
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target;
      const name = target.name as keyof FormData;
      const value =
        target instanceof HTMLInputElement && target.type === "checkbox"
          ? target.checked
          : target.value;
      setForm((prev) => ({ ...prev, [name]: value }));
      setFieldErrors((prev) => {
        if (prev[name as string]) {
          const next = { ...prev };
          delete next[name as string];
          return next;
        }
        return prev;
      });
    },
    []
  );

  const saveStepProgress = (stepNum: number) => {
    try {
      const key = String(stepNum);
      if (sessionStorage.getItem(STORAGE_KEY)) sessionStorage.setItem(STEP_KEY, key);
      if (localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STEP_KEY, key);
    } catch { /* ignore */ }
  };

  const handleStepSave = (stepIndex: number) => {
    const errors = validateStep(stepIndex, form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstErrorId = Object.keys(errors)[0];
      setTimeout(() => {
        document.getElementById(firstErrorId)?.scrollIntoView({ behavior: "smooth", block: "center" });
        document.getElementById(firstErrorId)?.focus();
      }, 50);
      return;
    }
    setFieldErrors({});

    const updatedForm = stepIndex === 6 && !form.signatureTimestamp
      ? {
          ...form,
          signatureDate: new Date().toLocaleDateString(),
          signatureTimestamp: new Date().toLocaleString("en-US", {
            weekday: "long", year: "numeric", month: "long",
            day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
          }),
        }
      : form;
    if (updatedForm !== form) setForm(updatedForm);

    const nextCompleted = new Set(completedSteps);
    nextCompleted.add(stepIndex);
    setCompletedSteps(nextCompleted);
    const isLast = stepIndex === STEPS.length - 1;
    if (isLast) {
      setShowDownload(true);
      setExpandedStep(stepIndex);
      saveStepProgress(STEPS.length);
    } else {
      const nextStep = stepIndex + 1;
      setCurrentStep(nextStep);
      setExpandedStep(nextStep);
      saveStepProgress(nextStep);
      setTimeout(() => {
        document.getElementById(`step-section-${nextStep}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleToggleStep = (stepIndex: number) => {
    setFieldErrors({});
    setExpandedStep((prev) => (prev === stepIndex ? -1 : stepIndex));
  };

  const progress = showDownload
    ? 100
    : currentStep === 0
    ? 0
    : Math.round((currentStep / STEPS.length) * 100);

  const handleSessionSave = () => {
    saveToStorage(sessionStorage, form);
    setSessionConfirmation("Your progress has been saved for this session.");
    setDeviceConfirmation(null); setClearConfirmation(null);
    setTimeout(() => setSessionConfirmation(null), 6000);
  };

  const handleDeviceSaveRequest = () => {
    setModalChecked(false);
    setModalOpen(true);
    setTimeout(() => modalFirstFocusRef.current?.focus(), 50);
  };

  const handleModalSave = () => {
    if (!modalChecked) return;
    saveToStorage(localStorage, form);
    try { localStorage.setItem(STEP_KEY, String(showDownload ? STEPS.length : currentStep)); } catch { /* ignore */ }
    setModalOpen(false);
    setDeviceConfirmation("Your progress has been saved on this device. To protect your privacy, use this feature only on a personal device.");
    setSessionConfirmation(null); setClearConfirmation(null);
    setTimeout(() => setDeviceConfirmation(null), 8000);
    deviceSaveButtonRef.current?.focus();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    deviceSaveButtonRef.current?.focus();
  };

  const handleClear = () => {
    clearFromStorage(sessionStorage);
    clearFromStorage(localStorage);
    setForm(INITIAL_FORM);
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setExpandedStep(0);
    setShowDownload(false);
    setFieldErrors({});
    setClearConfirmation("Your saved form information has been removed from this device and browser.");
    setSessionConfirmation(null); setDeviceConfirmation(null);
    setTimeout(() => setClearConfirmation(null), 6000);
  };

  useEffect(() => {
    if (!modalOpen) return;
    const el = modalRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { handleModalClose(); return; }
      if (e.key === "Tab") {
        if (!focusable.length) return;
        if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
        else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  useEffect(() => {
    if (!tooltipVisible) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipButtonRef.current && !tooltipButtonRef.current.contains(e.target as Node) &&
        tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setTooltipVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tooltipVisible]);

  const tooltipId = "device-save-tooltip";
  const modalTitleId = "modal-title";
  const modalDescId = "modal-desc";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <header className="mb-5 no-print">
          <h1 className="text-3xl font-bold text-slate-800 mb-1 leading-tight">Patient Intake Form</h1>
          <p className="text-slate-500 text-base">Fill in each section below. Your progress is saved as you go.</p>
        </header>

        {/* Privacy Notice Banner */}
        <div className="mb-6 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 no-print" role="note" aria-label="Privacy notice">
          <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>Your information is not stored on this website.</strong> After completing the form, you will download or print your information and send it directly to the office.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 no-print" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Form progress: ${progress}%`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              {showDownload ? "All sections complete" : `Section ${Math.min(currentStep + 1, STEPS.length)} of ${STEPS.length}`}
            </span>
            <span className="text-sm font-semibold text-teal-700">{progress}%</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center mt-3 gap-1" aria-hidden="true">
            {STEPS.map((step, i) => {
              const done = completedSteps.has(i);
              const isCurrent = i === currentStep && !showDownload;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`step-dot ${done ? "step-dot-done" : isCurrent ? "step-dot-current" : "step-dot-upcoming"}`} title={step.title}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : <span>{i + 1}</span>}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 rounded ${done ? "bg-teal-400" : "bg-slate-300"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-3 no-print" role="list" aria-label="Form sections">
          {STEPS.map((step, stepIndex) => {
            const isCompleted = completedSteps.has(stepIndex);
            const isExpanded = expandedStep === stepIndex;
            const isLocked = stepIndex > currentStep && !isCompleted;
            const { Icon } = step;
            const hasErrors = isExpanded && Object.keys(fieldErrors).length > 0;

            return (
              <div
                key={step.id}
                id={`step-section-${stepIndex}`}
                role="listitem"
                className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden
                  ${isLocked ? "border-slate-200 bg-slate-50 opacity-60" : ""}
                  ${isExpanded && !isCompleted ? "border-teal-400 bg-white shadow-md" : ""}
                  ${isCompleted && !isExpanded ? "border-teal-200 bg-teal-50/50" : ""}
                  ${isCompleted && isExpanded ? "border-teal-300 bg-white shadow-sm" : ""}
                  ${!isExpanded && !isCompleted && !isLocked ? "border-slate-200 bg-white" : ""}
                `}
              >
                <button
                  type="button"
                  onClick={() => !isLocked && handleToggleStep(stepIndex)}
                  disabled={isLocked}
                  aria-expanded={isExpanded}
                  aria-controls={`step-content-${stepIndex}`}
                  className={`w-full flex items-center gap-4 px-6 py-5 text-left transition-colors
                    ${isLocked ? "cursor-not-allowed" : "cursor-pointer hover:bg-slate-50/80 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"}
                  `}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    ${isCompleted ? "bg-teal-500 text-white" : isExpanded ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-500"}
                  `}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-lg font-semibold leading-tight ${isLocked ? "text-slate-400" : isCompleted ? "text-teal-800" : "text-slate-800"}`}>
                        {step.title}
                      </span>
                      {isCompleted && (
                        <span className="text-xs font-medium text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">Done</span>
                      )}
                    </div>
                    {isLocked && <p className="text-sm text-slate-400 mt-0.5">Complete the previous section to unlock this one.</p>}
                    {isCompleted && !isExpanded && <SectionSummary stepIndex={stepIndex} form={form} />}
                  </div>
                  {!isLocked && (
                    <div className="shrink-0 text-slate-400" aria-hidden="true">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  )}
                </button>

                {isExpanded && !isLocked && (
                  <div id={`step-content-${stepIndex}`} className="px-6 pb-6">
                    <div className="border-t border-slate-100 pt-5">
                      {hasErrors && (
                        <div className="mb-5 flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3" role="alert">
                          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" aria-hidden="true" />
                          <p className="text-sm text-rose-700 font-medium">Please fill in all required fields before continuing.</p>
                        </div>
                      )}
                      <StepContent stepIndex={stepIndex} form={form} onChange={handleChange} errors={fieldErrors} />
                      <div className="mt-6 flex items-center gap-3">
                        {isCompleted && (
                          <button
                            type="button"
                            onClick={() => handleToggleStep(stepIndex)}
                            className="flex-1 py-3 px-5 rounded-xl border-2 border-slate-300 text-slate-700 text-base font-semibold hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleStepSave(stepIndex)}
                          className="flex-1 py-3 px-5 rounded-xl bg-teal-600 text-white text-base font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors shadow-sm"
                        >
                          {stepIndex === STEPS.length - 1
                            ? "Sign & Complete Form"
                            : isCompleted
                            ? "Save Changes & Continue"
                            : "Save & Continue"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Download Section */}
        {showDownload && (
          <div className="mt-6 rounded-2xl border-2 border-slate-800 bg-slate-800 p-7 shadow-lg no-print" role="region" aria-label="Download your completed form">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Your Form Is Ready</h2>
            </div>
            <p className="text-slate-300 text-base mb-5 leading-relaxed">
              All sections are complete. Download a copy to bring with you or share with your provider.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => { window.print(); setShowEmailDialog(true); }}
                aria-label="Download completed form as PDF"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-teal-400 text-slate-900 text-base font-bold hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
              >
                <Download className="w-5 h-5" aria-hidden="true" />
                Download as PDF
              </button>
              <button
                type="button"
                onClick={() => { downloadCSV(form); setShowEmailDialog(true); }}
                aria-label="Export form data as CSV for EHR import"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-white/15 text-white text-base font-semibold hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-800 border border-white/20 transition-colors"
              >
                <FileDown className="w-5 h-5" aria-hidden="true" />
                Export for EHR (CSV)
              </button>
            </div>
            <p className="text-slate-400 text-xs mt-3 text-center">
              The CSV file can be imported into most electronic health record systems.
            </p>
            <p className="text-slate-500 text-xs mt-4 pt-4 border-t border-white/10 text-center">
              This intake system is intended for use by patients of{" "}
              <span className="font-medium text-slate-300">{PRACTICE_NAME}</span> only.
            </p>
          </div>
        )}

        {/* Save Tools */}
        <div className="mt-6 border border-teal-100 bg-teal-50 rounded-2xl p-6 no-print" role="region" aria-label="Save your progress">
          <h2 className="text-lg font-bold text-teal-900 mb-1">Save Your Progress</h2>
          <p className="text-sm text-teal-700 mb-5" role="note">
            Your form information stays in this browser unless you choose to print or download it.
          </p>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-5">
            <div className="flex flex-col gap-1 flex-1">
              <button type="button" onClick={handleSessionSave} className="save-btn save-btn-session" aria-label="Save for this session">
                Save for This Session
              </button>
              <p className="helper-text">Saves your progress temporarily while this browser tab stays open.</p>
              {sessionConfirmation && <p role="status" aria-live="polite" className="confirmation-msg text-teal-700 bg-teal-100">{sessionConfirmation}</p>}
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2 relative">
                <button ref={deviceSaveButtonRef} type="button" onClick={handleDeviceSaveRequest} className="save-btn save-btn-device" aria-label="Save progress on this device" aria-describedby={tooltipId}>
                  Save Progress on This Device
                </button>
                <div className="relative">
                  <button ref={tooltipButtonRef} type="button" aria-label="Privacy information about saving on this device" aria-describedby={tooltipId} aria-expanded={tooltipVisible}
                    onClick={() => setTooltipVisible((v) => !v)} onKeyDown={(e) => { if (e.key === "Escape") setTooltipVisible(false); }} className="tooltip-trigger">
                    <Info className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <div ref={tooltipRef} id={tooltipId} role="tooltip" aria-hidden={!tooltipVisible} className={`tooltip-content ${tooltipVisible ? "tooltip-visible" : "tooltip-hidden"}`}>
                    This saves your progress only on this device and browser so you can come back later. Do not use this option on a shared or public computer.
                  </div>
                </div>
              </div>
              <p className="helper-text">Saves your progress only on this device and browser so you can return later.</p>
              {deviceConfirmation && <p role="status" aria-live="polite" className="confirmation-msg text-emerald-700 bg-emerald-50">{deviceConfirmation}</p>}
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <button type="button" onClick={handleClear} className="save-btn save-btn-clear" aria-label="Clear saved data">
                Clear Saved Data
              </button>
              <p className="helper-text">Removes any saved form information from this device and browser.</p>
              {clearConfirmation && <p role="status" aria-live="polite" className="confirmation-msg text-rose-700 bg-rose-50">{clearConfirmation}</p>}
            </div>
          </div>
        </div>

        {/* Print View */}
        <div className="print-only" aria-hidden="true">
          <PrintView form={form} />
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Email Prompt Dialog */}
      {showEmailDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print" role="dialog" aria-modal="true" aria-label="Send your intake form">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEmailDialog(false)} aria-hidden="true" />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-teal-600" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 leading-snug">Next Step: Send Your Form</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailDialog(false)}
                aria-label="Close dialog"
                className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 ml-2"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Email your completed intake form to{" "}
              <span className="font-semibold text-slate-800">{PRACTICE_NAME}</span> at:
            </p>
            <a
              href={`mailto:${PRACTICE_EMAIL}?subject=Patient Intake Form — ${PRACTICE_NAME}&body=Please find my completed patient intake form attached.`}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-teal-600 text-white text-base font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors mb-4"
            >
              <Mail className="w-5 h-5" aria-hidden="true" />
              Email to {PRACTICE_EMAIL}
            </a>
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-amber-800 leading-relaxed">
                Standard email is not encrypted. If {PRACTICE_NAME} offers a secure patient portal, consider submitting your form there instead for added privacy.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowEmailDialog(false)}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Device Save Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print" role="dialog" aria-modal="true" aria-labelledby={modalTitleId} aria-describedby={modalDescId}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleModalClose} aria-hidden="true" />
          <div ref={modalRef} className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 id={modalTitleId} className="text-lg font-bold text-slate-800 pr-4 leading-snug">Save Progress on This Device</h2>
              <button ref={modalFirstFocusRef} type="button" onClick={handleModalClose} aria-label="Close dialog" className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <p id={modalDescId} className="text-sm text-slate-600 mb-5 leading-relaxed">
              Your information will be saved only on this device and in this browser so you can return later and continue your form.{" "}
              <strong>For your privacy, do not use this feature on a shared or public computer.</strong>
            </p>
            <div className="flex items-start gap-3 mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <input id="modal-privacy-checkbox" type="checkbox" checked={modalChecked} onChange={(e) => setModalChecked(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" aria-required="true" />
              <label htmlFor="modal-privacy-checkbox" className="text-sm text-slate-700 leading-relaxed cursor-pointer">
                I understand this saves my information only on this device and browser. Do not use this option on a shared or public computer.
              </label>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={handleModalClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors">Cancel</button>
              <button type="button" onClick={handleModalSave} disabled={!modalChecked} aria-disabled={!modalChecked} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors">
                Save on This Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Condition Checklist Helper ─────────────────────────────── */

function ConditionChecklist({ prefix, form, onChange }: {
  prefix: "past" | "family";
  form: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
      {CONDITIONS.map(({ label, key }) => {
        const fieldName = `${prefix}${capFirst(key)}`;
        const checked = form[fieldName as keyof FormData] as boolean;
        return (
          <label key={fieldName} className="flex items-center gap-2 cursor-pointer group py-0.5">
            <input
              id={fieldName}
              name={fieldName}
              type="checkbox"
              checked={checked}
              onChange={onChange}
              className="h-4 w-4 shrink-0 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-slate-700 group-hover:text-slate-900 leading-snug">{label}</span>
          </label>
        );
      })}
    </div>
  );
}

/* ── Signature Pad (draw) ─────────────────────────────────────── */

function SignaturePad({ onSigned, onCleared }: {
  onSigned: (dataUrl: string) => void;
  onCleared: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasContentRef = useRef(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "#1e3a5f";
  }, []);

  function getXY(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = getXY(e);
    lastPosRef.current = pos;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  function doDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!isDrawingRef.current || !lastPosRef.current) return;
    const pos = getXY(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPosRef.current = pos;
    if (!hasContentRef.current) {
      hasContentRef.current = true;
      setHasContent(true);
    }
  }

  function endDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPosRef.current = null;
    if (hasContentRef.current && canvasRef.current) {
      onSigned(canvasRef.current.toDataURL("image/png"));
    }
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    hasContentRef.current = false;
    setHasContent(false);
    onCleared();
  }

  return (
    <div>
      <div className="relative border-2 border-slate-300 rounded-xl bg-white overflow-hidden" style={{ height: "110px" }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={doDraw}
          onMouseUp={endDraw}
          onMouseLeave={(e) => { if (isDrawingRef.current) endDraw(e as unknown as React.MouseEvent); }}
          onTouchStart={startDraw}
          onTouchMove={doDraw}
          onTouchEnd={endDraw}
        />
        {!hasContent && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <p className="text-slate-400 text-sm italic">Draw your signature here</p>
          </div>
        )}
      </div>
      {hasContent && (
        <button type="button" onClick={clearCanvas}
          className="mt-1.5 text-xs text-rose-500 hover:text-rose-700 underline focus:outline-none">
          Clear &amp; redraw
        </button>
      )}
    </div>
  );
}

/* ── Signature Block (draw + type switcher) ───────────────────── */

function SignatureBlock({ form, onChange, errors }: {
  form: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: FieldErrors;
}) {
  const [mode, setMode] = useState<"draw" | "type">(form.signatureData ? "draw" : "type");

  function fakeEvent(name: string, value: string) {
    return { target: { name, value, type: "text" } } as unknown as React.ChangeEvent<HTMLInputElement>;
  }

  const hasError = !!errors.signatureText;

  return (
    <div className={`rounded-xl border-2 p-5 ${hasError ? "border-rose-300 bg-rose-50" : "border-teal-200 bg-teal-50"}`}>
      <p className="text-sm font-bold text-slate-700 mb-1 uppercase tracking-wide">Electronic Signature</p>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        Your signature confirms you have read and agreed to all authorizations on this form.
      </p>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-4 bg-white border border-slate-200 rounded-lg p-1 w-fit">
        {(["draw", "type"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              mode === m ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {m === "draw" ? "Draw" : "Type"}
          </button>
        ))}
      </div>

      {mode === "draw" ? (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Sign using your mouse or finger:</p>
          <SignaturePad
            onSigned={(dataUrl) => onChange(fakeEvent("signatureData", dataUrl))}
            onCleared={() => onChange(fakeEvent("signatureData", ""))}
          />
        </div>
      ) : (
        <div>
          <Field label="Type your full legal name to sign" required htmlFor="signatureText" error={errors.signatureText}>
            <input
              id="signatureText"
              name="signatureText"
              type="text"
              value={form.signatureText}
              onChange={onChange}
              className={`form-input text-lg ${hasError ? "form-input-error" : ""}`}
              aria-required="true"
              placeholder="Your full legal name"
              autoComplete="name"
            />
          </Field>
          {form.signatureText && (
            <div className="mt-3 p-3 bg-white border border-teal-200 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Signed as:</p>
              <p className="signature-display">{form.signatureText}</p>
            </div>
          )}
        </div>
      )}

      {hasError && (
        <p className="mt-2 text-sm text-rose-600 flex items-center gap-1.5" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Please sign by drawing or typing your full legal name.
        </p>
      )}
    </div>
  );
}

/* ── Step Content ─────────────────────────────────────────────── */

function StepContent({ stepIndex, form, onChange, errors }: {
  stepIndex: number;
  form: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: FieldErrors;
}) {
  const checkboxOnChange = onChange as (e: React.ChangeEvent<HTMLInputElement>) => void;

  // Step 0 — Personal Information
  if (stepIndex === 0) return (
    <div className="flex flex-col gap-5">
      <TwoCol>
        <Field label="First Name" required htmlFor="firstName" error={errors.firstName}>
          <input id="firstName" name="firstName" type="text" autoComplete="given-name" value={form.firstName} onChange={onChange} className={`form-input ${errors.firstName ? "form-input-error" : ""}`} aria-required="true" placeholder="e.g. Jane" />
        </Field>
        <Field label="Last Name" required htmlFor="lastName" error={errors.lastName}>
          <input id="lastName" name="lastName" type="text" autoComplete="family-name" value={form.lastName} onChange={onChange} className={`form-input ${errors.lastName ? "form-input-error" : ""}`} aria-required="true" placeholder="e.g. Smith" />
        </Field>
      </TwoCol>
      <Field label="Preferred Name" htmlFor="preferredName" hint="The name you like to be called, if different from your legal name.">
        <input id="preferredName" name="preferredName" type="text" value={form.preferredName} onChange={onChange} className="form-input" placeholder="e.g. Janie" />
      </Field>
      <Field label="Date of Birth" required htmlFor="dateOfBirth" error={errors.dateOfBirth}>
        <input id="dateOfBirth" name="dateOfBirth" type="date" autoComplete="bday" value={form.dateOfBirth} onChange={onChange} className={`form-input ${errors.dateOfBirth ? "form-input-error" : ""}`} aria-required="true" />
      </Field>
      <TwoCol>
        <Field label="Email Address" htmlFor="email">
          <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} className="form-input" placeholder="e.g. jane@email.com" />
        </Field>
        <Field label="Phone Number" htmlFor="phone">
          <input id="phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={onChange} className="form-input" placeholder="e.g. (555) 000-0000" />
        </Field>
      </TwoCol>
      <TwoCol>
        <Field label="Sex Assigned at Birth" htmlFor="sex">
          <select id="sex" name="sex" value={form.sex} onChange={onChange} className="form-input">
            <option value="">— Select —</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Intersex">Intersex</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </Field>
        <Field label="Gender Identity" htmlFor="genderIdentity">
          <select id="genderIdentity" name="genderIdentity" value={form.genderIdentity} onChange={onChange} className="form-input">
            <option value="">— Select —</option>
            <option value="Woman">Woman</option>
            <option value="Man">Man</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Transgender woman">Transgender woman</option>
            <option value="Transgender man">Transgender man</option>
            <option value="Prefer to self-describe">Prefer to self-describe</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </Field>
      </TwoCol>
      <Field label="Pronouns" htmlFor="pronouns" hint="e.g. She/Her, He/Him, They/Them">
        <input id="pronouns" name="pronouns" type="text" value={form.pronouns} onChange={onChange} className="form-input" placeholder="e.g. She/Her" />
      </Field>
      <TwoCol>
        <Field label="Race" htmlFor="race">
          <select id="race" name="race" value={form.race} onChange={onChange} className="form-input">
            <option value="">— Select —</option>
            <option value="American Indian or Alaska Native">American Indian or Alaska Native</option>
            <option value="Asian">Asian</option>
            <option value="Black or African American">Black or African American</option>
            <option value="Native Hawaiian or Other Pacific Islander">Native Hawaiian or Other Pacific Islander</option>
            <option value="White">White</option>
            <option value="Multiracial">Multiracial</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </Field>
        <Field label="Ethnicity" htmlFor="ethnicity">
          <select id="ethnicity" name="ethnicity" value={form.ethnicity} onChange={onChange} className="form-input">
            <option value="">— Select —</option>
            <option value="Hispanic or Latino">Hispanic or Latino</option>
            <option value="Not Hispanic or Latino">Not Hispanic or Latino</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </Field>
      </TwoCol>
      <Field label="Preferred Language" htmlFor="preferredLanguage">
        <select id="preferredLanguage" name="preferredLanguage" value={form.preferredLanguage} onChange={onChange} className="form-input">
          <option value="">— Select —</option>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="Mandarin">Mandarin Chinese</option>
          <option value="Cantonese">Cantonese Chinese</option>
          <option value="Vietnamese">Vietnamese</option>
          <option value="Korean">Korean</option>
          <option value="Russian">Russian</option>
          <option value="Arabic">Arabic</option>
          <option value="Portuguese">Portuguese</option>
          <option value="Tagalog">Tagalog</option>
          <option value="Other">Other</option>
        </select>
      </Field>
    </div>
  );

  // Step 1 — Address
  if (stepIndex === 1) return (
    <div className="flex flex-col gap-5">
      <Field label="Street Address" htmlFor="address">
        <input id="address" name="address" type="text" autoComplete="street-address" value={form.address} onChange={onChange} className="form-input" placeholder="e.g. 123 Main Street" />
      </Field>
      <TwoCol>
        <Field label="City" htmlFor="city">
          <input id="city" name="city" type="text" autoComplete="address-level2" value={form.city} onChange={onChange} className="form-input" placeholder="e.g. Springfield" />
        </Field>
        <Field label="State" htmlFor="state">
          <input id="state" name="state" type="text" autoComplete="address-level1" value={form.state} onChange={onChange} className="form-input" placeholder="e.g. IL" />
        </Field>
      </TwoCol>
      <Field label="ZIP Code" htmlFor="zip">
        <input id="zip" name="zip" type="text" autoComplete="postal-code" value={form.zip} onChange={onChange} className="form-input" placeholder="e.g. 62701" />
      </Field>
    </div>
  );

  // Step 2 — Provider & Visit
  if (stepIndex === 2) return (
    <div className="flex flex-col gap-5">
      <Field label="Primary Care Physician" htmlFor="primaryCarePhysician" hint="Your regular doctor, if you have one.">
        <input id="primaryCarePhysician" name="primaryCarePhysician" type="text" value={form.primaryCarePhysician} onChange={onChange} className="form-input" placeholder="e.g. Dr. Maria Lopez" />
      </Field>
      <div className="border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Preferred Pharmacy</p>
        <div className="flex flex-col gap-4">
          <Field label="Pharmacy Name" htmlFor="pharmacyName">
            <input id="pharmacyName" name="pharmacyName" type="text" value={form.pharmacyName} onChange={onChange} className="form-input" placeholder="e.g. CVS, Walgreens, Rite Aid" />
          </Field>
          <TwoCol>
            <Field label="Pharmacy Address" htmlFor="pharmacyAddress">
              <input id="pharmacyAddress" name="pharmacyAddress" type="text" value={form.pharmacyAddress} onChange={onChange} className="form-input" placeholder="e.g. 456 Oak Ave, Chicago" />
            </Field>
            <Field label="Pharmacy Phone" htmlFor="pharmacyPhone">
              <input id="pharmacyPhone" name="pharmacyPhone" type="tel" value={form.pharmacyPhone} onChange={onChange} className="form-input" placeholder="e.g. (555) 111-2222" />
            </Field>
          </TwoCol>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Today's Visit</p>
        <div className="flex flex-col gap-4">
          <Field label="Reason for Visit" required htmlFor="reasonForVisit" error={errors.reasonForVisit} hint="In a few words, describe why you are visiting today.">
            <textarea id="reasonForVisit" name="reasonForVisit" rows={3} value={form.reasonForVisit} onChange={onChange} className={`form-input resize-y ${errors.reasonForVisit ? "form-input-error" : ""}`} aria-required="true" placeholder="e.g. Annual checkup, knee pain, follow-up visit" />
          </Field>
          <Field label="Current Medications" htmlFor="currentMedications" hint='List any medications you take regularly. Write "None" if you take no medications.'>
            <textarea id="currentMedications" name="currentMedications" rows={3} value={form.currentMedications} onChange={onChange} className="form-input resize-y" placeholder="e.g. Lisinopril 10mg, Aspirin 81mg" />
          </Field>
          <Field label="Drug Allergies" htmlFor="allergies" hint='List any known drug allergies. Write "None" if you have no known drug allergies.'>
            <textarea id="allergies" name="allergies" rows={2} value={form.allergies} onChange={onChange} className="form-input resize-y" placeholder="e.g. Penicillin, Sulfa drugs" />
          </Field>
        </div>
      </div>
    </div>
  );

  // Step 3 — Clinical History
  if (stepIndex === 3) return (
    <div className="flex flex-col gap-6">

      {/* Past Medical History — checkbox grid */}
      <div>
        <p className="text-base font-bold text-slate-800 mb-1">Past Medical History</p>
        <p className="text-sm text-slate-500 mb-4">Check all conditions that apply to you personally.</p>
        <ConditionChecklist prefix="past" form={form} onChange={checkboxOnChange} />
        <div className="mt-4">
          <Field label="Other" htmlFor="pastMedicalOther">
            <input id="pastMedicalOther" name="pastMedicalOther" type="text" value={form.pastMedicalOther} onChange={onChange} className="form-input" placeholder="Any other conditions not listed above" />
          </Field>
        </div>
      </div>

      {/* Free-text clinical fields */}
      <div className="border-t border-slate-100 pt-5 flex flex-col gap-4">
        <Field label="Past Surgeries" htmlFor="pastSurgeries" hint='List any surgeries you have had. Include the approximate year if you remember. Write "None" if not applicable.'>
          <textarea id="pastSurgeries" name="pastSurgeries" rows={2} value={form.pastSurgeries} onChange={onChange} className="form-input resize-y" placeholder="e.g. Appendix removed (2015), Knee surgery (2019)" />
        </Field>
        <Field label="Past Hospitalizations" htmlFor="pastHospitalizations" hint='List any times you have been admitted to a hospital. Write "None" if not applicable.'>
          <textarea id="pastHospitalizations" name="pastHospitalizations" rows={2} value={form.pastHospitalizations} onChange={onChange} className="form-input resize-y" placeholder="e.g. Pneumonia (2020), Childbirth (2018)" />
        </Field>
        <Field label="Chronic or Ongoing Medical Conditions" htmlFor="chronicConditions" hint='List any long-term health conditions not covered above. Write "None" if not applicable.'>
          <textarea id="chronicConditions" name="chronicConditions" rows={2} value={form.chronicConditions} onChange={onChange} className="form-input resize-y" placeholder="e.g. Fibromyalgia, Lupus" />
        </Field>
      </div>

      {/* Family Medical History — same checkbox grid */}
      <div className="border-t border-slate-100 pt-5">
        <p className="text-base font-bold text-slate-800 mb-1">Family Medical History</p>
        <p className="text-sm text-slate-500 mb-4">Check any conditions that run in your immediate family (parents, siblings, children).</p>
        <ConditionChecklist prefix="family" form={form} onChange={checkboxOnChange} />
        <div className="mt-4">
          <Field label="Other" htmlFor="familyHistoryOther">
            <input id="familyHistoryOther" name="familyHistoryOther" type="text" value={form.familyHistoryOther} onChange={onChange} className="form-input" placeholder="Any other family conditions not listed above" />
          </Field>
        </div>
      </div>

      {/* Social History */}
      <div className="border-t border-slate-100 pt-5">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Social History</p>
        <div className="flex flex-col gap-4">
          <TwoCol>
            <Field label="Tobacco Use" htmlFor="tobaccoUse">
              <select id="tobaccoUse" name="tobaccoUse" value={form.tobaccoUse} onChange={onChange} className="form-input">
                <option value="">— Select —</option>
                <option value="Never">Never</option>
                <option value="Former user">Former user</option>
                <option value="Current user">Current user</option>
              </select>
            </Field>
            <Field label="Alcohol Use" htmlFor="alcoholUse">
              <select id="alcoholUse" name="alcoholUse" value={form.alcoholUse} onChange={onChange} className="form-input">
                <option value="">— Select —</option>
                <option value="None">None</option>
                <option value="Occasional (1–2 drinks/week)">Occasional (1–2 drinks/week)</option>
                <option value="Moderate (3–7 drinks/week)">Moderate (3–7 drinks/week)</option>
                <option value="Heavy (more than 7 drinks/week)">Heavy (more than 7 drinks/week)</option>
              </select>
            </Field>
          </TwoCol>
          <Field label="Recreational Substance Use" htmlFor="substanceUse" hint='Write "None" if not applicable. Your answers are confidential.'>
            <textarea id="substanceUse" name="substanceUse" rows={2} value={form.substanceUse} onChange={onChange} className="form-input resize-y" placeholder="e.g. None, Marijuana occasionally" />
          </Field>
        </div>
      </div>
    </div>
  );

  // Step 4 — Emergency Contact
  if (stepIndex === 4) return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-500 -mt-1">Who should we contact in case of an emergency?</p>
      <Field label="Full Name" htmlFor="emergencyContactName">
        <input id="emergencyContactName" name="emergencyContactName" type="text" value={form.emergencyContactName} onChange={onChange} className="form-input" placeholder="e.g. John Smith" />
      </Field>
      <TwoCol>
        <Field label="Phone Number" htmlFor="emergencyContactPhone">
          <input id="emergencyContactPhone" name="emergencyContactPhone" type="tel" value={form.emergencyContactPhone} onChange={onChange} className="form-input" placeholder="e.g. (555) 000-0000" />
        </Field>
        <Field label="Relationship to You" htmlFor="emergencyContactRelationship">
          <input id="emergencyContactRelationship" name="emergencyContactRelationship" type="text" value={form.emergencyContactRelationship} onChange={onChange} className="form-input" placeholder="e.g. Spouse, Parent, Friend" />
        </Field>
      </TwoCol>
    </div>
  );

  // Step 5 — Insurance
  if (stepIndex === 5) return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-500 -mt-1">If you have health insurance, please fill in the details below. Leave blank if you do not have insurance.</p>
      <Field label="Your Relationship to the Primary Insured" htmlFor="relationshipToInsured">
        <select id="relationshipToInsured" name="relationshipToInsured" value={form.relationshipToInsured} onChange={onChange} className="form-input">
          <option value="self">Self (I am the primary insured)</option>
          <option value="spouse">Spouse / Domestic Partner</option>
          <option value="child">Child</option>
          <option value="other">Other</option>
        </select>
      </Field>
      {form.relationshipToInsured !== "self" && (
        <TwoCol>
          <Field label="Primary Insured Full Name" htmlFor="primaryInsuredName">
            <input id="primaryInsuredName" name="primaryInsuredName" type="text" value={form.primaryInsuredName} onChange={onChange} className="form-input" placeholder="Name on the insurance card" />
          </Field>
          <Field label="Primary Insured Date of Birth" htmlFor="primaryInsuredDOB">
            <input id="primaryInsuredDOB" name="primaryInsuredDOB" type="date" value={form.primaryInsuredDOB} onChange={onChange} className="form-input" />
          </Field>
        </TwoCol>
      )}
      <div className="border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Primary Insurance</p>
        <div className="flex flex-col gap-4">
          <Field label="Insurance Provider" htmlFor="insuranceProvider">
            <input id="insuranceProvider" name="insuranceProvider" type="text" value={form.insuranceProvider} onChange={onChange} className="form-input" placeholder="e.g. Blue Cross Blue Shield" />
          </Field>
          <TwoCol>
            <Field label="Policy Number" htmlFor="policyNumber" hint="Found on your insurance card.">
              <input id="policyNumber" name="policyNumber" type="text" value={form.policyNumber} onChange={onChange} className="form-input" />
            </Field>
            <Field label="Group Number" htmlFor="groupNumber" hint="Found on your insurance card.">
              <input id="groupNumber" name="groupNumber" type="text" value={form.groupNumber} onChange={onChange} className="form-input" />
            </Field>
          </TwoCol>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input id="hasSecondaryInsurance" name="hasSecondaryInsurance" type="checkbox" checked={form.hasSecondaryInsurance} onChange={onChange} className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
          <span className="text-base font-semibold text-slate-700">I have a secondary insurance plan</span>
        </label>
        {form.hasSecondaryInsurance && (
          <div className="mt-4 flex flex-col gap-4">
            <Field label="Secondary Insurance Provider" htmlFor="secondaryInsuranceProvider">
              <input id="secondaryInsuranceProvider" name="secondaryInsuranceProvider" type="text" value={form.secondaryInsuranceProvider} onChange={onChange} className="form-input" placeholder="e.g. Medicare, Aetna" />
            </Field>
            <TwoCol>
              <Field label="Secondary Policy Number" htmlFor="secondaryPolicyNumber">
                <input id="secondaryPolicyNumber" name="secondaryPolicyNumber" type="text" value={form.secondaryPolicyNumber} onChange={onChange} className="form-input" />
              </Field>
              <Field label="Secondary Group Number" htmlFor="secondaryGroupNumber">
                <input id="secondaryGroupNumber" name="secondaryGroupNumber" type="text" value={form.secondaryGroupNumber} onChange={onChange} className="form-input" />
              </Field>
            </TwoCol>
          </div>
        )}
      </div>
    </div>
  );

  // Step 6 — Legal & Signature
  if (stepIndex === 6) return (
    <div className="flex flex-col gap-6">
      <div className={`rounded-xl border-2 p-4 ${errors.agreeToPrivacyNotice ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
        <p className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Notice of Privacy Practices</p>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          This practice is required by law to maintain the privacy of your health information and to provide you with a Notice of Privacy Practices. The Notice describes how your medical information may be used and disclosed, and how you can access this information. By checking the box below, you acknowledge that you have been offered a copy of our Notice of Privacy Practices.
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input id="agreeToPrivacyNotice" name="agreeToPrivacyNotice" type="checkbox" checked={form.agreeToPrivacyNotice} onChange={onChange} className="mt-0.5 h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" aria-required="true" />
          <span className="text-base text-slate-800 leading-relaxed font-medium">
            I have been offered a copy of this practice's Notice of Privacy Practices and understand how my health information may be used.
          </span>
        </label>
        {errors.agreeToPrivacyNotice && <p id="agreeToPrivacyNotice-error" className="error-msg mt-2">{errors.agreeToPrivacyNotice}</p>}
      </div>

      <div className={`rounded-xl border-2 p-4 ${errors.agreeToAssignmentOfBenefits ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
        <p className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Assignment of Benefits</p>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          I authorize direct payment of insurance benefits to this practice for services rendered. I understand that I am financially responsible for any amounts not covered by my insurance, including co-pays, deductibles, and non-covered services.
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input id="agreeToAssignmentOfBenefits" name="agreeToAssignmentOfBenefits" type="checkbox" checked={form.agreeToAssignmentOfBenefits} onChange={onChange} className="mt-0.5 h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" aria-required="true" />
          <span className="text-base text-slate-800 leading-relaxed font-medium">
            I authorize this practice to bill my insurance directly and understand I am responsible for any remaining balance.
          </span>
        </label>
        {errors.agreeToAssignmentOfBenefits && <p id="agreeToAssignmentOfBenefits-error" className="error-msg mt-2">{errors.agreeToAssignmentOfBenefits}</p>}
      </div>

      <div className={`rounded-xl border-2 p-4 ${errors.agreeToFinancialResponsibility ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
        <p className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Financial Responsibility</p>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          I acknowledge that I am personally responsible for all charges for services rendered at this practice, regardless of insurance coverage. I agree to pay all outstanding balances including co-pays, deductibles, coinsurance, and any services not covered by my insurance plan.
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input id="agreeToFinancialResponsibility" name="agreeToFinancialResponsibility" type="checkbox" checked={form.agreeToFinancialResponsibility} onChange={onChange} className="mt-0.5 h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" aria-required="true" />
          <span className="text-base text-slate-800 leading-relaxed font-medium">
            I understand and accept responsibility for all charges for services provided at this practice.
          </span>
        </label>
        {errors.agreeToFinancialResponsibility && <p id="agreeToFinancialResponsibility-error" className="error-msg mt-2">{errors.agreeToFinancialResponsibility}</p>}
      </div>

      <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Patient Certification</p>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          I certify that the information I have provided in this form is accurate and complete to the best of my knowledge.
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input id="agreeToTerms" name="agreeToTerms" type="checkbox" checked={form.agreeToTerms} onChange={onChange} className="mt-0.5 h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
          <span className="text-base text-slate-800 leading-relaxed font-medium">
            I certify that all information I have provided is accurate and complete.
          </span>
        </label>
      </div>

      <SignatureBlock form={form} onChange={onChange} errors={errors} />
    </div>
  );

  return null;
}

/* ── Section Summary ─────────────────────────────────────────── */

function SectionSummary({ stepIndex, form }: { stepIndex: number; form: FormData }) {
  const parts: string[] = [];
  if (stepIndex === 0) {
    if (form.firstName || form.lastName) parts.push(`${form.firstName} ${form.lastName}`.trim());
    if (form.dateOfBirth) parts.push(formatDate(form.dateOfBirth));
  } else if (stepIndex === 1) {
    if (form.city || form.state) parts.push(`${form.city}${form.city && form.state ? ", " : ""}${form.state}`);
  } else if (stepIndex === 2) {
    if (form.reasonForVisit) parts.push(form.reasonForVisit.length > 50 ? form.reasonForVisit.slice(0, 50) + "…" : form.reasonForVisit);
  } else if (stepIndex === 3) {
    const pastCount = CONDITIONS.filter(c => form[pastKey(c.key) as keyof FormData] as boolean).length;
    const famCount = CONDITIONS.filter(c => form[famKey(c.key) as keyof FormData] as boolean).length;
    if (pastCount > 0) parts.push(`${pastCount} past condition${pastCount !== 1 ? "s" : ""}`);
    if (famCount > 0) parts.push(`${famCount} family condition${famCount !== 1 ? "s" : ""}`);
    if (!pastCount && !famCount) parts.push("No conditions reported");
  } else if (stepIndex === 4) {
    if (form.emergencyContactName) parts.push(form.emergencyContactName);
    if (form.emergencyContactRelationship) parts.push(form.emergencyContactRelationship);
  } else if (stepIndex === 5) {
    parts.push(form.insuranceProvider || "No insurance provided");
    if (form.hasSecondaryInsurance) parts.push("+ Secondary");
  } else if (stepIndex === 6) {
    parts.push(
      form.signatureText ? `Signed by ${form.signatureText}` :
      form.signatureData ? "Signed (drawn)" :
      "Pending signature"
    );
  }
  if (!parts.length) return null;
  return <p className="text-sm text-slate-500 mt-0.5 truncate">{parts.join(" · ")}</p>;
}

/* ── Shared UI Helpers ───────────────────────────────────────── */

function Field({ label, required, htmlFor, hint, error, children }: {
  label: string;
  required?: boolean;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-base font-semibold text-slate-700">
        {label}
        {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
      </label>
      {hint && <p className="text-sm text-slate-500 -mt-0.5">{hint}</p>}
      {children}
      {error && <p id={`${htmlFor}-error`} className="error-msg" role="alert">{error}</p>}
    </div>
  );
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

/* ── Print View ─────────────────────────────────────────────── */

function PrintRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="print-row">
      <span className="print-label">{label}</span>
      <span className="print-value">{value || "\u00a0"}</span>
    </div>
  );
}

function PrintSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="print-section">
      <h2 className="print-section-title">{title}</h2>
      {children}
    </div>
  );
}

function PrintView({ form }: { form: FormData }) {
  const pastSelected = CONDITIONS.filter(c => form[pastKey(c.key) as keyof FormData] as boolean).map(c => c.label);
  const famSelected = CONDITIONS.filter(c => form[famKey(c.key) as keyof FormData] as boolean).map(c => c.label);

  return (
    <div className="print-document">
      <div className="print-doc-header">
        <h1 className="print-doc-title">Patient Intake Form</h1>
        <p className="print-doc-subtitle">Date printed: {new Date().toLocaleDateString()}</p>
      </div>

      <PrintSection title="Personal Information">
        <div className="print-two-col">
          <PrintRow label="First Name" value={form.firstName} />
          <PrintRow label="Last Name" value={form.lastName} />
        </div>
        <div className="print-two-col">
          <PrintRow label="Preferred Name" value={form.preferredName} />
          <PrintRow label="Date of Birth" value={formatDate(form.dateOfBirth)} />
        </div>
        <div className="print-two-col">
          <PrintRow label="Email" value={form.email} />
          <PrintRow label="Phone" value={form.phone} />
        </div>
        <div className="print-two-col">
          <PrintRow label="Sex Assigned at Birth" value={form.sex} />
          <PrintRow label="Gender Identity" value={form.genderIdentity} />
        </div>
        <div className="print-two-col">
          <PrintRow label="Pronouns" value={form.pronouns} />
          <PrintRow label="Preferred Language" value={form.preferredLanguage} />
        </div>
        <div className="print-two-col">
          <PrintRow label="Race" value={form.race} />
          <PrintRow label="Ethnicity" value={form.ethnicity} />
        </div>
      </PrintSection>

      <PrintSection title="Address">
        <PrintRow label="Street Address" value={form.address} />
        <div className="print-two-col">
          <PrintRow label="City" value={form.city} />
          <PrintRow label="State" value={form.state} />
        </div>
        <PrintRow label="ZIP Code" value={form.zip} />
      </PrintSection>

      <PrintSection title="Provider & Visit">
        <PrintRow label="Primary Care Physician" value={form.primaryCarePhysician} />
        <div className="print-two-col">
          <PrintRow label="Pharmacy Name" value={form.pharmacyName} />
          <PrintRow label="Pharmacy Phone" value={form.pharmacyPhone} />
        </div>
        <PrintRow label="Pharmacy Address" value={form.pharmacyAddress} />
        <PrintRow label="Reason for Visit" value={form.reasonForVisit} />
        <PrintRow label="Current Medications" value={form.currentMedications} />
        <PrintRow label="Drug Allergies" value={form.allergies} />
      </PrintSection>

      <PrintSection title="Clinical History — Past Medical History">
        <div className="print-checklist">
          {CONDITIONS.map(({ label, key }) => {
            const checked = form[pastKey(key) as keyof FormData] as boolean;
            return (
              <div key={key} className="print-check-item">
                <span className="print-checkbox">{checked ? "☑" : "☐"}</span>
                <span>{label}</span>
              </div>
            );
          })}
          <div className="print-check-item">
            <span className="print-checkbox">☐</span>
            <span>Other: {form.pastMedicalOther || "_______________________"}</span>
          </div>
        </div>
        <PrintRow label="Past Surgeries" value={form.pastSurgeries} />
        <PrintRow label="Past Hospitalizations" value={form.pastHospitalizations} />
        <PrintRow label="Additional Chronic Conditions" value={form.chronicConditions} />
      </PrintSection>

      <PrintSection title="Clinical History — Family Medical History">
        <p className="print-subtitle">Immediate family (parents, siblings, children)</p>
        <div className="print-checklist">
          {CONDITIONS.map(({ label, key }) => {
            const checked = form[famKey(key) as keyof FormData] as boolean;
            return (
              <div key={key} className="print-check-item">
                <span className="print-checkbox">{checked ? "☑" : "☐"}</span>
                <span>{label}</span>
              </div>
            );
          })}
          <div className="print-check-item">
            <span className="print-checkbox">☐</span>
            <span>Other: {form.familyHistoryOther || "_______________________"}</span>
          </div>
        </div>
      </PrintSection>

      <PrintSection title="Social History">
        <div className="print-two-col">
          <PrintRow label="Tobacco Use" value={form.tobaccoUse} />
          <PrintRow label="Alcohol Use" value={form.alcoholUse} />
        </div>
        <PrintRow label="Substance Use" value={form.substanceUse} />
      </PrintSection>

      <PrintSection title="Emergency Contact">
        <PrintRow label="Full Name" value={form.emergencyContactName} />
        <div className="print-two-col">
          <PrintRow label="Phone Number" value={form.emergencyContactPhone} />
          <PrintRow label="Relationship" value={form.emergencyContactRelationship} />
        </div>
      </PrintSection>

      <PrintSection title="Insurance">
        <PrintRow label="Relationship to Primary Insured" value={form.relationshipToInsured} />
        {form.relationshipToInsured !== "self" && (
          <div className="print-two-col">
            <PrintRow label="Primary Insured Name" value={form.primaryInsuredName} />
            <PrintRow label="Primary Insured DOB" value={formatDate(form.primaryInsuredDOB)} />
          </div>
        )}
        <PrintRow label="Insurance Provider" value={form.insuranceProvider} />
        <div className="print-two-col">
          <PrintRow label="Policy Number" value={form.policyNumber} />
          <PrintRow label="Group Number" value={form.groupNumber} />
        </div>
        {form.hasSecondaryInsurance && (
          <>
            <PrintRow label="Secondary Insurance Provider" value={form.secondaryInsuranceProvider} />
            <div className="print-two-col">
              <PrintRow label="Secondary Policy Number" value={form.secondaryPolicyNumber} />
              <PrintRow label="Secondary Group Number" value={form.secondaryGroupNumber} />
            </div>
          </>
        )}
      </PrintSection>

      <PrintSection title="Legal Authorizations & Signature">
        <div className="print-agreement">
          <span className="print-checkbox">{form.agreeToPrivacyNotice ? "☑" : "☐"}</span>
          <span><strong>Notice of Privacy Practices:</strong> I have been offered a copy of this practice's Notice of Privacy Practices.</span>
        </div>
        <div className="print-agreement">
          <span className="print-checkbox">{form.agreeToAssignmentOfBenefits ? "☑" : "☐"}</span>
          <span><strong>Assignment of Benefits:</strong> I authorize direct payment of insurance benefits to this practice and accept financial responsibility for remaining balances.</span>
        </div>
        <div className="print-agreement">
          <span className="print-checkbox">{form.agreeToFinancialResponsibility ? "☑" : "☐"}</span>
          <span><strong>Financial Responsibility:</strong> I acknowledge responsibility for all charges for services rendered.</span>
        </div>
        <div className="print-agreement">
          <span className="print-checkbox">{form.agreeToTerms ? "☑" : "☐"}</span>
          <span><strong>Patient Certification:</strong> I certify that all information provided is accurate and complete.</span>
        </div>
        <div className="print-signature-row">
          <div className="print-signature-line">
            {form.signatureData
              ? <img src={form.signatureData} alt="Patient drawn signature" className="print-signature-img" />
              : <p className="print-signature-name">{form.signatureText}</p>
            }
            <span className="print-label">Electronic Signature</span>
          </div>
          <div className="print-signature-line">
            <p className="print-signature-name print-signature-date">{form.signatureTimestamp || form.signatureDate}</p>
            <span className="print-label">Date &amp; Time Signed</span>
          </div>
        </div>
      </PrintSection>

      <PrintFooter />
    </div>
  );
}
