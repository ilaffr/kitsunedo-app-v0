import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Index from "./pages/Index";
import Lesson1 from "./pages/Lesson1";
import Lesson2 from "./pages/Lesson2";
import Lesson3 from "./pages/Lesson3";
import Lesson4 from "./pages/Lesson4";
import Lesson5 from "./pages/Lesson5";
import Lesson6 from "./pages/Lesson6";
import Lesson7 from "./pages/Lesson7";
import Lesson8 from "./pages/Lesson8";
import Lesson9 from "./pages/Lesson9";
import Lesson10 from "./pages/Lesson10";
import DailyPractice from "./pages/DailyPractice";
import KanjiWritingPractice from "./pages/KanjiWritingPractice";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Lessons from "./pages/Lessons";
import Flashcards from "./pages/Flashcards";
import Stats from "./pages/Stats";
import Bestiary from "./pages/Bestiary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route path="/lesson/1" element={<ProtectedRoute><Lesson1 /></ProtectedRoute>} />
            <Route path="/lesson/2" element={<ProtectedRoute><Lesson2 /></ProtectedRoute>} />
            <Route path="/lesson/3" element={<ProtectedRoute><Lesson3 /></ProtectedRoute>} />
            <Route path="/lesson/4" element={<ProtectedRoute><Lesson4 /></ProtectedRoute>} />
            <Route path="/lesson/5" element={<ProtectedRoute><Lesson5 /></ProtectedRoute>} />
            <Route path="/lesson/6" element={<ProtectedRoute><Lesson6 /></ProtectedRoute>} />
            <Route path="/lesson/7" element={<ProtectedRoute><Lesson7 /></ProtectedRoute>} />
            <Route path="/lesson/8" element={<ProtectedRoute><Lesson8 /></ProtectedRoute>} />
            <Route path="/lesson/9" element={<ProtectedRoute><Lesson9 /></ProtectedRoute>} />
            <Route path="/lesson/10" element={<ProtectedRoute><Lesson10 /></ProtectedRoute>} />
            <Route
              path="/daily-practice"
              element={
                <ProtectedRoute>
                  <DailyPractice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kanji-writing"
              element={
                <ProtectedRoute>
                  <KanjiWritingPractice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons"
              element={
                <ProtectedRoute>
                  <Lessons />
                </ProtectedRoute>
              }
            />
            <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
            <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
            <Route path="/bestiary" element={<ProtectedRoute><Bestiary /></ProtectedRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
