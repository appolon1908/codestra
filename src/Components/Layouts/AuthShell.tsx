import type { PropsWithChildren } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

type AuthShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
}>;

const AuthShell = ({ eyebrow, title, description, children }: AuthShellProps) => (
  <div className="orbit-page">
    <Navbar />
    <main className="orbit-auth-stage" id="main-content">
      <section className="orbit-auth-panel" aria-labelledby="orbit-auth-title">
        <p className="orbit-eyebrow">{eyebrow}</p>
        <h1 id="orbit-auth-title">{title}</h1>
        <p className="orbit-auth-description">{description}</p>
        {children}
      </section>
    </main>
    <Footer />
  </div>
);

export default AuthShell;
