import React from "react";
import { Language } from "../types";
import { Globe2, Check, Sparkles } from "lucide-react";
import { playButtonTap } from "../utils/audio";

interface LanguageSelectionModalProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  currentLanguage,
  onSelectLanguage,
  onClose,
  isOpen,
}) => {
  if (!isOpen) return null;

  const languages: Array<{
    id: Language;
    name: string;
    nativeName: string;
    description: string;
    welcomeSnippet: string;
    badge: string;
  }> = [
    {
      id: "en",
      name: "English",
      nativeName: "English",
      description: "Standard English patient intake & registration",
      welcomeSnippet: "Welcome to MetroHealth Clinic",
      badge: "Primary",
    },
    {
      id: "ml",
      name: "Malayalam",
      nativeName: "മലയാളം",
      description: "മലയാളത്തിലുള്ള രോഗി രജിസ്ട്രേഷനും വിവരങ്ങളും",
      welcomeSnippet: "മെട്രോഹെൽത്ത് ക്ലിനിക്കിലേക്ക് സ്വാഗതം",
      badge: "കേരളം / NRI",
    },
    {
      id: "hi",
      name: "Hindi",
      nativeName: "हिन्दी",
      description: "हिन्दी भाषा में मरीज पंजीकरण और सहायता",
      welcomeSnippet: "मेट्रोहेल्थ क्लिनिक में आपका स्वागत है",
      badge: "राष्ट्रीय भाषा",
    },
  ];

  const handleSelect = (lang: Language) => {
    playButtonTap();
    onSelectLanguage(lang);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Modal Top Header */}
        <div
          className="p-6 text-white text-center relative"
          style={{
            background: "linear-gradient(135deg, #4f9696 0%, #5AA7A7 50%, #6C8CBF 100%)",
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Globe2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Select Your Language</h2>
          <p className="text-xs text-teal-100 mt-1 font-medium">
            ഭാഷ തിരഞ്ഞെടുക്കുക • अपनी पसंदीदा भाषा चुनें
          </p>
        </div>

        {/* Language Options List */}
        <div className="p-6 space-y-3.5 bg-slate-50">
          {languages.map((lang) => {
            const isSelected = currentLanguage === lang.id;
            return (
              <button
                key={lang.id}
                id={`btn-lang-select-${lang.id}`}
                onClick={() => handleSelect(lang.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer group transform hover:-translate-y-0.5 active:translate-y-0 ${
                  isSelected
                    ? "bg-white border-teal-600 shadow-md ring-2 ring-teal-500/20"
                    : "bg-white border-slate-200 hover:border-teal-300 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base transition-colors ${
                      isSelected
                        ? "text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 group-hover:bg-teal-50 group-hover:text-teal-700"
                    }`}
                    style={{
                      backgroundColor: isSelected ? "#5AA7A7" : undefined,
                    }}
                  >
                    {lang.id.toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-900 tracking-tight">
                        {lang.nativeName}
                      </span>
                      {lang.nativeName !== lang.name && (
                        <span className="text-xs text-slate-500 font-semibold">
                          ({lang.name})
                        </span>
                      )}
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isSelected ? "rgba(90, 167, 167, 0.15)" : "#f1f5f9",
                          color: isSelected ? "#5AA7A7" : "#64748b",
                        }}
                      >
                        {lang.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{lang.description}</p>
                    <p className="text-[11px] text-teal-700 font-medium italic mt-1">
                      "{lang.welcomeSnippet}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center pl-3">
                  {isSelected ? (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: "#5AA7A7" }}
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-slate-300 group-hover:border-teal-500 flex items-center justify-center transition-colors">
                      <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-teal-400 transition-colors"></div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-white border-t border-slate-200 text-center flex items-center justify-between text-xs text-slate-500 px-6">
          <span>You can switch language anytime from the top bar</span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 underline"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
