// app/terms/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Prank Dial AI",
  description: "Terms of Service for Prank Dial AI"
};

export default function TermsPage() {
  return (
    <div className="blog-post">
      <div className="blog-header">
        <h1>Terms of Service</h1>
        <p className="blog-intro">Last Updated: January 7, 2026</p>
      </div>

      <section className="card">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using Prank Dial AI ("Service"), you agree to be bound by these Terms of Service. If you do
          not agree to these terms, do not use the Service.
        </p>

        <h2>2. Service Description</h2>
        <p>
          Prank Dial AI is an entertainment platform that enables users to create and place automated prank phone calls
          using AI-powered voice technology. The Service is intended solely for entertainment purposes between consenting
          parties.
        </p>

        <h2>3. User Responsibilities & Prohibited Conduct</h2>
        <p>You agree that you will NOT use this Service to:</p>
        <ul>
          <li>Harass, threaten, intimidate, or cause distress to any person</li>
          <li>Impersonate law enforcement, government agencies, financial institutions, or medical professionals</li>
          <li>Commit fraud, scams, or any illegal activity</li>
          <li>Attempt to obtain sensitive personal information (SSN, credit cards, passwords, etc.)</li>
          <li>Make threatening or abusive calls</li>
          <li>Call emergency services (911, etc.)</li>
          <li>Violate any local, state, federal, or international laws</li>
          <li>Place calls to individuals who have not consented to receive prank calls</li>
          <li>Record calls without proper consent as required by applicable law</li>
        </ul>

        <h2>4. Legal Compliance - TCPA & Recording Laws</h2>
        <p>
          <strong>YOU are solely responsible for ensuring your use of this Service complies with all applicable laws,
          including but not limited to:</strong>
        </p>
        <ul>
          <li>
            <strong>Telephone Consumer Protection Act (TCPA)</strong> - You must have prior express consent before
            placing automated calls
          </li>
          <li>
            <strong>Call Recording Laws</strong> - You must comply with federal and state recording consent laws:
            <ul>
              <li>One-party consent states: At least one party (you) must consent to the recording</li>
              <li>Two-party/All-party consent states: ALL parties must consent to the recording</li>
            </ul>
          </li>
          <li>State-specific telemarketing and harassment laws</li>
        </ul>

        <h2>5. Age Requirement</h2>
        <p>
          You must be at least 18 years of age to use this Service. By using the Service, you represent that you are 18
          or older.
        </p>

        <h2>6. Rate Limits & Usage Restrictions</h2>
        <p>We implement the following rate limits to prevent abuse:</p>
        <ul>
          <li>2 free calls per day per IP address</li>
          <li>20 dry-run tests per hour per IP address</li>
        </ul>
        <p>We reserve the right to modify these limits or suspend accounts that abuse the Service.</p>

        <h2>7. Content Moderation</h2>
        <p>
          We employ automated content moderation to detect and block prohibited content. Attempts to bypass our
          moderation systems will result in immediate service termination.
        </p>

        <h2>8. No Warranties & Limitation of Liability</h2>
        <p>
          THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE ARE NOT LIABLE FOR ANY DAMAGES ARISING FROM
          YOUR USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO LEGAL PENALTIES, FINES, OR DAMAGES RESULTING FROM YOUR
          VIOLATIONS OF APPLICABLE LAWS.
        </p>

        <h2>9. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless Prank Dial AI, its operators, and affiliates from any claims,
          damages, or expenses arising from your use of the Service or your violation of these Terms.
        </p>

        <h2>10. Service Termination</h2>
        <p>
          We reserve the right to terminate or suspend your access to the Service at any time, without notice, for
          conduct that we believe violates these Terms or is harmful to other users or us.
        </p>

        <h2>11. Changes to Terms</h2>
        <p>
          We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of
          the modified Terms.
        </p>

        <h2>12. Governing Law</h2>
        <p>
          These Terms are governed by the laws of the United States and the state where the Service operator is located,
          without regard to conflict of law principles.
        </p>

        <h2>13. Contact</h2>
        <p>
          For questions about these Terms, please contact us at the support channel provided in the application.
        </p>
      </section>
    </div>
  );
}
