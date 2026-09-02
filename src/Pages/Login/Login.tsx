import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import AuthShell from "@/Components/Layouts/AuthShell";
import { safeReturnPath } from "@/lib/browserSession";
import { useSession } from "@/Providers/SessionProvider";

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { status, beginLogin } = useSession();
  const returnTo = safeReturnPath(searchParams.get("return_to"));

  useEffect(() => {
    if (status === "authenticated") {
      navigate(returnTo, { replace: true });
    }
  }, [navigate, returnTo, status]);

  return (
    <AuthShell
      eyebrow="Codestra account"
      title="Log in"
      description="Continue through the secure Codestra identity service. Credentials and OAuth tokens are never stored in this browser application."
    >
      <div className="orbit-stack">
        <button
          className="orbit-button orbit-button--primary orbit-button--wide"
          onClick={() => beginLogin(returnTo)}
          type="button"
        >
          Continue to secure login
        </button>
        <p className="orbit-auth-support">
          Need an account? <Link to={`/signup?return_to=${encodeURIComponent(returnTo)}`}>Create one</Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default Login;
