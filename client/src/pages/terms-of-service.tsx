import React from 'react';
import { Link } from 'wouter';
import AppHeader from '@/components/layout/AppHeader';
import MobileMenu from '@/components/layout/MobileMenu';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="flex-grow container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="prose prose-green max-w-none">
          <h1>Terms of Service</h1>
          
          <p className="lead">
            Welcome to LawnMates. By using our platform, you agree to these Terms of Service.
            Please read them carefully before using our services.
          </p>
          
          <p><strong>Last Updated:</strong> May 10, 2025</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the LawnMates platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
          
          <h2>2. Description of Service</h2>
          <p>
            LawnMates is a platform that connects property owners with lawn care professionals. We facilitate the arrangement of lawn care services but are not responsible for the actual provision of these services.
          </p>
          
          <h2>3. User Accounts</h2>
          <p>
            To use certain features of LawnMates, you must register for an account. You agree to provide accurate and complete information during the registration process and to update such information to keep it accurate and current.
          </p>
          <p>
            You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
          
          <h2>4. User Conduct</h2>
          <p>
            Users of LawnMates agree to:
          </p>
          <ul>
            <li>Comply with all applicable laws and regulations</li>
            <li>Respect the rights and privacy of others</li>
            <li>Provide accurate information about their properties or services</li>
            <li>Fulfill obligations related to booked services</li>
            <li>Communicate respectfully with other users</li>
            <li>Not engage in fraudulent, deceptive, or misleading activities</li>
          </ul>
          
          <h2>5. Payment Terms</h2>
          <p>
            Property owners agree to pay for services as described at the time of booking. Payments are securely processed through our platform and held in escrow until services are verified as complete.
          </p>
          <p>
            Landscapers agree to our service fee structure, which will be clearly communicated before signup and may be updated from time to time.
          </p>
          
          <h2>6. Service Verification</h2>
          <p>
            Landscapers must provide photo verification of completed work. Property owners must verify that work has been completed satisfactorily before funds are released from escrow.
          </p>
          
          <h2>7. Cancellation Policy</h2>
          <p>
            Cancellation policies will be clearly communicated during the booking process. Cancellations may result in fees depending on timing and circumstances.
          </p>
          
          <h2>8. Limitation of Liability</h2>
          <p>
            LawnMates is not liable for the quality of services provided by landscapers, property conditions, or disputes between users. We provide a platform for connection but do not guarantee outcomes.
          </p>
          
          <h2>9. Privacy</h2>
          <p>
            Your use of LawnMates is also governed by our Privacy Policy, which can be found <Link href="/privacy-policy" className="text-primary hover:underline">here</Link>.
          </p>
          
          <h2>10. Modifications to Terms</h2>
          <p>
            LawnMates reserves the right to modify these terms at any time. We will provide notice of significant changes through the platform or via email.
          </p>
          
          <h2>11. Termination</h2>
          <p>
            We reserve the right to terminate or suspend accounts that violate these terms or engage in inappropriate behavior on our platform.
          </p>
          
          <h2>12. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at support@lawnmates.ca.
          </p>
        </div>
      </main>
      
      <MobileMenu />
    </div>
  );
};

export default TermsOfService;