import Footer from "@/Components/Layouts/Footer";
import Navbar from "@/Components/Layouts/Navbar";
import { Link } from "react-router";

const NotFound = () => (
  <div className="orbit-page">
    <Navbar />
    <main className="orbit-state-page" id="main-content">
      <section className="orbit-status-panel" aria-labelledby="not-found-title">
        <p className="orbit-eyebrow">Error 404</p>
        <h1 id="not-found-title">Page not found</h1>
        <p>The requested Codestra page does not exist or is no longer published.</p>
        <Link className="orbit-button orbit-button--primary" to="/">
          Return home
        </Link>
      </section>
    </main>
    <Footer />
  </div>
);

export default NotFound;
