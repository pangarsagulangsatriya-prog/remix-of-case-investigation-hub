import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Check, Lock, Globe, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* LEFT PANEL - Illustration (60%) */}
      <div className="hidden md:flex md:w-[60%] relative bg-[#0a192f] flex-col justify-center px-12 lg:px-20 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-2xl">
          {/* Main Illustration Area */}
          <div className="mb-12 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-1 shadow-2xl">
            <img 
              src="/login_illustration.png" 
              alt="Investigation Workspace Mockup" 
              className="w-full rounded-lg shadow-inner"
            />
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
            Turn evidence into defensible investigation reports.
          </h1>
          <p className="text-lg text-blue-100/80 mb-8 leading-relaxed max-w-xl">
            Review facts, trace evidence, run AI analysis, and prepare audit-ready reports in one secure workspace.
          </p>

          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center gap-2 text-sm font-medium text-white/90 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Check className="h-4 w-4 text-blue-400" />
              Evidence-linked
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-white/90 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              Human-reviewed
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-white/90 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Globe className="h-4 w-4 text-blue-400" />
              Audit-ready
            </div>
          </div>
        </div>

        {/* Footer Area Left */}
        <div className="absolute bottom-8 left-12 lg:left-20 z-10 flex items-center gap-2 text-xs text-white/40">
          <Lock className="h-3 w-3" />
          AES-256 Bit Encryption Standard
        </div>
      </div>

      {/* RIGHT PANEL - Login Form (40%) */}
      <div className="flex-1 md:w-[40%] flex flex-col justify-center bg-white p-8 lg:p-16 relative">
        <div className="max-w-[400px] w-full mx-auto">
          {/* Logo & Product Name */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 bg-[#0a192f] rounded-lg flex items-center justify-center shadow-md">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#0a192f] tracking-tight whitespace-nowrap">
                AI Safety Investigation Workspace
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-sm text-slate-500">Sign in to access your investigation workspace</p>
          </div>

          <div className="space-y-4">
            {/* SSO Buttons */}
            <Button variant="outline" className="w-full h-11 text-sm font-medium border-slate-200 hover:bg-slate-50 transition-colors gap-3 rounded-lg" type="button">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </Button>
            <Button variant="outline" className="w-full h-11 text-sm font-medium border-slate-200 hover:bg-slate-50 transition-colors gap-3 rounded-lg" type="button">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
              </svg>
              Sign in with Microsoft
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">or sign in with email</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 tracking-tight">Email address</label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  className="h-11 text-sm border-slate-200 bg-slate-50/50 focus:bg-white transition-colors rounded-lg"
                  defaultValue="investigator@acme.com"
                  required
                />
              </div>
              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 tracking-tight">Password</label>
                  <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-11 text-sm border-slate-200 bg-slate-50/50 focus:bg-white transition-colors rounded-lg pr-10"
                    defaultValue="password123"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 py-1">
                <Checkbox id="remember" className="rounded-sm border-slate-300" />
                <label
                  htmlFor="remember"
                  className="text-xs font-medium text-slate-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Remember this device
                </label>
              </div>

              <Button type="submit" className="w-full h-11 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all rounded-lg">
                Login
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/50">
                <ShieldCheck className="h-4 w-4 text-slate-400 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-slate-500 font-medium uppercase tracking-wider">
                  Protected enterprise access. This system is monitored and access is restricted by role and organization.
                </p>
              </div>
            </div>
            
            <p className="text-[11px] text-center text-slate-400 mt-6 font-medium uppercase tracking-widest">
              Role-based secure workspace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

