import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "foam-site-theme";
const ThemeContext = createContext<{
  theme: Theme;
  chooseTheme: (theme: Theme) => void;
}>({
  theme: "light",
  chooseTheme: () => {},
});

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<Theme | null>(storedTheme);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const theme = preference ?? (systemDark ? "dark" : "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => setSystemDark(system.matches);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null)
        setPreference(storedTheme());
    };
    system.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorage);
    return () => {
      system.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  function chooseTheme(value: Theme) {
    setPreference(value);
    document.documentElement.dataset.theme = value;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // The control still works for this visit if browser storage is unavailable.
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, chooseTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeControl() {
  const { theme, chooseTheme } = useContext(ThemeContext);
  return (
    <div
      className="site-theme-control"
      role="group"
      aria-label="Colour appearance"
    >
      <button
        type="button"
        aria-label="Use light mode"
        title="Light mode"
        aria-pressed={theme === "light"}
        onClick={() => chooseTheme("light")}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Use dark mode"
        title="Dark mode"
        aria-pressed={theme === "dark"}
        onClick={() => chooseTheme("dark")}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.6 13.1A8.7 8.7 0 0 1 10.9 3.4a8.7 8.7 0 1 0 9.7 9.7Z" />
        </svg>
      </button>
    </div>
  );
}
