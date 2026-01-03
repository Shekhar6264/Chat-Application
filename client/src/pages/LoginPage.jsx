import React, { useState } from 'react';
import assets from '../assets/assets';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [agree, setAgree] = useState(false);
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const {login} = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agree) return; // must agree to terms

    if (currState === "Sign Up" && !isDataSubmitted) {
      setIsDataSubmitted(true); // show bio step
      return;
    }

    await login(currState=="Sign Up"?'signup':'login',{fullName,email,password,bio});
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      
      <img
        src={assets.logo_big}
        alt="Logo"
        className="w-[min(30vw,250px)]"
      />

      <form
        onSubmit={handleSubmit}
        className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg"
      >
        {/* Heading */}
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState}
          <img
            src={assets.arrow_icon}
            alt=""
            className="w-5 cursor-pointer"
            onClick={() => {
              setCurrState(currState === "Sign Up" ? "Login" : "Sign Up");
              setIsDataSubmitted(false);
            }}
          />
        </h2>

        {/* Full Name */}
        {currState === "Sign Up" && !isDataSubmitted && (
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="p-2 border border-gray-500 rounded-md focus:outline-none"
            required
          />
        )}

        {/* Email & Password */}
        {!isDataSubmitted && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 border border-gray-500 rounded-md focus:outline-none"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 border border-gray-500 rounded-md focus:outline-none"
              required
            />
          </>
        )}

        {/* Bio Step */}
        {isDataSubmitted && currState === "Sign Up" && (
          <textarea
            rows={3}
            placeholder="Tell us about yourself (Bio)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="p-2 border border-gray-500 rounded-md focus:outline-none resize-none"
            required
          />
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer"
        >
          {currState === "Sign Up"
            ? isDataSubmitted
              ? "Finish Signup"
              : "Create Account"
            : "Login"}
        </button>

        {/* Terms Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="accent-violet-500"
            required
          />
          <span>Agree to the terms of use & privacy policy.</span>
        </label>

        {/* Switch Auth Mode */}
        <div className="flex flex-col gap-2">
          {currState === "Sign Up" ? (
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Sign Up");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
