import { useState } from "react";
import supabase from "../utils/supabaseClient";

export default function LoginSupabase() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else window.location.reload();
  }

  return (
    <form onSubmit={handleLogin} className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Sign in</h1>
      <input className="w-full p-2 border mb-2" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full p-2 border mb-2" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button disabled={loading} className="w-full bg-blue-600 text-white p-2">{loading?'Signing in...':'Sign In'}</button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </form>
  );
}
