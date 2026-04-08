import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff } from "lucide-react";
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
    <div className="min-h-screen flex bg-surface-sunken">
      {/* Left branding strip */}
      <div className="hidden lg:flex w-80 bg-sidebar flex-col justify-between p-8">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-8 w-8 text-sidebar-primary" />
            <div>
              <div className="text-base font-bold text-sidebar-accent-foreground">AI Safety</div>
              <div className="text-xs text-sidebar-foreground">Investigation Workspace</div>
            </div>
          </div>
          <div className="space-y-4 mt-16">
            <p className="text-sm text-sidebar-foreground leading-relaxed">
              Enterprise-grade investigation platform for safety incident analysis, evidence management, and compliance reporting.
            </p>
          </div>
        </div>
        <div className="text-2xs text-sidebar-foreground/60">
          © 2026 AI Safety Investigation Workspace. All rights reserved.
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-sm font-bold">AI Safety Investigation</span>
          </div>

          <h1 className="text-lg font-semibold text-foreground mb-1">Sign in to your account</h1>
          <p className="text-xs text-muted-foreground mb-6">
            Enter your credentials to access the investigation workspace.
          </p>

          <Button variant="outline" className="w-full h-9 text-xs mb-4 gap-2" type="button">
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in with Google SSO
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-2xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Email</label>
              <Input
                type="email"
                placeholder="name@company.com"
                className="h-9 text-sm"
                defaultValue="john.doe@company.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="h-9 text-sm pr-9"
                  defaultValue="password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <Checkbox className="h-3.5 w-3.5" />
                Remember this device
              </label>
              <button type="button" className="text-xs text-primary hover:underline">
                Forgot password?
              </button>
            </div>
            <Button type="submit" className="w-full h-9 text-xs">
              Sign In
            </Button>
          </form>

          <div className="mt-6 p-3 rounded bg-surface-sunken border">
            <p className="text-2xs text-muted-foreground leading-relaxed">
              🔒 This system is for authorized personnel only. All access is logged and audited. Unauthorized use may result in disciplinary action and legal prosecution.
            </p>
          </div>

          <p className="text-2xs text-muted-foreground text-center mt-4">
            Organization: <span className="font-medium text-foreground">Acme Mining Corp</span>
          </p>
        </div>
      </div>
    </div>
  );
}
