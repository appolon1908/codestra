import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import AuthShell from "@/Components/Layouts/AuthShell";
import { safeReturnPath } from "@/lib/browserSession";
import { useSession } from "@/Providers/SessionProvider";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { status, beginSignup } = useSession();
  const returnTo = safeReturnPath(searchParams.get("return_to"));

  useEffect(() => {
    if (status === "authenticated") {
      navigate(returnTo, { replace: true });
    }
  }, [navigate, returnTo, status]);

  return (
    <AuthShell
      eyebrow="Codestra account"
      title="Create your account"
      description="Account creation continues through the registered Codestra identity service with verified redirect and session controls."
    >
      <div className="orbit-stack">
        <button
          className="orbit-button orbit-button--primary orbit-button--wide"
          onClick={() => beginSignup(returnTo)}
          type="button"
        >
          Continue to secure signup
        </button>
        <p className="orbit-auth-support">
          Already registered? <Link to={`/login?return_to=${encodeURIComponent(returnTo)}`}>Log in</Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default Signup;
