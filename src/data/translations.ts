export type Language = "en" | "ml" | "hi";

export interface TranslationDictionary {
  common: {
    back: string;
    continue: string;
    submit: string;
    cancel: string;
    close: string;
    print: string;
    required: string;
    touchToBegin: string;
    selectLanguage: string;
    changeLanguage: string;
    emergencyWarning: string;
    kioskStation: string;
    staffAssistance: string;
    activeModality: string;
    allopathy: string;
    ayurveda: string;
    allopathyDesc: string;
    ayurvedaDesc: string;
    doctorsOnDuty: string;
    mins: string;
  };
  header: {
    title: string;
    subtitle: string;
    patientKiosk: string;
    doctorPortal: string;
    adminDashboard: string;
    waitingLobby: string;
    ehrVault: string;
    emergency: string;
    chime: string;
    muted: string;
    fontSize: string;
  };
  kioskHome: {
    welcome: string;
    subtitle: string;
    waitingCountSuffix: string;
    avgWait: string;
    walkinTitle: string;
    walkinDesc: string;
    walkinBadge: string;
    queueTitle: string;
    queueDesc: string;
    recordsTitle: string;
    recordsDesc: string;
    hipaaBadge: string;
    selectLanguagePrompt: string;
    english: string;
    malayalam: string;
    hindi: string;
  };
  walkin: {
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    step5Title: string;
    step5Desc: string;
    step6Title: string;
    step6Desc: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    male: string;
    female: string;
    other: string;
    phone: string;
    email: string;
    emergencyContact: string;
    emergencyPhone: string;
    chiefComplaint: string;
    chiefComplaintPlaceholder: string;
    painLevel: string;
    duration: string;
    symptomsTitle: string;
    medicalHistoryTitle: string;
    allergies: string;
    allergiesPlaceholder: string;
    noAllergies: string;
    medications: string;
    medicationsPlaceholder: string;
    conditions: string;
    conditionsPlaceholder: string;
    insuranceTitle: string;
    insuranceProvider: string;
    memberId: string;
    groupNumber: string;
    scanInsurance: string;
    cardScanned: string;
    signatureTitle: string;
    signaturePrompt: string;
    clearSignature: string;
    hipaaConsent: string;
    analyzingTriage: string;
    triageCompleted: string;
    ticketIssued: string;
    assignedDoctor: string;
    department: string;
    room: string;
    estimatedWait: string;
    triageScore: string;
    nursingNotes: string;
    vitalsRequired: string;
  };
  ticketPass: {
    title: string;
    confirmed: string;
    ticketNumber: string;
    patient: string;
    doctor: string;
    room: string;
    dept: string;
    treatmentModality: string;
    keepSafeNotice: string;
    autoClose: string;
    printPass: string;
    done: string;
  };
  queue: {
    title: string;
    subtitle: string;
    nowCalling: string;
    waitingPatients: string;
    inConsultation: string;
    ticket: string;
    room: string;
    doctor: string;
    wait: string;
    priority: string;
  };
  records: {
    title: string;
    subtitle: string;
    selectPatient: string;
    updatePhone: string;
    insuranceDetails: string;
    provider: string;
    policyNumber: string;
    allergies: string;
    scanCard: string;
    saveChanges: string;
    savedSuccess: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    common: {
      back: "Back",
      continue: "Continue",
      submit: "Submit & Complete Registration",
      cancel: "Cancel",
      close: "Close",
      print: "Print Ticket Pass",
      required: "* Required",
      touchToBegin: "Touch to Begin",
      selectLanguage: "Choose Language",
      changeLanguage: "Change Language",
      emergencyWarning: "If you are experiencing chest pain, severe bleeding, or difficulty breathing, notify staff immediately or call 911.",
      kioskStation: "Kiosk Station #04",
      staffAssistance: "Staff Assistance: Reception Desk",
      activeModality: "Care System",
      allopathy: "Allopathy",
      ayurveda: "Ayurveda",
      allopathyDesc: "Conventional Western Medicine & Diagnostics",
      ayurvedaDesc: "Traditional Ayurvedic Medicine & Dosha Care",
      doctorsOnDuty: "Doctors on duty",
      mins: "mins",
    },
    header: {
      title: "MediKiosk",
      subtitle: "Clinic Patient Intake & Registration",
      patientKiosk: "Patient Kiosk",
      doctorPortal: "Doctor Portal",
      adminDashboard: "Admin",
      waitingLobby: "Lobby",
      ehrVault: "EHR",
      emergency: "Emergency: Alert staff or call 911",
      chime: "Chime",
      muted: "Muted",
      fontSize: "A+ Font",
    },
    kioskHome: {
      welcome: "MetroHealth Clinic Registration",
      subtitle: "Welcome to our self-service intake kiosk. Select your preferred language to begin your walk-in registration.",
      waitingCountSuffix: "waiting in lobby",
      avgWait: "Avg. wait",
      walkinTitle: "Walk-In Patient Registration",
      walkinDesc: "Express symptom intake & clinical triage. Choose between Allopathy and Ayurvedic care systems.",
      walkinBadge: "Direct Care Intake",
      queueTitle: "Live Waiting Room Queue",
      queueDesc: "View currently called tickets, active rooms, and estimated wait times.",
      recordsTitle: "Update Records & Insurance",
      recordsDesc: "Scan insurance cards, verify policy coverage, and update contact details.",
      hipaaBadge: "HIPAA Compliant & HL7 FHIR R4 Encrypted",
      selectLanguagePrompt: "Select Language / ഭാഷ തിരഞ്ഞെടുക്കുക / भाषा चुनें",
      english: "English",
      malayalam: "മലയാളം (Malayalam)",
      hindi: "हिन्दी (Hindi)",
    },
    walkin: {
      step1Title: "Patient Demographics",
      step1Desc: "Please enter your personal and contact details for registration.",
      step2Title: "Treatment Modality & Symptoms",
      step2Desc: "Choose your preferred medical system (Ayurveda or Allopathy) and describe your symptoms.",
      step3Title: "Medical History & Allergies",
      step3Desc: "List known allergies, current medications, and existing medical conditions.",
      step4Title: "Insurance & Coverage",
      step4Desc: "Verify health insurance coverage or select self-pay option.",
      step5Title: "Consent & Digital Signature",
      step5Desc: "Please acknowledge outpatient consent terms and provide your signature on screen.",
      step6Title: "Clinical Triage & Ticket",
      step6Desc: "Your registration is complete. Review your room allocation and queue ticket.",
      firstName: "First Name",
      lastName: "Last Name",
      dob: "Date of Birth",
      gender: "Gender",
      male: "Male",
      female: "Female",
      other: "Other",
      phone: "Phone (Queue SMS)",
      email: "Email Address",
      emergencyContact: "Emergency Contact Name",
      emergencyPhone: "Emergency Contact Phone",
      chiefComplaint: "Chief Reason for Visit",
      chiefComplaintPlaceholder: "Describe your symptoms or reason for visit...",
      painLevel: "Current Pain Level (0-10)",
      duration: "Symptom Duration",
      symptomsTitle: "Select Presenting Symptoms",
      medicalHistoryTitle: "Medical Background",
      allergies: "Known Drug / Food Allergies",
      allergiesPlaceholder: "e.g., Penicillin, Sulfa, Peanuts...",
      noAllergies: "No Known Allergies (NKDA)",
      medications: "Current Daily Medications",
      medicationsPlaceholder: "e.g., Lisinopril 10mg, Metformin 500mg...",
      conditions: "Chronic Conditions",
      conditionsPlaceholder: "e.g., Hypertension, Type 2 Diabetes, Asthma...",
      insuranceTitle: "Insurance Verification",
      insuranceProvider: "Insurance Provider",
      memberId: "Member / Policy ID",
      groupNumber: "Group Number",
      scanInsurance: "Simulate Scan Card",
      cardScanned: "Card Scanned & Verified",
      signatureTitle: "Digital Consent Signature",
      signaturePrompt: "Sign inside the box below using your finger or stylus:",
      clearSignature: "Clear Signature",
      hipaaConsent: "I authorize outpatient intake, insurance billing, and triage assessment under HIPAA privacy guidelines.",
      analyzingTriage: "Analyzing clinical intake and generating doctor assignment...",
      triageCompleted: "Triage Evaluation Complete",
      ticketIssued: "Queue Ticket Issued",
      assignedDoctor: "Assigned Physician",
      department: "Department",
      room: "Assigned Room / Bay",
      estimatedWait: "Estimated Wait Time",
      triageScore: "ESI Triage Severity",
      nursingNotes: "Intake & Nursing Notes",
      vitalsRequired: "Baseline Vitals to Check",
    },
    ticketPass: {
      title: "Clinic Queue Ticket",
      confirmed: "Check-In Confirmed",
      ticketNumber: "Ticket Number",
      patient: "Patient",
      doctor: "Assigned Doctor",
      room: "Room / Bay",
      dept: "Department",
      treatmentModality: "Care System",
      keepSafeNotice: "Please take a seat in the waiting lounge. Watch the lobby calling board for your ticket number.",
      autoClose: "Auto closing in",
      printPass: "Print Pass",
      done: "I Have My Ticket",
    },
    queue: {
      title: "Waiting Room Calling Board",
      subtitle: "Watch for your ticket number and proceed to the assigned room when called.",
      nowCalling: "Now Calling",
      waitingPatients: "Patients in Waiting Queue",
      inConsultation: "Currently in Consultation",
      ticket: "Ticket",
      room: "Room",
      doctor: "Doctor",
      wait: "Est. Wait",
      priority: "Triage Priority",
    },
    records: {
      title: "Update Patient Records & Insurance",
      subtitle: "Update phone number, insurance policy, and medical history details.",
      selectPatient: "Select Patient Record",
      updatePhone: "Contact Phone Number",
      insuranceDetails: "Insurance Information",
      provider: "Insurance Provider",
      policyNumber: "Policy / Member Number",
      allergies: "Allergies List (comma-separated)",
      scanCard: "Scan New Card",
      saveChanges: "Save Updated Record",
      savedSuccess: "Patient record updated successfully!",
    },
  },
  ml: {
    common: {
      back: "പിന്നിലേക്ക്",
      continue: "തുടരുക",
      submit: "രജിസ്ട്രേഷൻ പൂർത്തിയാക്കുക",
      cancel: "റദ്ദാക്കുക",
      close: "അടയ്ക്കുക",
      print: "ടിക്കറ്റ് പ്രിന്റ് ചെയ്യുക",
      required: "* നിർബന്ധം",
      touchToBegin: "തുടങ്ങാൻ ഇവിടെ സ്പർശിക്കുക",
      selectLanguage: "ഭാഷ തിരഞ്ഞെടുക്കുക",
      changeLanguage: "ഭാഷ മാറ്റുക",
      emergencyWarning: "നെഞ്ചുവേദനയോ കഠിനമായ രക്തസ്രാവമോ ശ്വാസതടസ്സമോ അനുഭവപ്പെടുന്നുണ്ടെങ്കിൽ ഉടൻ സ്റ്റാഫിനെ അറിയിക്കുക അല്ലെങ്കിൽ 911 വിളിക്കുക.",
      kioskStation: "കിയോസ്ക് സ്റ്റേഷൻ #04",
      staffAssistance: "സ്റ്റാഫ് സഹായം: റിസപ്ഷൻ ഡെസ്ക്",
      activeModality: "ചികിത്സാ വിഭാഗം",
      allopathy: "അലോപ്പതി (ആധുനിക വൈദ്യം)",
      ayurveda: "ആയുർവേദം (പരമ്പരാഗത ശാഖ)",
      allopathyDesc: "ആധുനിക പാശ്ചാത്യ ചികിത്സയും ലാബ് പരിശോധനകളും",
      ayurvedaDesc: "പരമ്പരാഗത ആയുർവേദ ചികിത്സയും ത്രിദോഷ പരിശോധനയും",
      doctorsOnDuty: "ഡ്യൂട്ടിയിലുള്ള ഡോക്ടർമാർ",
      mins: "മിനിറ്റ്",
    },
    header: {
      title: "മെഡികിയോസ്ക്",
      subtitle: "ക്ലിനിക്ക് പേഷ്യന്റ് രജിസ്ട്രേഷൻ",
      patientKiosk: "പേഷ്യന്റ് കിയോസ്ക്",
      doctorPortal: "ഡോക്ടർ പോർട്ടൽ",
      adminDashboard: "അഡ്മിൻ",
      waitingLobby: "ലോബി",
      ehrVault: "ഇ.എച്ച്.ആർ രേഖകൾ",
      emergency: "അടിയന്തിരം: ജീവനക്കാരെ അറിയിക്കുക",
      chime: "ശബ്ദം",
      muted: "നിശബ്ദം",
      fontSize: "വലിയ അക്ഷരം",
    },
    kioskHome: {
      welcome: "മെട്രോഹെൽത്ത് ക്ലിനിക്ക് രജിസ്ട്രേഷൻ",
      subtitle: "ഞങ്ങളുടെ സ്വയംസേവന കിയോസ്കിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ സന്ദർശനം ആരംഭിക്കാൻ ഭാഷ തിരഞ്ഞെടുക്കുക.",
      waitingCountSuffix: "പേർ കാത്തിരിപ്പിലാണ്",
      avgWait: "ശരാശരി കാത്തിരിപ്പ്",
      walkinTitle: "നേരിട്ടുള്ള രോഗി രജിസ്ട്രേഷൻ",
      walkinDesc: "ലക്ഷണങ്ങൾ രേഖപ്പെടുത്തി വേഗത്തിലുള്ള ട്രിയാജ് പരിശോധന. അലോപ്പതി അല്ലെങ്കിൽ ആയുർവേദ ചികിത്സ തിരഞ്ഞെടുക്കുക.",
      walkinBadge: "ഡയറക്ട് കെയർ ഇൻടേക്ക്",
      queueTitle: "ലൈവ് വെയ്റ്റിംഗ് റൂം ക്യൂ",
      queueDesc: "വിളിച്ച ടിക്കറ്റുകൾ, റൂമുകൾ, കാത്തിരിപ്പ് സമയം എന്നിവ തത്സമയം കാണുക.",
      recordsTitle: "രേഖകളും ഇൻഷുറൻസും പുതുക്കുക",
      recordsDesc: "ഇൻഷുറൻസ് കാർഡ് സ്കാൻ ചെയ്യുക, ഫോൺ നമ്പറും വിലാസവും പുതുക്കുക.",
      hipaaBadge: "HIPAA സുരക്ഷിതവും HL7 FHIR R4 എൻക്രിപ്റ്റ് ചെയ്തതും",
      selectLanguagePrompt: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക (Select Language)",
      english: "English (ഇംഗ്ലീഷ്)",
      malayalam: "മലയാളം",
      hindi: "हिन्दी (ഹിന്ദി)",
    },
    walkin: {
      step1Title: "രോഗിയുടെ വിവരങ്ങൾ",
      step1Desc: "രജിസ്ട്രേഷനായി നിങ്ങളുടെ സ്വകാര്യ വിവരങ്ങളും ഫോൺ നമ്പറും നൽകുക.",
      step2Title: "ചികിത്സാ വിഭാഗവും ലക്ഷണങ്ങളും",
      step2Desc: "നിങ്ങൾക്ക് ആവശ്യമായ ചികിത്സാ ശാഖയും (അലോപ്പതി / ആയുർവേദം) രോഗ ലക്ഷണങ്ങളും തിരഞ്ഞെടുക്കുക.",
      step3Title: "ചികിത്സാ ചരിത്രവും അലർജികളും",
      step3Desc: "അലർജികൾ, നിലവിൽ കഴിക്കുന്ന മരുന്നുകൾ, മറ്റ് രോഗങ്ങൾ എന്നിവ രേഖപ്പെടുത്തുക.",
      step4Title: "ഇൻഷുറൻസ് വിവരങ്ങൾ",
      step4Desc: "ഹെൽത്ത് ഇൻഷുറൻസ് വിവരങ്ങൾ പരിശോധിക്കുക അല്ലെങ്കിൽ നേരിട്ട് പണമടയ്ക്കുക.",
      step5Title: "സമ്മതപത്രവും ഒപ്പും",
      step5Desc: "ചികിത്സാ നിബന്ധനകൾ വായിച്ചു സ്ക്രീനിൽ വിരൽ കൊണ്ട് ഒപ്പിടുക.",
      step6Title: "ട്രിയാജ് ഫലവും ടിക്കറ്റും",
      step6Desc: "രജിസ്ട്രേഷൻ പൂർത്തിയായി. ഡോക്ടറുടെയും മുറിയുടെയും വിവരങ്ങൾ പരിശോധിക്കുക.",
      firstName: "ആദ്യ പേര് (First Name)",
      lastName: "അവസാന പേര് (Last Name)",
      dob: "ജനനത്തീയതി (Date of Birth)",
      gender: "ലിംഗം",
      male: "പുരുഷൻ",
      female: "സ്ത്രീ",
      other: "മറ്റുള്ളവ",
      phone: "ഫോൺ നമ്പർ (ക്യൂ SMS ലഭിക്കാൻ)",
      email: "ഇമെയിൽ വിലാസം",
      emergencyContact: "അടിയന്തിര സമ്പർക്ക വ്യക്തിയുടെ പേര്",
      emergencyPhone: "അടിയന്തിര സമ്പർക്ക ഫോൺ",
      chiefComplaint: "പ്രധാന രോഗലക്ഷണം / കാരണം",
      chiefComplaintPlaceholder: "നിങ്ങളുടെ അസ്വസ്ഥത അല്ലെങ്കിൽ രോഗവിവരം ഇവിടെ എഴുതുക...",
      painLevel: "വേദനയുടെ തീവ്രത (0 മുതൽ 10 വരെ)",
      duration: "ലക്ഷണങ്ങൾ എത്ര ദിവസമായി ഉണ്ട്?",
      symptomsTitle: "അനുഭവപ്പെടുന്ന ലക്ഷണങ്ങൾ തിരഞ്ഞെടുക്കുക",
      medicalHistoryTitle: "ആരോഗ്യ പശ്ചാത്തലം",
      allergies: "മരുന്ന് / ഭക്ഷണ അലർജികൾ",
      allergiesPlaceholder: "ഉദാഹരണത്തിന്: പെൻസിലിൻ, സൾഫ...",
      noAllergies: "അലർജികൾ ഒന്നുമില്ല (NKDA)",
      medications: "നിലവിൽ സ്ഥിരമായി കഴിക്കുന്ന മരുന്നുകൾ",
      medicationsPlaceholder: "ഉദാഹരണത്തിന്: മെറ്റ്ഫോർമിൻ, ലിസിനോപ്രിൽ...",
      conditions: "മറ്റ് രോഗങ്ങൾ / ശാരീരിക അവസ്ഥകൾ",
      conditionsPlaceholder: "ഉദാഹരണത്തിന്: പ്രമേഹം, രക്തസമ്മർദ്ദം, ആസ്ത്മ...",
      insuranceTitle: "ഇൻഷുറൻസ് പരിശോധന",
      insuranceProvider: "ഇൻഷുറൻസ് കമ്പനി",
      memberId: "മെമ്പർ / പോളിസി ഐഡി",
      groupNumber: "ഗ്രൂപ്പ് നമ്പർ",
      scanInsurance: "കാർഡ് സ്കാൻ ചെയ്യുക",
      cardScanned: "കാർഡ് സ്കാൻ ചെയ്തു പരിശോധിച്ചു",
      signatureTitle: "ഡിജിറ്റൽ ഒപ്പ്",
      signaturePrompt: "താഴെ കാണുന്ന ബോക്സിൽ വിരൽ കൊണ്ട് ഒപ്പിടുക:",
      clearSignature: "ഒപ്പ് മായ്ക്കുക",
      hipaaConsent: "ഞാൻ ക്ലിനിക്ക് ചട്ടങ്ങളും ഇൻഷുറൻസ് ബില്ലിംഗും ഔട്ട്പേഷ്യന്റ് ട്രിയാജ് പ്രക്രിയയും അംഗീകരിക്കുന്നു.",
      analyzingTriage: "വിവരങ്ങൾ വിലയിരുത്തി ഡോക്ടറെ നിശ്ചയിക്കുന്നു...",
      triageCompleted: "ട്രിയാജ് പരിശോധന പൂർത്തിയായി",
      ticketIssued: "ക്യൂ ടിക്കറ്റ് ലഭിച്ചു",
      assignedDoctor: "ചുമതലപ്പെടുത്തിയ ഡോക്ടർ",
      department: "വിഭാഗം",
      room: "മുറി നമ്പർ / ബേ",
      estimatedWait: "പ്രതീക്ഷിക്കുന്ന കാത്തിരിപ്പ് സമയം",
      triageScore: "ട്രിയാജ് സ്കോർ",
      nursingNotes: "നഴ്സിംഗ് വിവരങ്ങൾ",
      vitalsRequired: "പരിശോധിക്കേണ്ട അടിസ്ഥാന ജീവൻ സൂചികകൾ",
    },
    ticketPass: {
      title: "ക്ലിനിക്ക് ക്യൂ ടിക്കറ്റ്",
      confirmed: "രജിസ്ട്രേഷൻ പൂർത്തിയായി",
      ticketNumber: "ടിക്കറ്റ് നമ്പർ",
      patient: "രോഗി",
      doctor: "ഡോക്ടർ",
      room: "റൂം / ബേ",
      dept: "വിഭാഗം",
      treatmentModality: "ചികിത്സാ ശാഖ",
      keepSafeNotice: "ദയവായി വെയ്റ്റിംഗ് ഹാളിൽ ഇരിക്കുക. നിങ്ങളുടെ ടിക്കറ്റ് നമ്പർ സ്ക്രീനിൽ തെളിയുമ്പോൾ നിശ്ചയിച്ച മുറിയിലേക്ക് പോവുക.",
      autoClose: "ഓട്ടോ ക്ലോസ് ആവുന്നത്",
      printPass: "ടിക്കറ്റ് പ്രിന്റ് ചെയ്യുക",
      done: "ടിക്കറ്റ് ലഭിച്ചു / പൂർത്തിയായി",
    },
    queue: {
      title: "വെയ്റ്റിംഗ് റൂം കോളിംഗ് ബോർഡ്",
      subtitle: "നിങ്ങളുടെ ടിക്കറ്റ് നമ്പറും മുറിയും ശ്രദ്ധിക്കുക.",
      nowCalling: "ഇപ്പോൾ വിളിക്കുന്ന ടിക്കറ്റുകൾ",
      waitingPatients: "കാത്തിരിക്കുന്ന രോഗികൾ",
      inConsultation: "ഡോക്ടറെ കാണുന്നവർ",
      ticket: "ടിക്കറ്റ്",
      room: "റൂം",
      doctor: "ഡോക്ടർ",
      wait: "കാത്തിരിപ്പ് സമയം",
      priority: "മുൻഗണന",
    },
    records: {
      title: "രോഗിയുടെ വിവരങ്ങളും ഇൻഷുറൻസും പുതുക്കുക",
      subtitle: "ഫോൺ നമ്പർ, ഇൻഷുറൻസ് പോളിസി വിവരങ്ങൾ എന്നിവ തിരുത്തുക.",
      selectPatient: "രോഗിയെ തിരഞ്ഞെടുക്കുക",
      updatePhone: "ഫോൺ നമ്പർ",
      insuranceDetails: "ഇൻഷുറൻസ് വിവരങ്ങൾ",
      provider: "ഇൻഷുറൻസ് കമ്പനി",
      policyNumber: "പോളിസി നമ്പർ",
      allergies: "അലർജികൾ",
      scanCard: "പുതിയ കാർഡ് സ്കാൻ ചെയ്യുക",
      saveChanges: "വിവരങ്ങൾ സേവ് ചെയ്യുക",
      savedSuccess: "വിവരങ്ങൾ വിജയകരമായി സേവ് ചെയ്തു!",
    },
  },
  hi: {
    common: {
      back: "पीछे जाएं",
      continue: "आगे बढ़ें",
      submit: "पंजीकरण पूरा करें",
      cancel: "रद्द करें",
      close: "बंद करें",
      print: "पर्ची प्रिंट करें",
      required: "* आवश्यक",
      touchToBegin: "शुरू करने के लिए स्पर्श करें",
      selectLanguage: "भाषा चुनें",
      changeLanguage: "भाषा बदलें",
      emergencyWarning: "यदि आपको सीने में दर्द, अत्यधिक रक्तस्राव या सांस लेने में तकलीफ हो रही है, तो तुरंत कर्मचारियों को सूचित करें या आपातकालीन सेवा को कॉल करें।",
      kioskStation: "कियोस्क स्टेशन #04",
      staffAssistance: "स्टाफ सहायता: रिसेप्शन डेस्क",
      activeModality: "चिकित्सा पद्धति",
      allopathy: "एलोपैथी (आधुनिक चिकित्सा)",
      ayurveda: "आयुर्वेद (पारंपरिक चिकित्सा)",
      allopathyDesc: "पारंपरिक पश्चिमी चिकित्सा और डायग्नोस्टिक्स",
      ayurvedaDesc: "पारंपरिक आयुर्वेदिक चिकित्सा और दोष संतुलन",
      doctorsOnDuty: "ड्यूटी पर मौजूद डॉक्टर",
      mins: "मिनट",
    },
    header: {
      title: "मेडीकियोस्क",
      subtitle: "क्लिनिक मरीज इनटेक एवं पंजीकरण",
      patientKiosk: "मरीज कियोस्क",
      doctorPortal: "डॉक्टर पोर्टल",
      adminDashboard: "एडमिन",
      waitingLobby: "लॉबी",
      ehrVault: "ईएचआर रिकॉर्ड्स",
      emergency: "आपातकाल: तुरंत स्टाफ को बताएं",
      chime: "ध्वनि",
      muted: "म्यूट",
      fontSize: "बड़ा फॉन्ट",
    },
    kioskHome: {
      welcome: "मेट्रोहेल्थ क्लिनिक पंजीकरण",
      subtitle: "हमारे सेल्फ़-सर्विस कियोस्क में आपका स्वागत है। अपना पंजीकरण शुरू करने के लिए कृपया अपनी पसंदीदा भाषा चुनें।",
      waitingCountSuffix: "लॉबी में प्रतीक्षारत हैं",
      avgWait: "औसत प्रतीक्षा",
      walkinTitle: "प्रत्यक्ष मरीज पंजीकरण (Walk-In)",
      walkinDesc: "लक्षण दर्ज करें और त्वरित क्लिनिकल ट्राइएज कराएं। एलोपैथी या आयुर्वेद चिकित्सा पद्धति चुनें।",
      walkinBadge: "त्वरित पंजीकरण",
      queueTitle: "लाइव प्रतीक्षालय कतार",
      queueDesc: "बुलाए गए टोकन नंबर, आवंटित कमरे और प्रतीक्षा समय देखें।",
      recordsTitle: "रिकॉर्ड और बीमा अपडेट करें",
      recordsDesc: "बीमा कार्ड स्कैन करें, कवरेज सत्यापित करें और फोन नंबर अपडेट करें।",
      hipaaBadge: "HIPAA अनुरूप और HL7 FHIR R4 एन्क्रिप्टेड",
      selectLanguagePrompt: "अपनी भाषा चुनें (Select Language)",
      english: "English (अंग्रेज़ी)",
      malayalam: "മലയാളം (मलयालम)",
      hindi: "हिन्दी",
    },
    walkin: {
      step1Title: "मरीज का विवरण",
      step1Desc: "पंजीकरण के लिए कृपया अपनी व्यक्तिगत जानकारी और फोन नंबर दर्ज करें।",
      step2Title: "उपचार पद्धति और लक्षण",
      step2Desc: "अपनी पसंदीदा चिकित्सा प्रणाली (आयुर्वेद या एलोपैथी) चुनें और अपने लक्षण बताएं।",
      step3Title: "चिकित्सा इतिहास और एलर्जी",
      step3Desc: "ज्ञात एलर्जी, वर्तमान दवाएं और पुरानी बीमारियों की सूची दें।",
      step4Title: "बीमा और कवरेज",
      step4Desc: "स्वास्थ्य बीमा कवरेज सत्यापित करें या स्वयं-भुगतान विकल्प चुनें।",
      step5Title: "सहमति और डिजिटल हस्ताक्षर",
      step5Desc: "कृपया नियमों को स्वीकार करें और स्क्रीन पर अपना डिजिटल हस्ताक्षर करें।",
      step6Title: "क्लिनिकल ट्राइएज और पर्ची",
      step6Desc: "आपका पंजीकरण पूरा हो गया है। कृपया अपने आवंटित डॉक्टर और कमरे की जांच करें।",
      firstName: "पहला नाम (First Name)",
      lastName: "उपनाम (Last Name)",
      dob: "जन्म तिथि (Date of Birth)",
      gender: "लिंग",
      male: "पुरुष",
      female: "महिला",
      other: "अन्य",
      phone: "फोन नंबर (SMS के लिए)",
      email: "ईमेल पता",
      emergencyContact: "आपातकालीन संपर्क का नाम",
      emergencyPhone: "आपातकालीन संपर्क फोन",
      chiefComplaint: "क्लिनिक आने का मुख्य कारण",
      chiefComplaintPlaceholder: "अपने लक्षणों या परेशानी का विवरण दें...",
      painLevel: "दर्द का स्तर (0 से 10 तक)",
      duration: "लक्षणों की अवधि",
      symptomsTitle: "मौजूदा लक्षण चुनें",
      medicalHistoryTitle: "स्वास्थ्य इतिहास",
      allergies: "दवा या भोजन की एलर्जी",
      allergiesPlaceholder: "उदा: पेनिसिलिन, सल्फा...",
      noAllergies: "कोई ज्ञात एलर्जी नहीं (NKDA)",
      medications: "वर्तमान में ली जाने वाली दवाएं",
      medicationsPlaceholder: "उदा: मेटफॉर्मिन, लिसिनोप्रिल...",
      conditions: "दीर्घकालिक बीमारियां",
      conditionsPlaceholder: "उदा: मधुमेह, उच्च रक्तचाप, अस्थमा...",
      insuranceTitle: "बीमा सत्यापन",
      insuranceProvider: "बीमा कंपनी",
      memberId: "सदस्य / पॉलिसी नंबर",
      groupNumber: "ग्रुप नंबर",
      scanInsurance: "बीमा कार्ड स्कैन करें",
      cardScanned: "कार्ड स्कैन और सत्यापित हुआ",
      signatureTitle: "डिजिटल हस्ताक्षर",
      signaturePrompt: "नीचे दिए गए बॉक्स में अपनी उंगली से हस्ताक्षर करें:",
      clearSignature: "हस्ताक्षर हटाएं",
      hipaaConsent: "मैं ओपीडी पंजीकरण, बीमा बिलिंग और ट्राइएज मूल्यांकन के नियमों से सहमत हूँ।",
      analyzingTriage: "क्लिनिकल जानकारी का विश्लेषण और डॉक्टर का आवंटन किया जा रहा है...",
      triageCompleted: "ट्राइएज मूल्यांकन पूर्ण",
      ticketIssued: "कतार पर्ची जारी की गई",
      assignedDoctor: "आवंटित डॉक्टर",
      department: "विभाग",
      room: "कमरा नंबर / बे",
      estimatedWait: "अनुमानित प्रतीक्षा समय",
      triageScore: "ट्राइएज स्कोर",
      nursingNotes: "नर्सिंग और क्लिनिकल नोट्स",
      vitalsRequired: "जांचने योग्य प्राथमिक संकेत",
    },
    ticketPass: {
      title: "क्लिनिक कतार पर्ची",
      confirmed: "पंजीकरण सत्यापित",
      ticketNumber: "टोकन नंबर",
      patient: "मरीज का नाम",
      doctor: "डॉक्टर",
      room: "कमरा / बे",
      dept: "विभाग",
      treatmentModality: "चिकित्सा पद्धति",
      keepSafeNotice: "कृपया प्रतीक्षा लॉबी में बैठें। स्क्रीन पर अपना टोकन नंबर आने पर आवंटित कमरे में जाएं।",
      autoClose: "ऑटो बंद होने में समय",
      printPass: "पर्ची प्रिंट करें",
      done: "पर्ची मिल गई / पूर्ण",
    },
    queue: {
      title: "प्रतीक्षालय कॉलिंग बोर्ड",
      subtitle: "अपने टोकन नंबर पर ध्यान दें और बुलाए जाने पर संबंधित कमरे में जाएं।",
      nowCalling: "वर्तमान में बुलाए गए टोकन",
      waitingPatients: "प्रतीक्षा कर रहे मरीज",
      inConsultation: "परामर्श कक्ष में उपस्थित",
      ticket: "टोकन",
      room: "कमरा",
      doctor: "डॉक्टर",
      wait: "प्रतीक्षा समय",
      priority: "प्राथमिकता",
    },
    records: {
      title: "मरीज रिकॉर्ड और बीमा अपडेट",
      subtitle: "फोन नंबर, बीमा विवरण और मेडिकल इतिहास को अपडेट करें।",
      selectPatient: "मरीज चुनें",
      updatePhone: "फोन नंबर",
      insuranceDetails: "बीमा विवरण",
      provider: "बीमा प्रदाता",
      policyNumber: "पॉलिसी नंबर",
      allergies: "एलर्जी विवरण",
      scanCard: "नया कार्ड स्कैन करें",
      saveChanges: "परिवर्तन सहेजें",
      savedSuccess: "मरीज का रिकॉर्ड सफलतापूर्वक अपडेट हुआ!",
    },
  },
};

export interface SymptomItem {
  id: string;
  category: string;
  redFlag?: boolean;
  translations: Record<Language, string>;
}

export const CLINIC_SYMPTOMS: SymptomItem[] = [
  {
    id: "fever",
    category: "General",
    translations: {
      en: "Fever / Chills",
      ml: "പനി / വിറയൽ",
      hi: "बुखार / ठंड लगना",
    },
  },
  {
    id: "cough",
    category: "Respiratory",
    translations: {
      en: "Persistent Cough",
      ml: "തുടർച്ചയായ ചുമ",
      hi: "लगातार खांसी",
    },
  },
  {
    id: "sore_throat",
    category: "ENT",
    translations: {
      en: "Sore Throat",
      ml: "തൊണ്ടവേദന",
      hi: "गले में खराश",
    },
  },
  {
    id: "headache",
    category: "Neurological",
    translations: {
      en: "Severe Headache / Migraine",
      ml: "കഠിനമായ തലവേദന / മൈഗ്രെയ്ൻ",
      hi: "गंभीर सिरदर्द / माइग्रेन",
    },
  },
  {
    id: "chest_pain",
    category: "Cardiovascular",
    redFlag: true,
    translations: {
      en: "Chest Discomfort / Pressure",
      ml: "നെഞ്ചുവേദന / ഭാരം",
      hi: "सीने में दर्द / भारीपन",
    },
  },
  {
    id: "shortness_breath",
    category: "Respiratory",
    redFlag: true,
    translations: {
      en: "Shortness of Breath",
      ml: "ശ്വാസംമുട്ടൽ",
      hi: "सांस लेने में तकलीफ",
    },
  },
  {
    id: "stomach_pain",
    category: "Gastrointestinal",
    translations: {
      en: "Acute Abdominal Pain",
      ml: "കഠിനമായ വയറുവേദന",
      hi: "पेट में तेज दर्द",
    },
  },
  {
    id: "nausea",
    category: "Gastrointestinal",
    translations: {
      en: "Nausea or Vomiting",
      ml: "ഛർദ്ദി അല്ലെങ്കിൽ ഓക്കാനം",
      hi: "मतली या उल्टी",
    },
  },
  {
    id: "sprain_joint",
    category: "Musculoskeletal",
    translations: {
      en: "Joint Pain or Sprain",
      ml: "സന്ധി വേദന / ഉളുക്ക്",
      hi: "जोड़ों का दर्द या मोच",
    },
  },
  {
    id: "rash_skin",
    category: "Dermatology",
    translations: {
      en: "Sudden Skin Rash / Hives",
      ml: "ത്വക്ക് ചൊറിച്ചിൽ / തിണർപ്പ്",
      hi: "त्वचा पर लाल चकत्ते / खुजली",
    },
  },
  {
    id: "ear_pain",
    category: "ENT",
    translations: {
      en: "Ear Pain or Infection",
      ml: "ചെവിവേദന / അണുബാധ",
      hi: "कान का दर्द या संक्रमण",
    },
  },
  {
    id: "urinary",
    category: "Urology",
    translations: {
      en: "Painful or Frequent Urination",
      ml: "മൂത്രമൊഴിക്കുമ്പോൾ വേദന / ഇടയ്ക്കിടെയുള്ള മൂത്രമൊഴിക്കൽ",
      hi: "पेशाब में दर्द या बार-बार पेशाब आना",
    },
  },
  {
    id: "dizziness",
    category: "Neurological",
    translations: {
      en: "Dizziness or Lightheadedness",
      ml: "തലകറക്കം / ക്ഷീണം",
      hi: "चक्कर आना / कमजोरी",
    },
  },
  {
    id: "wound_cut",
    category: "Injury",
    translations: {
      en: "Laceration / Cut / Bleeding",
      ml: "മുറിവ് / രക്തസ്രാവം",
      hi: "घाव / कट / रक्तस्राव",
    },
  },
];

export const DURATION_OPTIONS: Record<Language, Array<{ id: string; label: string }>> = {
  en: [
    { id: "24h", label: "Past 24 hours" },
    { id: "2-3d", label: "2 - 3 Days" },
    { id: "1w+", label: "More than a week" },
    { id: "sudden", label: "Sudden onset (Past 2 hours)" },
  ],
  ml: [
    { id: "24h", label: "കഴിഞ്ഞ 24 മണിക്കൂർ" },
    { id: "2-3d", label: "2 - 3 ദിവസങ്ങൾ" },
    { id: "1w+", label: "ഒരാഴ്ചയിലധികം" },
    { id: "sudden", label: "പെട്ടെന്ന് തുടങ്ങിയത് (കഴിഞ്ഞ 2 മണിക്കൂർ)" },
  ],
  hi: [
    { id: "24h", label: "पिछले 24 घंटे" },
    { id: "2-3d", label: "2 - 3 दिन" },
    { id: "1w+", label: "एक सप्ताह से अधिक" },
    { id: "sudden", label: "अचानक शुरू हुआ (पिछले 2 घंटे)" },
  ],
};
