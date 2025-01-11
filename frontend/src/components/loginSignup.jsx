import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../index.css";


const LoginSignup = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate(); // Replacing useHistory

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin
      ? `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/login`
      : `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/signup`;

    //const payload = { email, password, ...(name && { name }) };
    const payload = { password, ...(name && { name }) };

    try {
      const response = await axios.post(url, payload);
      // Set data in sessionStorage
      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("username", response.data.user.name);

      setUser(response.data.user);
      navigate("/home"); // Replacing history.push
    } catch (error) {
      alert(error.response.data.message);
      setPassword("");
      setName("");
      console.error(error);
    }
  };

   return (
    <div className="form-container">
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="userame"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin
          ? "Don't have account? Sign Up"
          : "Already have account? Login"}
      </button>
    </div>
  );
  
};

export default LoginSignup;
