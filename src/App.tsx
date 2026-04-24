import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "./pages/LoginPage";
import CaseListPage from "./pages/CaseListPage";
import CreateCasePage from "./pages/CreateCasePage";
import CaseWorkspacePage from "./pages/CaseWorkspacePage";
import ReviewApprovalPage from "./pages/ReviewApprovalPage";
import AuditTrailPage from "./pages/AuditTrailPage";
import AdminPage from "./pages/AdminPage";
import ExecutiveViewPage from "./pages/ExecutiveViewPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cases" element={<CaseListPage />} />
          <Route path="/cases/new" element={<CreateCasePage />} />
          <Route path="/cases/:caseId" element={<CaseWorkspacePage />} />

          <Route path="/review" element={<ReviewApprovalPage />} />
          <Route path="/audit-trail" element={<AuditTrailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/executive" element={<ExecutiveViewPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
