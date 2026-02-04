import { useState } from "react";
import "./App.css";
import Signup from "./pages/Signup/Signup";
import { Routes, Route } from "react-router";
import Home from "./pages/Home/Home";
import MainLayout from "./provider/MainLayout"
import Login from "./pages/Login/Login";

function App() {
  return (
    <Routes>
      <Route path="/Login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path = '/'element = {<MainLayout /> }>
          <Route index element = {<Home /> } />
          <Route path="home" element={<Home />} />  
      </Route>
    </Routes>
  );
}

export default App;
