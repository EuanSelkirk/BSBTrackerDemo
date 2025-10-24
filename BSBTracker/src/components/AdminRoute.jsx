// src/components/AdminRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../data/supabaseClient";

export default function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setChecking(false);
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (error || !data?.is_admin) {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }

      setChecking(false);
    }

    checkAdmin();
  }, []);

  if (checking) return <div>Checking admin access...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
