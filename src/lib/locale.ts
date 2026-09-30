import { create } from "zustand";
import { STR, type Locale } from "@/lib/i18n";

type State = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocale = create<State>((set) => ({
  locale: "tr",
  setLocale: (locale) => {
    set({ locale });
    try {
      localStorage.setItem("aether-locale", locale);
    } catch {
      /* ignore */
    }
  },
}));

export function hydrateLocale() {
  try {
    const saved = localStorage.getItem("aether-locale");
    if (saved === "tr" || saved === "en") useLocale.getState().setLocale(saved);
  } catch {
    /* ignore */
  }
}

export function useCopy() {
  const locale = useLocale((s) => s.locale);
  return STR[locale];
}
