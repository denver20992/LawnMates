import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import bannerLogo from "@assets/banner-transparent-png.png";
import squareLogo from "@assets/Square-transparent-png.png";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-b from-green-50 to-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <img 
            src={bannerLogo} 
            alt="LawnMates Logo" 
            className="h-12 sm:h-16"
          />
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>
            <Button 
              onClick={() => navigate("/register")}
            >
              Sign Up
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-green-800 mb-4">
                Connecting Property Owners with Trusted Landscapers
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8">
                Find reliable lawn care services or grow your landscaping business with LawnMates - Canada's trusted marketplace for outdoor property maintenance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => navigate("/register?role=property_owner")}
                >
                  I Need Lawn Care
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                  onClick={() => navigate("/register?role=landscaper")}
                >
                  I Provide Lawn Care
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={squareLogo}
                alt="LawnMates Service"
                className="w-full max-w-lg"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-green-800">
            How LawnMates Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-green-800">Post Your Job</h3>
              <p className="text-gray-700">
                Property owners can quickly post lawn care jobs with details about their property and service requirements.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-green-800">Secure Payment</h3>
              <p className="text-gray-700">
                Our escrow payment system holds funds until the job is verified complete, protecting both parties.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-green-800">Verify & Review</h3>
              <p className="text-gray-700">
                Before and after photos verify job completion, and our review system helps build trust in the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of Canadians who are already using LawnMates to simplify their lawn care needs.
          </p>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-green-600"
            onClick={() => navigate("/register")}
          >
            Sign Up Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <img 
              src={bannerLogo} 
              alt="LawnMates Logo" 
              className="h-10 mb-4 md:mb-0"
            />
            <div className="text-gray-600 text-sm">
              © {new Date().getFullYear()} LawnMates. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}