import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import axios from "../api/axios";
import { Moon, Sun, Loader2, Mail, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("/login", { email, password });
      const { access_token, user } = response.data;
      login(user, access_token);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4
      bg-linear-to-br from-blue-100 via-white to-purple-100
      dark:from-gray-900 dark:via-gray-950 dark:to-gray-900"
    >
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full
        bg-white/70 dark:bg-gray-800/70 backdrop-blur
        shadow-lg hover:scale-110 transition"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Card */}
      <div
        className="
        w-full max-w-md
        backdrop-blur-xl
        bg-white/70 dark:bg-gray-800/70
        border border-white/30 dark:border-gray-700
        shadow-2xl
        rounded-3xl
        p-10
        transition
      "
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="
            mx-auto
            w-25 h-25
            rounded-full
            overflow-hidden
            shadow-lg
            ring-4 ring-blue-500/30
          "
          >
            <img src="logo.jpg" alt="logo" />
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-wide text-gray-900 dark:text-white">
            DEMANDHAT <span className="text-red-500">OFFICE</span>
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage Your Business Efficiently
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-6 text-sm text-center
          bg-red-100 dark:bg-red-900/40
          border border-red-300 dark:border-red-800
          text-red-600 dark:text-red-400
          p-3 rounded-lg"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email Address"
              className="
              w-full pl-10 pr-4 py-3
              rounded-lg
              bg-gray-100 dark:bg-gray-700
              border border-gray-300 dark:border-gray-600
              focus:ring-2 focus:ring-blue-500
              outline-none
              transition
              "
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="
              w-full pl-10 pr-4 py-3
              rounded-lg
              bg-gray-100 dark:bg-gray-700
              border border-gray-300 dark:border-gray-600
              focus:ring-2 focus:ring-blue-500
              outline-none
              transition
              "
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="
            w-full
            flex items-center justify-center
            py-3
            rounded-lg
            text-white
            font-semibold
            bg-linear-to-r
            from-blue-600
            to-purple-600
            hover:from-blue-700
            hover:to-purple-700
            transition
            shadow-lg
            hover:shadow-xl
            hover:scale-[1.02]
            disabled:opacity-70
            "
          >
            {isLoading ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
