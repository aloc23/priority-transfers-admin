import { useState } from "react";
import supabase from '../utils/supabaseClient';
import { Navigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);

  if (isSignedUp) {
    return (
      <div className="signup-success" style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h2>Signup successful!</h2>
        <p>Your account has been created. You can now log in.</p>
        <a href="#/login" style={{ color: '#6366f1', textDecoration: 'underline', fontWeight: 'bold', fontSize: '1.1em' }}>Go to Login</a>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      // Supabase Auth signup with role in user_metadata
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role }
        }
      });
      
      if (signupError) {
        setError(signupError.message);
        setIsLoading(false);
        return;
      }
      
      // If signup was successful and user is immediately available, create profile
      if (data.user && !data.user.identities?.length) {
        // User already exists
        setError("User already exists. Please log in instead.");
        setIsLoading(false);
        return;
      }
      
      // For new users, the profile will be created on first login
      // This handles the email confirmation flow properly
      setIsSignedUp(true);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Signup error:', error);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          style={{ marginBottom: '1rem', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', width: '100%' }}
        >
          <option value="User">User (View Only)</option>
          <option value="Admin">Admin (Full Access)</option>
          <option value="Dispatcher">Dispatcher</option>
          <option value="Viewer">Viewer</option>
        </select>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>
        <button
          type="button"
          style={{ marginTop: '1rem', background: '#6366f1', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
          onClick={() => {
            setEmail('admin-dummy@priority.com');
            setPassword('demo123');
          }}
        >
          Quick Admin Signup (dummy)
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
