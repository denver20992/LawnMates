import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Check, ArrowRight, ShieldCheck, Star } from "lucide-react";
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
      {/* Header & Navigation */}
      <header className="py-4 bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <img 
            src={bannerLogo} 
            alt="LawnMates Logo" 
            className="h-10 sm:h-12"
          />
          <div className="flex gap-4 items-center">
            <Button 
              variant="ghost" 
              className="text-gray-700 hover:text-green-700"
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 shadow-md transition-all duration-200 hover:shadow-lg"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-green-50 pt-10 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnptLTE4IDE4djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="md:pr-8">
              <div className="inline-block px-3 py-1 mb-5 rounded-full bg-green-100 text-green-800 font-medium text-sm">
                Canada's #1 Lawn Care Marketplace
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="inline bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Connect</span> with Trusted Landscapers
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                Find reliable lawn care services or grow your landscaping business with LawnMates - Canada's trusted marketplace for outdoor property maintenance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center gap-2"
                  onClick={() => navigate("/register?role=property_owner")}
                >
                  I Need Lawn Care
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 transition-all"
                  onClick={() => navigate("/register?role=landscaper")}
                >
                  I Provide Lawn Care
                </Button>
              </div>
              
              <div className="inline-block px-3 py-2 mt-2 rounded-lg bg-green-100 text-green-800 text-sm">
                <span>Trusted by thousands of Canadians</span>
              </div>
            </div>
            
            <div className="flex justify-center relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400 rounded-full filter blur-3xl opacity-20"></div>
              <div className="relative p-1 md:p-4 bg-white rounded-xl shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <img
                  src={squareLogo}
                  alt="LawnMates Service"
                  className="w-full max-w-md rounded-lg transform rotate-negative-1"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-10 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-green-600" />
              <span className="font-medium">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-6 w-6 text-green-600" />
              <span className="font-medium">Verified Landscapers</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-green-600" />
              <span className="font-medium">Trusted by Thousands</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How LawnMates <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our simple process connects property owners with landscapers, ensuring a seamless and secure experience for everyone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="bg-gradient-to-b from-white to-green-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-30 group-hover:scale-125 transition-transform duration-500"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-700 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Post Your Job</h3>
                <p className="text-gray-600">
                  Property owners can quickly post lawn care jobs with details about their property and service requirements.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Detailed job descriptions</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Set your budget</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Schedule flexibly</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gradient-to-b from-white to-green-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-30 group-hover:scale-125 transition-transform duration-500"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-700 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Secure Payment</h3>
                <p className="text-gray-600">
                  Our escrow payment system holds funds until the job is verified complete, protecting both parties.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Secure escrow system</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Payment protection</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Transparent pricing</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gradient-to-b from-white to-green-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-30 group-hover:scale-125 transition-transform duration-500"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-700 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Verify & Review</h3>
                <p className="text-gray-600">
                  Before and after photos verify job completion, and our review system helps build trust in the community.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Photo verification</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Community ratings</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Build your reputation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2Nmg2di02aC02em0wIDBoLTZ2LTZoNnY2em0tMTggMTh2Nmg2di02aC02em0wIDBoLTZ2LTZoNnY2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Lawn Care Experience?
            </h2>
            <p className="text-xl text-green-100 mb-10 leading-relaxed">
              Join thousands of Canadians who are already using LawnMates to simplify their lawn care needs. Get started in minutes!
            </p>
            <Button 
              size="lg" 
              className="bg-white text-green-700 hover:bg-green-50 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 px-8 py-6 text-lg gap-2 flex items-center mx-auto"
              onClick={() => navigate("/register")}
            >
              Sign Up Now
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h3 className="font-bold text-white mb-2">For Property Owners</h3>
                <p className="text-green-100 text-sm">Find trusted landscapers, manage jobs, and ensure quality work.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h3 className="font-bold text-white mb-2">For Landscapers</h3>
                <p className="text-green-100 text-sm">Grow your business, find local jobs, and build your reputation.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h3 className="font-bold text-white mb-2">Secure & Reliable</h3>
                <p className="text-green-100 text-sm">Our platform ensures fair transactions and quality service for all users.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <img 
                src={bannerLogo} 
                alt="LawnMates Logo" 
                className="h-10 mb-4 brightness-150"
              />
              <p className="text-sm text-gray-400 mt-4">
                Connecting property owners with trusted landscapers across Canada.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Find Services</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Become a Landscaper</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-white">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-white">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} LawnMates. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}