import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Season = "summer" | "winter";

interface ThemeContextType {
  season: Season;
  setSeason: (s: Season) => void;
}

const ThemeContext = createContext<ThemeContextType>({ season: "summer", setSeason: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [season, setSeason] = useState<Season>(() => {
    return (localStorage.getItem("lotus-season") as Season) || "summer";
  });

  useEffect(() => {
    localStorage.setItem("lotus-season", season);
    const root = document.documentElement;
    root.classList.remove("theme-summer", "theme-winter");
    root.classList.add(`theme-${season}`);
  }, [season]);

  return (
    <ThemeContext.Provider value={{ season, setSeason }}>
      {children}
    </ThemeContext.Provider>
  );
};
