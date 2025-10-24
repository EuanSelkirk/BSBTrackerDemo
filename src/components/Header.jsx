import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../data/supabaseClient";
import logo from "../assets/BlueSwan_Logo.jpg";
import { FaHome, FaUser, FaCalendarAlt, FaTools } from "react-icons/fa";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Put this AFTER all hooks
  const hideHeader =
    location.pathname === "/" || location.pathname.startsWith("/leaderboard");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user) {
        setUser(user);
        const { data, error: profileError } = await supabase
          .from("users")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (!profileError && data?.is_admin) {
          setIsAdmin(true);
        }
      }
    };

    fetchUser();
  }, []);

  if (hideHeader) return null;

  const navigation = [
    ...(isAdmin
      ? [{ href: "/admin/dashboard", icon: FaTools, key: "admin" }]
      : []),
    { href: "/dashboard", icon: FaHome, key: "dashboard" },
    { href: "/events", icon: FaCalendarAlt, key: "events" },
    { href: "/profile", icon: FaUser, key: "profile" },
  ];

  return (
    <>
      {/* Desktop Header */}
      <nav className="hidden md:flex bg-white shadow-sm fixed top-0 w-full z-50 px-6 py-3 items-center justify-between">
        <Link to={user ? "/dashboard" : "/"}>
          <img
            className="h-8 w-auto sm:h-10"
            src={logo}
            alt="BSBTracker Logo"
          />
        </Link>

        <div className="flex space-x-4">
          {navigation.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              className="text-sm px-4 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              {item.key.charAt(0).toUpperCase() + item.key.slice(1)}
            </Link>
          ))}
        </div>
      </nav>

      {/* Sleek Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-lg z-50 flex justify-around items-center py-2">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.href)}
              className={`w-20 flex flex-col items-center justify-center gap-1 transition-all duration-200 px-2 py-1 rounded-md ${
                isActive
                  ? "text-blue-600 font-semibold bg-blue-50 shadow-md scale-105"
                  : "text-gray-500 hover:text-blue-500 hover:bg-blue-50"
              }`}
            >
              <Icon className="text-xl" />
              <span className="text-xs capitalize">{item.key}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
