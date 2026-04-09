import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Check, Lock, Globe, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { BerauCoalLogo, InvestigationIntelligenceLogo } from "@/components/BrandLogo";

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
      <div className="hidden md:flex md:w-[60%] relative bg-[#0F2A1D] flex-col justify-center px-12 lg:px-20 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-600 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-2xl">
          {/* Main Illustration Area */}
          <div className="mb-12 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 shadow-2xl flex items-center justify-center min-h-[300px]">
             <BerauCoalLogo className="h-48 w-auto text-white" />
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
            Advanced Intelligence for Industrial Safety.
          </h1>
          <p className="text-lg text-emerald-100/80 mb-8 leading-relaxed max-w-xl">
             Investigation Intelligence powered by Berau Coal. Unified investigation gateway for enterprise safety operations, extraction review, and AI-driven analysis.
          </p>

          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center gap-2 text-sm font-medium text-white/90 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Check className="h-4 w-4 text-emerald-400" />
              K3 Standards
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-white/90 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Compliance Verified
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-white/90 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Globe className="h-4 w-4 text-emerald-400" />
              Corporate Ready
            </div>
          </div>
        </div>

        {/* Footer Area Left */}
        <div className="absolute bottom-8 left-12 lg:left-20 z-10 flex items-center gap-2 text-xs text-white/40 font-bold uppercase tracking-widest">
          <Lock className="h-3 w-3" />
          Secure Industrial Network Access
        </div>
      </div>

      {/* RIGHT PANEL - Login Form (40%) */}
      <div className="flex-1 md:w-[40%] flex flex-col justify-center bg-[#F8FAF8] p-8 lg:p-16 relative">
        <div className="max-w-[400px] w-full mx-auto">
          {/* Logo & Product Name */}
          <div className="flex items-center gap-3 mb-12">
            <InvestigationIntelligenceLogo className="h-8 w-auto" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Enterprise Gateway</h2>
            <p className="text-sm text-slate-500 font-medium">Sign in to your safety investigation workspace</p>
          </div>

          <div className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Corporate email</label>
                <Input
                  type="email"
                  placeholder="investigator@beraucoal.co.id"
                  className="h-11 text-sm border-slate-200 bg-white focus:ring-primary focus:border-primary transition-all rounded-lg"
                  defaultValue="investigator@beraucoal.co.id"
                  required
                />
              </div>
              <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Password</label>
                  <button type="button" className="text-xs font-bold text-green-700 hover:text-green-800 transition-colors uppercase tracking-tight">
                    Reset Access
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 text-sm border-slate-200 bg-white focus:ring-primary focus:border-primary transition-all rounded-lg pr-10"
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
                <Checkbox id="remember" className="rounded-sm border-slate-300 h-4 w-4 data-[state=checked]:bg-primary" />
                <label
                  htmlFor="remember"
                  className="text-xs font-bold text-slate-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer uppercase tracking-tighter"
                >
                  Trust this device for 30 days
                </label>
              </div>

              <Button type="submit" className="w-full h-11 text-sm font-bold bg-primary hover:bg-green-800 text-white shadow-lg shadow-green-900/10 transition-all rounded-lg uppercase tracking-widest">
                Authorize Access
              </Button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#F8FAF8] px-4 text-slate-400 font-bold tracking-[0.2em]">Compliance Single Sign-On</span>
              </div>
            </div>

            <Button variant="outline" className="w-full h-11 text-xs font-bold border-slate-200 bg-white hover:bg-slate-50 transition-colors gap-3 rounded-lg uppercase tracking-widest" type="button">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
              </svg>
              Corporate SSO Login
            </Button>

            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <ShieldCheck className="h-4 w-4 text-green-700 shrink-0" />
                <p className="text-[10px] leading-relaxed text-green-800 font-bold uppercase tracking-wider">
                  Berau Coal Information Security Policy Active.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

