import { useTheme } from "../context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-10 w-10 items-center justify-center rounded-full
        bg-gray-100 text-gray-700
        hover:bg-gray-200
        dark:bg-gray-800 dark:text-yellow-400
        dark:hover:bg-gray-700
        transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <FiMoon className="h-5 w-5" />
      ) : (
        <FiSun className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;