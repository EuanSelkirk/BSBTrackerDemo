import { Link, NavLink } from "react-router-dom";
import logo from "../assets/BlueSwan_Logo.jpg";

const links = [
  { to: "/", label: "Home" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/events", label: "Events" },
  { to: "/routes", label: "Routes" },
];

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-blue-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Blue Swan Tracker" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-semibold text-slate-900 tracking-wide">BSBTracker Portfolio</span>
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `transition-colors hover:text-blue-600 ${
                  isActive ? "text-blue-600" : "text-slate-600"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <a
          href="https://www.linkedin.com/"
          target="_blank"
          rel="noreferrer"
          className="hidden rounded-full border border-blue-500 px-4 py-1 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 md:inline-flex"
        >
          Connect
        </a>
      </div>
    </header>
  );
}
