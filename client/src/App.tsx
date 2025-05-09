import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import JobsPage from "@/pages/jobs/index";
import JobPostPage from "@/pages/jobs/post";
import MessagesPage from "@/pages/messages/index";
import ProfilePage from "@/pages/profile";
import AdminPage from "@/pages/admin/index";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/jobs" component={JobsPage} />
      <Route path="/jobs/post" component={JobPostPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
