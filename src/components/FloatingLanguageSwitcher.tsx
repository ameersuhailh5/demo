import React from "react";
import { Globe, Check } from "lucide-react";
import { Language } from "../types";

interface FloatingLanguageSwitcherProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  soundEnabled?: boolean;
}

const LANGUAGES: Array<{
  id: Language;
  shortLabel: string;
  nativeName: string;
  fontClass: string;
}> = [
  {
    id: "en",
    shortLabel: "EN",
    nativeName: "English",
    fontClass: "font-creato-display font-bold",
  },
  {
    id: "ml",
    shortLabel: "മല",
    nativeName: "മലയാളം",
    fontClass: "font-gayathri font-bold",
  },
  {
    id: "hi",
    shortLabel: "हिं",
    nativeName: "हिन्दी",
    fontClass: "font-baloo font-normal",
  },
];

export const FloatingLanguageSwitcher: React.FC<FloatingLanguageSwitcherProps> = ({
  currentLanguage,
  onSelectLanguage,
  soundEnabled = true,
}) => {
  const handleLanguageChange = (lang: Language) => {
    if (lang !== currentLanguage && soundEnabled) {
      try {
        const audioCtx = new (
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        )();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(520, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(780, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch {
        // AudioContext not available or blocked
      }
    }
    onSelectLanguage(lang);
  };

  return (
    <div
      id="floating-language-switcher"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center select-none print:hidden drop-shadow-2xl"
    >
      {/* Prominent Floating Interactive Bar */}
      <div className="flex items-center p-2 sm:p-2.5 bg-slate-900/95 backdrop-blur-md text-white rounded-full shadow-2xl border-2 border-slate-700/90 ring-4 ring-black/10 transition-all duration-200 hover:border-[#5BA8A0]">
        {/* Globe icon badge */}
        <div
          title="Select Language / ഭാഷ തിരഞ്ഞെടുക്കുക / भाषा चुनें"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 ml-1 mr-1.5 shadow-inner"
          style={{ color: "#CBE54E" }}
        >
          <Globe className="w-5 h-5" />
        </div>

        {/* 3 Large Touch-Friendly Language Buttons */}
        <div className="flex items-center gap-1.5">
          {LANGUAGES.map((lang) => {
            const isActive = currentLanguage === lang.id;
            return (
              <button
                key={lang.id}
                id={`floating-lang-btn-${lang.id}`}
                type="button"
                onClick={() => handleLanguageChange(lang.id)}
                className={`flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "font-bold shadow-lg scale-105"
                    : "text-slate-200 hover:text-white hover:bg-slate-800/90"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: "#CBE54E",
                        color: "#1e293b",
                        boxShadow: "0 4px 14px rgba(203, 229, 78, 0.4)",
                      }
                    : undefined
                }
                aria-pressed={isActive}
                aria-label={`Switch language to ${lang.nativeName}`}
              >
                <span className={`${lang.fontClass} text-sm sm:text-base leading-none`}>
                  {lang.nativeName}
                </span>
                {isActive && <Check className="w-4 h-4 stroke-[3]" style={{ color: "#1e293b" }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
