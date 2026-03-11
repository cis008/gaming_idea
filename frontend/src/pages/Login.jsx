import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PixelButton from "../components/PixelButton";
import PixelCard from "../components/PixelCard";
import { login, signup } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get("reason") === "session_expired";
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = isSignup
        ? await signup({ username: form.username, email: form.email, password: form.password })
        : await login({ username: form.username, password: form.password });

      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("username", response.data.username);
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed.");
    }
  };

  return (
    <main className="login-bg">
      <div className="relative z-10 mx-auto flex max-w-md flex-col px-4 py-14">
        <h1 className="retro-title text-3xl font-bold">{isSignup ? "Create Account" : "Welcome Back"}</h1>
        <p className="mt-2 text-slate-300">Sign in to continue your gamified AI learning journey.</p>

        {sessionExpired && (
          <div className="mt-4 rounded-lg border-2 border-amber-400 bg-amber-900/60 px-4 py-3 text-sm text-amber-200">
            ⚠ Your session expired. Please log in again.
          </div>
        )}

        <PixelCard className="mt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="pixel-input w-full"
            placeholder="Username"
            name="username"
            value={form.username}
            onChange={onChange}
            required
          />
          {isSignup && (
            <input
              className="pixel-input w-full"
              placeholder="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
            />
          )}
          <input
            className="pixel-input w-full"
            placeholder="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            required
          />
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <PixelButton className="w-full">{isSignup ? "Sign Up" : "Login"}</PixelButton>
        </form>
        </PixelCard>

        <button
          onClick={() => setIsSignup((prev) => !prev)}
          className="mt-4 text-left text-sm text-cyan-300 hover:text-cyan-200"
        >
          {isSignup ? "Already have an account? Login" : "Need an account? Sign up"}
        </button>
      </div>
    </main>
  );
}

export default Login;
