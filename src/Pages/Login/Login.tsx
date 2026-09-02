import { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { Link, useLocation, useNavigate } from "react-router";
import { useLogin } from "../../hooks/mutations/useLogin";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import logo from "../../assets/logo.png";
import { setAccessToken } from "@/lib/auth";

type FormData = {
  email: string;
  password: string;
};

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const safeNextPath = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/auth/dashboard";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending } = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = safeNextPath(new URLSearchParams(location.search).get("next"));

  const { register, handleSubmit, reset } = useForm<FormData>({ mode: "all" });

  const onSubmit = (data: FormData) => {
    mutate(data, {
      onSuccess: (details) => {
        setAccessToken(details.data.token.access);
        reset();
        navigate(destination, { replace: true });
      },
      onError: (error) => {
        const response = error as ErrorResponse;
        toast(response.response?.data?.message ?? "Sign in failed. Check your details and try again.");
      },
    });
  };

  return (
    <main id="main-content" className="hz-auth-page">
      <section className="hz-auth-card hz-card" aria-labelledby="codestra-login-title">
        <Link className="hz-auth-logo" to="/" aria-label="Codestra home">
          <img src={logo} alt="Codestra" />
        </Link>

        <div className="hz-auth-copy">
          <p className="hz-eyebrow">Secure account access</p>
          <h1 id="codestra-login-title">Log in</h1>
          <p>Use your Codestra account to continue to the protected workspace.</p>
        </div>

        <ToastContainer theme="dark" autoClose={4000} />

        <form className="hz-form-stack" onSubmit={handleSubmit(onSubmit)} aria-busy={isPending}>
          <div className="hz-field">
            <label className="hz-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="you@company.com"
              className="hz-input"
              {...register("email", { required: true })}
            />
          </div>

          <div className="hz-field">
            <label className="hz-label" htmlFor="password">Password</label>
            <div className="hz-password-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="hz-input"
                {...register("password", { required: true })}
              />
              <button
                type="button"
                className="hz-password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>
          </div>

          <div className="hz-checkbox-row">
            <input id="remember" type="checkbox" defaultChecked />
            <label htmlFor="remember">Keep me logged in on this browser</label>
          </div>

          <button
            type="submit"
            className="hz-button hz-button--primary"
            disabled={isPending}
          >
            {isPending ? "Signing in…" : "Log in"}
          </button>

          <p className="hz-auth-support">
            Need an account? <Link to="/signup">Create one</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default Login;
