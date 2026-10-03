
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

function getUserThemeKey() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.id) {
      return `theme_${user.id}`;
    }

    return null;
  } catch {
    return null;
  }
}

function getStoredUserTheme() {
  const themeKey = getUserThemeKey();

  if (!themeKey) {
    return "light";
  }

  return localStorage.getItem(themeKey) || "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getStoredUserTheme);

  useEffect(() => {
    const root = document.documentElement;
    const themeKey = getUserThemeKey();

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (themeKey) {
      localStorage.setItem(themeKey, theme);
    }
  }, [theme]);

  useEffect(() => {
    const handleUserChange = () => {
      setTheme(getStoredUserTheme());
    };

    window.addEventListener("userChanged", handleUserChange);

    return () => {
      window.removeEventListener("userChanged", handleUserChange);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === "light" ? "dark" : "light"
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}