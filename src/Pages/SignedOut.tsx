import { Link } from "react-router";
import AuthShell from "@/Components/Layouts/AuthShell";

const SignedOut = () => {
  return (
    <AuthShell
      eyebrow="Codestra account"
      title="You are signed out"
      description="The browser session has been revoked. No account token remains in this application."
    >
      <div className="orbit-stack">
        <Link
          className="orbit-button orbit-button--primary orbit-button--wide"
          to="/login"
        >
          Log in again
        </Link>
        <Link className="orbit-button orbit-button--secondary orbit-button--wide" to="/">
          Return home
        </Link>
      </div>
    </AuthShell>
  );
};

export default SignedOut;
