"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Car,
  KeyRound,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CAMPUS_OPTIONS } from "@/data/mockVehicles";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function LoginContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  const { login, register, isLoading } = useAuth();

  // Mode: "signin" | "signup"
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(initialMode);

  // Sign In Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign Up Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<"renter" | "owner">("renter");
  const [regCampus, setRegCampus] = useState<string>(CAMPUS_OPTIONS[0]);
  const [regPhone, setRegPhone] = useState("");
  const [regYear, setRegYear] = useState("");
  const [regAgree, setRegAgree] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Forgot Password Dialog State
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Handle Sign In submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setSignInError("Please enter your registered email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setSignInError("Please enter a valid email format (e.g. name@campus.edu).");
      return;
    }

    if (!password) {
      setSignInError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    const result = await login(trimmedEmail, password);
    setIsSubmitting(false);

    if (!result.success) {
      setSignInError(result.error || "Invalid email address or password.");
    }
  };

  // Handle Registration submission
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError("Please enter your full name.");
      return;
    }

    const trimmedEmail = regEmail.trim();
    if (!trimmedEmail) {
      setRegError("Please enter your official college or university email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setRegError("Please enter a valid email format (e.g. name@campus.edu).");
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setRegError("Password must be at least 6 characters long.");
      return;
    }

    if (!regPhone.trim()) {
      setRegError("Please enter your mobile phone number for trip coordinates.");
      return;
    }

    if (!regAgree) {
      setRegError("You must agree to the Campus Community Honor Code to join Wheelzy.");
      return;
    }

    setIsRegistering(true);
    const result = await register({
      name: regName.trim(),
      email: trimmedEmail,
      password: regPassword,
      role: regRole,
      campus: regCampus,
      collegeYear: regYear.trim() || "Undergrad",
      phone: regPhone.trim(),
    });
    setIsRegistering(false);

    if (!result.success) {
      setRegError(result.error || "Registration failed. Please check your inputs.");
    } else {
      toast.success(`Welcome to Wheelzy, ${regName}! Your student account is active.`);
    }
  };

  // Handle Quick Demo Account Autofill
  const handleAutofill = (demoEmail: string, demoRole: string) => {
    setActiveTab("signin");
    setEmail(demoEmail);
    setPassword("password123");
    setSignInError(null);
    toast.info(`Filled credentials for ${demoRole} (${demoEmail})`);
  };

  // Handle Reset Password Simulation
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setResetSubmitted(true);
      toast.success(`Password reset verification link sent to ${resetEmail}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-radial-[at_top] from-emerald-950/20 via-[#FAFAFD] to-[#FAFAFD] flex flex-col justify-between font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Navbar Brand Bar */}
      <header className="px-6 py-4 sm:py-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-gray-900 flex items-center">
                Wheelzy
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1 animate-pulse" />
              </span>
              <span className="text-[10px] font-bold text-emerald-700 tracking-wider">
                Book. Ride. Return.
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5"
          >
            <span>← Return to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xl shadow-emerald-950/5 space-y-6">
          
          {/* Brand Header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-800 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Campus Unified Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {activeTab === "signin" ? "Welcome Back!" : "Join Wheelzy Campus"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {activeTab === "signin"
                ? "Log in to continue your Wheelzy journey."
                : "Create your student renter or vehicle owner account."}
            </p>
          </div>

          {/* Switch Tab Control */}
          <div className="grid grid-cols-2 p-1 bg-gray-100/90 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab("signin");
                setSignInError(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "signin"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("signup");
                setRegError(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "signup"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Tab 1: Sign In Form */}
          {activeTab === "signin" ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {/* Error Message Alert */}
              {signInError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span className="leading-relaxed">{signInError}</span>
                </div>
              )}

              {/* Email Address Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (signInError) setSignInError(null);
                    }}
                    placeholder="e.g. renter@campus.edu"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setResetSubmitted(false);
                      setForgotPasswordOpen(true);
                    }}
                    className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (signInError) setSignInError(null);
                    }}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-medium text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Option */}
              <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 accent-emerald-600 cursor-pointer"
                  />
                  <span>Remember my login</span>
                </label>
                <span className="text-[10px] text-gray-400">Encrypted Session</span>
              </div>

              {/* Login Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-md shadow-emerald-900/10 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              {/* Link to Registration */}
              <div className="pt-2 text-center text-xs text-gray-500">
                <span>Don&apos;t have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("signup");
                    setRegError(null);
                  }}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </div>

              {/* Quick Demo Credentials Autofill Pill Bar */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} className="text-emerald-500" />
                  <span>Interactive Test Accounts (Click to Autofill)</span>
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleAutofill("renter@campus.edu", "Student Renter")}
                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 text-left font-medium text-gray-700 hover:text-emerald-800 transition-colors cursor-pointer truncate"
                  >
                    🎓 Priya (Renter)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutofill("owner@campus.edu", "Vehicle Owner")}
                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 text-left font-medium text-gray-700 hover:text-emerald-800 transition-colors cursor-pointer truncate"
                  >
                    🚲 Marcus (Owner)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutofill("admin@wheelzy.internal", "System Admin")}
                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 text-left font-medium text-gray-700 hover:text-emerald-800 transition-colors cursor-pointer truncate"
                  >
                    🛡️ Alex (System Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutofill("suspended@campus.edu", "Suspended Account")}
                    className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-left font-medium text-rose-700 transition-colors cursor-pointer truncate"
                  >
                    ⚠️ Suspended Demo
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Tab 2: Sign Up / Registration Form */
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span className="leading-relaxed">{regError}</span>
                </div>
              )}

              {/* Role Selection (Renter or Owner only, per Requirement 6) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  I Want To Join As:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole("renter")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      regRole === "renter"
                        ? "border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold ring-2 ring-emerald-500/20"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <GraduationCap size={15} className="text-emerald-600" />
                      <span>Student Renter</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-normal mt-0.5">Rent campus rides</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole("owner")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      regRole === "owner"
                        ? "border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold ring-2 ring-emerald-500/20"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <Car size={15} className="text-emerald-600" />
                      <span>Vehicle Owner</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-normal mt-0.5">List & host fleet</p>
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">
                  * Administrator accounts require platform authorization and cannot be self-registered.
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              {/* College Email */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">Official College Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. maya@berkeley.edu"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 pr-10 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Campus Hub & Phone */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">Campus Hub</label>
                  <select
                    value={regCampus}
                    onChange={(e) => setRegCampus(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  >
                    {CAMPUS_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">Mobile Phone</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Terms Agreement */}
              <label className="flex items-start gap-2 pt-1 text-[11px] text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={regAgree}
                  onChange={(e) => setRegAgree(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
                <span>
                  I agree to the Wheelzy Campus Terms of Service and understand that student ID verification is required before renting or listing vehicles.
                </span>
              </label>

              {/* Submit Registration */}
              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-md shadow-emerald-900/10 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isRegistering ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Campus Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Access Portal</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-gray-500">
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("signin");
                    setSignInError(null);
                  }}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* Interactive Forgot Password Modal */}
      {forgotPasswordOpen && (
        <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
          <DialogContent className="max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100">
            <DialogHeader>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                <KeyRound size={20} />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Reset Account Password
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Enter your registered campus .edu or staff email address. We will send a secure one-time reset link.
              </DialogDescription>
            </DialogHeader>

            {resetSubmitted ? (
              <div className="py-4 space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-sm font-bold text-gray-900">Reset Email Dispatched!</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  A verification link with one-time security token has been dispatched to{" "}
                  <strong className="text-gray-900 font-mono">{resetEmail}</strong>.
                </p>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordOpen(false);
                      setResetSubmitted(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Return to Sign In
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">Registered Email Address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="e.g. renter@campus.edu"
                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <DialogFooter className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center gap-2"
                  >
                    {resetLoading ? "Dispatching..." : "Send Reset Link"}
                  </button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-gray-400 border-t border-gray-100">
        © 2026 Wheelzy Technologies Inc. Verified peer-to-peer campus ride network.
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFD]">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
