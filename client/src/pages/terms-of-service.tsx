import React from 'react';
import { Link } from 'wouter';
import AppHeader from '@/components/layout/AppHeader';
import MobileMenu from '@/components/layout/MobileMenu';
import { Button } from '@/components/ui/button';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 pb-16 md:pb-0">
      <AppHeader />
      
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600 mb-4">Last Updated: May 10, 2025</p>
            
            <div className="flex space-x-2 mb-8">
              <Link href="/">
                <Button variant="outline" size="sm">Home</Button>
              </Link>
              <Link href="/privacy-policy">
                <Button variant="outline" size="sm">Privacy Policy</Button>
              </Link>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <h2>1. Agreement to Terms</h2>
            <p>
              Welcome to LawnMates. These Terms of Service govern your use of our website, mobile applications, and services. By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
            </p>
            
            <h2>2. Description of Service</h2>
            <p>
              LawnMates is a platform that connects property owners with landscape professionals. We do not provide landscaping services directly. Instead, we facilitate connections between property owners and independent landscape professionals who offer their services through our platform.
            </p>
            
            <h2>3. User Accounts</h2>
            <p>
              To use certain features of our platform, you must register for an account. You must provide accurate and complete information and keep your account information updated. You are responsible for maintaining the security of your account and password. You may not share your account credentials with others. LawnMates cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
            </p>
            
            <h2>4. User Conduct</h2>
            <p>
              Users shall not use the platform to:
            </p>
            <ul>
              <li>Post false, inaccurate, misleading, defamatory, or libelous content</li>
              <li>Harass, abuse, or harm another person</li>
              <li>Impersonate another user or person</li>
              <li>Use the service for any illegal purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Attempt to interfere with the proper functioning of the platform</li>
            </ul>
            
            <h2>5. Payments and Fees</h2>
            <p>
              Property owners agree to pay the agreed price for landscaping services. LawnMates charges a service fee for facilitating connections and processing payments. All payments are processed securely through our third-party payment processor. Landscape professionals will receive payment after the completion of services, subject to our verification process.
            </p>
            
            <h2>6. Verification Process</h2>
            <p>
              To ensure quality service, landscape professionals are required to submit photo verification upon completion of jobs. Property owners have the right to dispute a job if the service does not meet the agreed-upon standards. LawnMates reserves the right to make the final decision on any disputed jobs.
            </p>
            
            <h2>7. Cancellation Policy</h2>
            <p>
              Users may cancel a scheduled service subject to our cancellation policy. Cancellations made less than 24 hours before the scheduled service may incur a cancellation fee. Repeated cancellations may result in account restrictions.
            </p>
            
            <h2>8. Liability Limitation</h2>
            <p>
              LawnMates is not liable for any damages or losses resulting from your use of the service. This includes but is not limited to:
            </p>
            <ul>
              <li>Any direct, indirect, incidental, special, consequential, or punitive damages</li>
              <li>Damages for loss of profits, goodwill, use, data, or other intangible losses</li>
              <li>Damages resulting from the conduct of third parties on the platform</li>
              <li>Damages resulting from acts of nature or circumstances beyond our control</li>
            </ul>
            
            <h2>9. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless LawnMates and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including, without limitation, reasonable legal and accounting fees, arising out of or in any way connected with your access to or use of the service or your violation of these Terms.
            </p>
            
            <h2>10. Termination</h2>
            <p>
              LawnMates may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the service will immediately cease.
            </p>
            
            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
            
            <h2>12. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at support@lawnmates.ca.
            </p>
          </div>
        </div>
      </main>
      
      <MobileMenu />
    </div>
  );
};

export default TermsOfService;