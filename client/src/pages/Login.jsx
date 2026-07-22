import { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
 const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
  email,
  password
}
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      onLogin();
    } catch (error) {
      alert("Invalid Username or Password");
    }
  };

  return (
    <div>
      <h1>Clothing POS Login</h1>

      <input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) =>
    setEmail(e.target.value)
  }
/>

      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <br />
      <br />

      <button onClick={login}>
        Login
      </button>
    </div>
  );
}

export default Login;