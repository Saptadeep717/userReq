import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginSignup from "./components/loginSignup";
import HomePage from "./components/homePage";
import SearchUsers from "./components/search";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup setUser={setUser} />} />
        <Route
          path="/home"
          element={
            <>
              
              <HomePage user={user} />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
