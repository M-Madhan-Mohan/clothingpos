import { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "13px", borderRadius: "10px", border: "1px solid #334155", background: "#0b1120", color: "white" };

  const login = async () => {
    setError(""); setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password, role });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Invalid username or password.");
    } finally { setIsLoading(false); }
  };

  return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #070b18, #1d1640)", padding: "24px" }}>
    <form onSubmit={(event) => { event.preventDefault(); login(); }} style={{ width: "min(100%, 410px)", background: "#11182d", padding: "36px", borderRadius: "20px", border: "1px solid #2c3658", boxShadow: "0 24px 60px #0008", color: "white" }}>
      <p style={{ color: "#a78bfa", fontWeight: 700, letterSpacing: "0.12em" }}>RS9 EXPORTS</p><h1 style={{ color: "white", fontSize: "32px", margin: "10px 0 8px" }}>Sign in</h1><p style={{ color: "#aab4cb", marginBottom: "24px" }}>Choose your access type to continue.</p>
      <label style={{ display: "block", marginBottom: "8px" }}>Login as</label><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>{["admin", "staff"].map((accessRole) => <button key={accessRole} type="button" onClick={() => setRole(accessRole)} style={{ padding: "12px", textTransform: "capitalize", borderRadius: "10px", border: role === accessRole ? "1px solid #a78bfa" : "1px solid #334155", background: role === accessRole ? "#31215c" : "#192238", color: "white", cursor: "pointer" }}>{accessRole}</button>)}</div>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required /><div style={{ height: "14px" }} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required /><div style={{ height: "18px" }} />
      {error && <p style={{ color: "#fca5a5", fontSize: "14px", marginBottom: "14px" }}>{error}</p>}
      <button type="submit" disabled={isLoading} style={{ width: "100%", padding: "13px", border: 0, borderRadius: "10px", background: "#8b5cf6", color: "white", fontWeight: 700, cursor: "pointer" }}>{isLoading ? "Signing in..." : `Sign in as ${role}`}</button>
    </form>
  </div>;
}

export default Login;
