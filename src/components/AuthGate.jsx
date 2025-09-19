import { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";
import Login from "../pages/Login"; // use your existing Login page

export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <div className="p-4">Loading...</div>;
  if (!session) return <Login />;
  return children;
}
