import { Link } from "react-router";
import AuthShell from "@/Components/Layouts/AuthShell";
import { useSession } from "@/Providers/SessionProvider";

const SignedOut = () => {
  const { beginLogin } = useSession();

  return (
    <AuthShell
      eyebrow="Codestra account"
      title="You are signed out"
      description="The browser session has been revoked. No account token remains in this application."
    >
      <div className="orbit-stack">
        <button
          className="orbit-button orbit-button--primary orbit-button--wide"
          onClick={() => beginLogin("/auth/dashboard")}
          type="button"
        >
          Log in again
        </button>
        <Link className="orbit-button orbit-button--secondary orbit-button--wide" to="/">
          Return home
        </Link>
      </div>
    </AuthShell>
  );
};

export default SignedOut;
