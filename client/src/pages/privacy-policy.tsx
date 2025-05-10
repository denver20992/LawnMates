import React from 'react';
import { Link } from 'wouter';
import AppHeader from '@/components/layout/AppHeader';
import MobileMenu from '@/components/layout/MobileMenu';
import { Button } from '@/components/ui/button';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 pb-16 md:pb-0">
      <AppHeader />
      
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600 mb-4">Last Updated: May 10, 2025</p>
            
            <div className="flex space-x-2 mb-8">
              <Link href="/">
                <Button variant="outline" size="sm">Home</Button>
              </Link>
              <Link href="/terms-of-service">
                <Button variant="outline" size="sm">Terms of Service</Button>
              </Link>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <h2>1. Introduction</h2>
            <p>
              LawnMates ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
            
            <h2>2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when you:
            </p>
            <ul>
              <li>Register for an account</li>
              <li>Complete a profile</li>
              <li>Post a job</li>
              <li>Submit job verifications</li>
              <li>Communicate with other users</li>
              <li>Contact customer support</li>
              <li>Participate in surveys or promotions</li>
            </ul>
            <p>
              This information may include:
            </p>
            <ul>
              <li>Name, email address, phone number, and mailing address</li>
              <li>Username and password</li>
              <li>Payment information (stored by our payment processor, not by us)</li>
              <li>Property information including addresses and photos</li>
              <li>Communication content between users</li>
              <li>Verification photos and job details</li>
              <li>Profile information including skills, experience, and preferences</li>
            </ul>
            
            <h2>3. Automatically Collected Information</h2>
            <p>
              When you access our platform, we may automatically collect:
            </p>
            <ul>
              <li>Device information (e.g., IP address, browser type, operating system)</li>
              <li>Usage data (e.g., pages visited, time spent on pages, links clicked)</li>
              <li>Location data (with your permission)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
            
            <h2>4. How We Use Your Information</h2>
            <p>
              We may use the information we collect to:
            </p>
            <ul>
              <li>Create and manage your account</li>
              <li>Provide and improve our services</li>
              <li>Connect property owners with landscape professionals</li>
              <li>Process payments and transactions</li>
              <li>Verify job completion and quality</li>
              <li>Communicate with you about services, updates, and promotions</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Protect against fraud and unauthorized access</li>
              <li>Enforce our terms of service and other policies</li>
            </ul>
            
            <h2>5. Information Sharing and Disclosure</h2>
            <p>
              We may share your information with:
            </p>
            <ul>
              <li>Other users as necessary to facilitate services (e.g., property owners see landscape professionals' profiles and vice versa)</li>
              <li>Service providers who perform services on our behalf (e.g., payment processing, data analysis, email delivery)</li>
              <li>Legal authorities when required by law or to protect our rights</li>
              <li>Business partners with your consent</li>
              <li>Affiliated companies as part of our regular business operations</li>
            </ul>
            
            <h2>6. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide you services, comply with legal obligations, resolve disputes, and enforce our agreements.
            </p>
            
            <h2>7. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
            </p>
            
            <h2>8. Your Choices and Rights</h2>
            <p>
              You may have the following rights regarding your personal information:
            </p>
            <ul>
              <li>Access, update, or delete your personal information</li>
              <li>Object to the processing of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your data</li>
              <li>Withdraw consent where applicable</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
            </p>
            
            <h2>9. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 18. We do not knowingly collect or solicit personal information from children. If we learn that we have collected personal information from a child under 18, we will delete that information as quickly as possible.
            </p>
            
            <h2>10. Changes to This Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new privacy policy on this page and updating the "Last Updated" date.
            </p>
            
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions or concerns about this privacy policy or our privacy practices, please contact us at privacy@lawnmates.ca.
            </p>
          </div>
        </div>
      </main>
      
      <MobileMenu />
    </div>
  );
};

export default PrivacyPolicy;