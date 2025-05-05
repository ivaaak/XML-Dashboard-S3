import { createContext, useState, useEffect } from "react";
import styles from '../App.module.css';

// Define the shape of the context value
interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  themeClass: string; // Add themeClass for CSS modules
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark', // Default theme
  setTheme: () => {},
  toggleTheme: () => {},
  themeClass: styles.darkTheme, // Default theme class
});

const getTheme = () => {
  const theme = localStorage.getItem("theme");
  if (!theme) {
    // Default theme is taken as dark
    localStorage.setItem("theme", "dark");
    return "dark";
  } else {
    return theme;
  }
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(getTheme);
  
  // Map theme name to CSS module class
  const getThemeClass = (themeName: string) => {
    return themeName === "dark" ? styles.darkTheme : styles.lightTheme;
  };

  // Compute the CSS class based on the current theme
  const themeClass = getThemeClass(theme);

  function toggleTheme() {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  useEffect(() => {
    const refreshTheme = () => {
      localStorage.setItem("theme", theme);
      
      // Apply the theme class to document for global styles if needed
      document.body.className = getThemeClass(theme);
    };

    refreshTheme();
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        themeClass, // Provide the CSS module class
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };