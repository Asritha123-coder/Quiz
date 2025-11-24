import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, googleLogin, isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  // 🔵 GOOGLE SIGN UP — save to db.json + localStorage
  const handleGoogleSignup = async (response) => {
    try {
      setLoading(true);
      setError("");
      const token = response.credential;

      // Decode user info from Google JWT
      const userInfo = JSON.parse(atob(token.split(".")[1]));

      const result = await googleLogin(userInfo);
      
      if (result.success) {
        setSuccess("Google Signup Successful!");
        setTimeout(() => {
          if (result.user.role === "admin") {
            navigate("/admin/dashboard", { replace: true });
          } else {
            navigate("/home", { replace: true });
          }
        }, 1000);
      } else {
        setError(result.error || "Google signup failed");
      }
    } catch (error) {
      console.error("Google signup error:", error);
      setError("Google signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleSignup,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignupBtn"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, []);

  // 🟢 NORMAL SIGNUP — save to db.json + localStorage
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long!");
      setLoading(false);
      return;
    }

    const result = await signup(name, email, password);
    
    if (result.success) {
      setSuccess("Signup Successful! Redirecting...");
      e.target.reset();
      setTimeout(() => {
        if (result.user.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      }, 1000);
    } else {
      setError(result.error || "Signup failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold mb-2 text-center text-blue-700">
          Join TriviaTrek
        </h2>
        <p className="text-center text-gray-500 mb-6">Create your account</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Name</label>
            <input
              name="name"
              type="text"
              placeholder="Enter your name"
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password (min 6 characters)"
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        <div id="googleSignupBtn" className="w-full mb-4 flex justify-center"></div>

        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
