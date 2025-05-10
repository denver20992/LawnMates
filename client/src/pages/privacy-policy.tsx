import React from 'react';
import { Link } from 'wouter';
import AppHeader from '@/components/layout/AppHeader';
import MobileMenu from '@/components/layout/MobileMenu';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
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
          <h1>Privacy Policy</h1>
          
          <p className="lead">
            At LawnMates, we take your privacy seriously. This Privacy Policy describes how we collect, use, 
            and share your personal information when you use our platform.
          </p>
          
          <p><strong>Last Updated:</strong> May 10, 2025</p>
          
          <h2>1. Information We Collect</h2>
          
          <h3>Information you provide to us:</h3>
          <ul>
            <li>Account information (name, email, phone number, password)</li>
            <li>Profile information (profile picture, skills, experience)</li>
            <li>Property details (address, property size, yard type)</li>
            <li>Payment information (processed securely through our payment processor)</li>
            <li>Communications (messages between users, support inquiries)</li>
            <li>Service verification photos (uploaded by landscapers to verify completed work)</li>
            <li>Reviews and ratings</li>
          </ul>
          
          <h3>Information collected automatically:</h3>
          <ul>
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Usage information (pages visited, actions taken, time spent)</li>
            <li>Location information (with your permission, to show relevant services)</li>
            <li>Cookies and similar technologies (to improve your experience and analyze usage patterns)</li>
          </ul>
          
          <h2>2. How We Use Your Information</h2>
          
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Connect property owners with landscapers</li>
            <li>Process payments and hold funds in escrow</li>
            <li>Verify completed services</li>
            <li>Communicate with you about your account and services</li>
            <li>Send you updates, marketing communications, and service recommendations</li>
            <li>Prevent fraud and ensure security</li>
            <li>Comply with legal obligations</li>
            <li>Analyze usage patterns to improve our platform</li>
          </ul>
          
          <h2>3. Information Sharing</h2>
          
          <p>We may share your information with:</p>
          <ul>
            <li>Other users as necessary to facilitate services (e.g., property owners can see landscaper profiles, landscapers can see property details)</li>
            <li>Service providers who help us operate our platform (payment processors, cloud hosting, analytics)</li>
            <li>Legal and regulatory authorities when required by law</li>
            <li>Potential buyers in the event of a sale or merger (your information would remain subject to this privacy policy)</li>
          </ul>
          
          <p>We do not sell your personal information to third parties.</p>
          
          <h2>4. Data Security</h2>
          
          <p>
            We implement appropriate technical and organizational measures to protect your personal information. 
            However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
          </p>
          
          <h2>5. Your Rights and Choices</h2>
          
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Delete your personal information</li>
            <li>Object to or restrict certain processing</li>
            <li>Data portability</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          
          <p>
            You can exercise many of these rights through your account settings. For additional requests, 
            please contact us at privacy@lawnmates.ca.
          </p>
          
          <h2>6. Cookies and Similar Technologies</h2>
          
          <p>
            We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
            and deliver personalized content. You can control cookies through your browser settings, 
            but this may affect the functionality of our services.
          </p>
          
          <h2>7. Children's Privacy</h2>
          
          <p>
            LawnMates is not intended for use by children under 18 years of age. 
            We do not knowingly collect personal information from children under 18.
          </p>
          
          <h2>8. Changes to This Privacy Policy</h2>
          
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes 
            by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          
          <h2>9. International Data Transfers</h2>
          
          <p>
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place to protect your information when transferred internationally.
          </p>
          
          <h2>10. Contact Us</h2>
          
          <p>
            If you have any questions or concerns about our Privacy Policy or data practices, 
            please contact us at privacy@lawnmates.ca.
          </p>
        </div>
      </main>
      
      <MobileMenu />
    </div>
  );
};

export default PrivacyPolicy;