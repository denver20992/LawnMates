import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { useAuth } from "@/hooks/useAuth";

import Dashboard from "@/pages/dashboard";
import LandingPage from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import JobsPage from "@/pages/jobs/index";
import JobPostPage from "@/pages/jobs/post";
import MessagesPage from "@/pages/messages/index";
import ProfilePage from "@/pages/profile";
import ReviewsPage from "@/pages/reviews";
import AdminPage from "@/pages/admin/index";
import Checkout from "@/pages/checkout";
import SavedPropertiesPage from "@/pages/properties/saved";
import AddPropertyPage from "@/pages/properties/add";
import TermsOfService from "@/pages/terms-of-service";
import PrivacyPolicy from "@/pages/privacy-policy";
import PaymentsPage from "@/pages/payments";
import WebSocketTestPage from "@/pages/websocket-test";
import WebSocketSimpleTestPage from "@/pages/websocket-simple-test";
import PublicWebSocketTest from "@/pages/public-ws-test";
import NotFound from "@/pages/not-found";

// Route component that redirects to login if not authenticated
function PrivateRoute({ component: Component, adminOnly = false, ...rest }: any) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Redirect to="/dashboard" />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Private routes */}
      <Route path="/dashboard">
        <PrivateRoute component={Dashboard} />
      </Route>
      <Route path="/jobs">
        <PrivateRoute component={JobsPage} />
      </Route>
      <Route path="/jobs/post">
        <PrivateRoute component={JobPostPage} />
      </Route>
      <Route path="/jobs/mine">
        <PrivateRoute component={JobsPage} />
      </Route>
      <Route path="/messages">
        <PrivateRoute component={MessagesPage} />
      </Route>
      <Route path="/profile">
        <PrivateRoute component={ProfilePage} />
      </Route>
      <Route path="/reviews">
        <PrivateRoute component={ReviewsPage} />
      </Route>
      <Route path="/admin">
        <PrivateRoute component={AdminPage} adminOnly={true} />
      </Route>
      <Route path="/checkout">
        <PrivateRoute component={Checkout} />
      </Route>
      <Route path="/properties">
        <PrivateRoute component={SavedPropertiesPage} />
      </Route>
      <Route path="/properties/saved">
        <PrivateRoute component={SavedPropertiesPage} />
      </Route>
      <Route path="/properties/add">
        <PrivateRoute component={AddPropertyPage} />
      </Route>
      <Route path="/payments">
        <PrivateRoute component={PaymentsPage} />
      </Route>
      <Route path="/checkout">
        <PrivateRoute component={Checkout} />
      </Route>
      <Route path="/websocket-test">
        <PrivateRoute component={WebSocketTestPage} />
      </Route>
      <Route path="/websocket-simple" component={WebSocketSimpleTestPage} />
      <Route path="/public-ws-test" component={PublicWebSocketTest} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      
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
