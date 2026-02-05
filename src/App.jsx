import { useState } from "react";
import "./App.css";
import Signup from "./pages/Signup/Signup";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Withdraw from "./pages/Withdraw/Withdraw";
import Deposit from "./pages/Deposit/Deposit";
import Products from "./pages/Products/Products";
import Audit from "./pages/Audit/Audit";
import MainLayout from "./provider/MainLayout"
import Login from "./pages/Login/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/app" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="home" element={<Home />} />
        <Route path="withdraw" element={<Withdraw />} />
        <Route path="deposit" element={<Deposit />} />
        <Route path="products" element={<Products />} />
        <Route path="audit" element={<Audit />} />
      </Route>
    </Routes>
  );
}

export default App;
