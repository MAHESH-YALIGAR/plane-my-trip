import React, { useState, FC, ChangeEvent, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, Plane, MapPin, Globe } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

type AuthTab = "login" | "signup";

interface LoginFormState {
  email: string;
  password: string;
}

interface SignUpFormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface Feature {
  icon: FC<{ className?: string }>;
  title: string;
  description: string;
}

const API_BASE_URL = "http://localhost:8001/api/auth";

const LoginPage: FC = () => {
  const { login } = useAuth();
  const { isLoggedIn } = useAuth();
  const navigate=useNavigate()

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Form states
  const [loginForm, setLoginForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });

  const [signUpForm, setSignUpForm] = useState<SignUpFormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);

  // ✅ STRONG VALIDATION ERRORS STATE
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ STRONG VALIDATION FUNCTIONS
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) return "Email is required";
    if (!emailRegex.test(email.trim())) return "Enter valid email (user@gmail.com)";
    if (email.length > 254) return "Email too long";
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be 8+ characters";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return "Password needs 1 uppercase, 1 lowercase, 1 number";
    }
    return null;
  };

  const validateName = (name: string): string | null => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2 || name.trim().length > 50) {
      return "Name must be 2-50 characters";
    }
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return "Name can only contain letters and spaces";
    }
    return null;
  };

  // ✅ REAL-TIME VALIDATION HANDLERS
  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    if (name === "email") {
      const emailError = validateEmail(value);
      setErrors(prev => ({ ...prev, email: emailError || "" }));
    } else if (name === "password") {
      const passwordError = validatePassword(value);
      setErrors(prev => ({ ...prev, password: passwordError || "" }));
    }

    setError("");
  };

  const handleSignUpChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setSignUpForm((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    if (name === "firstName" || name === "lastName") {
      const nameError = validateName(value);
      setErrors(prev => ({ ...prev, [name]: nameError || "" }));
    } else if (name === "email") {
      const emailError = validateEmail(value);
      setErrors(prev => ({ ...prev, email: emailError || "" }));
    } else if (name === "password") {
      const passwordError = validatePassword(value);
      setErrors(prev => ({ ...prev, password: passwordError || "" }));
    }

    setError("");
  };

  // ✅ FIXED LOGIN HANDLER WITH STRONG VALIDATION
  // const handleLogin = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
  //   // navigate('/planetrip')
  //   e.preventDefault();
  //   setError("");
  //   setSuccess("");

  //   // Comprehensive validation
  //   const newErrors: Record<string, string> = {};
  //   newErrors.email = validateEmail(loginForm.email) || "";
  //   newErrors.password = validatePassword(loginForm.password) || "";

  //   if (newErrors.email || newErrors.password) {
  //     setErrors(newErrors);
  //     return;
  //   }

  //   setErrors({});
  //   setIsLoading(true);

  //   try {
  //     // Use AuthContext's login function which handles cookies automatically
  //     await login(loginForm.email.trim(), loginForm.password);
      
  //     setSuccess(`Welcome back ${loginForm.email.split('@')[0]}!`);
  //     setLoginForm({ email: "", password: "" });
      
  //     // Redirect after successful login
  //     setTimeout(() => {
  //       navigate('/planetrip');
  //     }, 1000);
        
  //   } catch (error: any) {
  //     console.error("Login Error:", error);
  //     setError(error.response?.data?.message || "Login failed");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  

const handleLogin = async (
  e: React.MouseEvent<HTMLButtonElement>
): Promise<void> => {
  e.preventDefault();

  setError("");
  setSuccess("");

  // Validation
  const newErrors: Record<string, string> = {};
  newErrors.email = validateEmail(loginForm.email) || "";
  newErrors.password = validatePassword(loginForm.password) || "";

  if (newErrors.email || newErrors.password) {
    setErrors(newErrors);
    return;
  }

  setErrors({});
  setIsLoading(true);

  try {
    // 🔐 AuthContext handles cookie login
    await login(
      loginForm.email.trim(),
      loginForm.password
    );

    setSuccess(`Welcome back ${loginForm.email.split("@")[0]}!`);
    setLoginForm({ email: "", password: "" });

    // ✅ Navigate ONLY after successful login
    navigate("/Dashboard");

  } catch (error: any) {
    console.error("Login error details:", error);
    setError(error.response?.data?.message || "Invalid email or password");
  } finally {
    setIsLoading(false);
  }
};


  // ✅ FIXED SIGNUP HANDLER WITH STRONG VALIDATION
  const handleSignUp = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ✅ COMPREHENSIVE VALIDATION
    const newErrors: Record<string, string> = {};
    newErrors.firstName = validateName(signUpForm.firstName) || "";
    newErrors.lastName = validateName(signUpForm.lastName) || "";
    newErrors.email = validateEmail(signUpForm.email) || "";
    newErrors.password = validatePassword(signUpForm.password) || "";

    if (!agreeToTerms) {
      newErrors.terms = "Please agree to terms and conditions";
    }

    if (Object.values(newErrors).some(err => err)) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: signUpForm.firstName.trim(),
          lastName: signUpForm.lastName.trim(),
          email: signUpForm.email.trim(),
          password: signUpForm.password,
        }),
      });

      const data = await response.json();
      console.log("SignUp Response:", data);

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        setSuccess("Account created successfully!");

        // Reset and switch to login
        setSignUpForm({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
        });
        setAgreeToTerms(false);

        setTimeout(() => {
          setActiveTab("login");
        }, 1500);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("SignUp Error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features: Feature[] = [
    {
      icon: MapPin,
      title: "Explore Destinations",
      description: "Discover amazing places and create unforgettable memories",
    },
    {
      icon: Globe,
      title: "Plan Together",
      description: "Collaborate with friends and family on one platform",
    },
    {
      icon: Plane,
      title: "Smart Itineraries",
      description: "Get personalized recommendations and detailed schedules",
    },
  ];

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.7s" }}></div>

      <div className="relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center lg:gap-12">
          {/* Left Side */}
          <div className="hidden lg:flex flex-col justify-center text-white space-y-8 px-8 lg:px-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Plan My Trip</h1>
                <p className="text-white/80 text-sm">Your Perfect Journey Awaits</p>
              </div>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <p className="text-white/80">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-8 border-t border-white/20">
              <p className="text-white/80 text-sm">Join 50,000+ travelers planning their adventures</p>
            </div>
          </div>

          {/* Right Side */}
          <div className="w-full px-4 lg:px-8">
            <Card className="border-0 bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 py-4 px-6 font-bold rounded-2xl text-lg transition-all ${activeTab === "login"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab("signup")}
                  className={`flex-1 py-4 px-6 font-bold rounded-2xl text-lg transition-all ${activeTab === "signup"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Login Form */}
              {activeTab === "login" && (
                <div className="p-8 space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
                    <p className="text-gray-600 text-sm mt-2">Sign in to continue planning</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl">
                      {success}
                    </div>
                  )}

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Email</label>
                    <div className="relative">
                      <Mail className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${errors.email ? 'text-red-500' : 'text-gray-400'
                        }`} />
                      <Input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        className={`h-12 pl-12 border-2 rounded-xl text-base transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${errors.email
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <span>•</span> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                    <div className="relative">
                      <Lock className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${errors.password ? 'text-red-500' : 'text-gray-400'
                        }`} />
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        className={`h-12 pl-12 pr-12 border-2 rounded-xl text-base transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${errors.password
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <span>•</span> {errors.password}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleLogin}
                    disabled={isLoading || !!errors.email || !!errors.password}
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing In...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </div>
              )}

              {/* SignUp Form */}
              {activeTab === "signup" && (
                <div className="p-8 space-y-5">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Join Us</h2>
                    <p className="text-gray-600 text-sm mt-2">Create your account today</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl">
                      {success}
                    </div>
                  )}

                  {/* Names */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">First Name</label>
                      <Input
                        type="text"
                        name="firstName"
                        placeholder="John"
                        value={signUpForm.firstName}
                        onChange={handleSignUpChange}
                        className={`h-11 border-2 rounded-xl text-base transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${errors.firstName
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <span>•</span> {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                      <Input
                        type="text"
                        name="lastName"
                        placeholder="Doe"
                        value={signUpForm.lastName}
                        onChange={handleSignUpChange}
                        className={`h-11 border-2 rounded-xl text-base transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${errors.lastName
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <span>•</span> {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Email</label>
                    <div className="relative">
                      <Mail className={`absolute left-4 top-2.5 w-5 h-5 transition-colors ${errors.email ? 'text-red-500' : 'text-gray-400'
                        }`} />
                      <Input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={signUpForm.email}
                        onChange={handleSignUpChange}
                        className={`h-11 pl-12 border-2 rounded-xl text-base transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${errors.email
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <span>•</span> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                    <div className="relative">
                      <Lock className={`absolute left-4 top-2.5 w-5 h-5 transition-colors ${errors.password ? 'text-red-500' : 'text-gray-400'
                        }`} />
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        value={signUpForm.password}
                        onChange={handleSignUpChange}
                        className={`h-11 pl-12 pr-12 border-2 rounded-xl text-base transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${errors.password
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <span>•</span> {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Terms Checkbox */}
                  <label className={`flex items-center gap-2 cursor-pointer p-3 border-2 rounded-xl transition-all ${errors.terms
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 focus:ring-indigo-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">I agree to terms and conditions</span>
                  </label>
                  {errors.terms && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 pl-1">
                      <span>•</span> {errors.terms}
                    </p>
                  )}

                  <Button
                    onClick={handleSignUp}
                    disabled={isLoading || Object.values(errors).some(err => err) || !agreeToTerms}
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              )}
            </Card>

            <div className="text-center mt-8 text-white/80 text-sm">
              <p>© 2026 Plan My Trip. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
