// app/privacy/page.tsx
import type { Metadata } from "next";
import MascotHint from "../../components/MascotHint";

export const metadata: Metadata = {
  title: "Privacy Policy - Prank Dial AI",
  description: "Privacy Policy for Prank Dial AI"
};

export default function PrivacyPage() {
  return (
    <div className="blog-post">
      <div className="blog-header">
        <h1>Privacy Policy</h1>
        <p className="blog-intro">Last Updated: January 7, 2026</p>
      </div>
      <MascotHint
        text="Pranklyn says: privacy stays simple here. We only use what keeps the app running safely."
        image="/images/mascot/8CXPHlLAQ4KMkxQv1u594Q.webp"
      />

      <section className="card">
        <h2>1. Information We Collect</h2>

        <h3>Information You Provide</h3>
        <ul>
          <li>Phone numbers you enter to place calls</li>
          <li>Template content, names, and conversation parameters you configure</li>
          <li>Custom templates stored locally in your browser</li>
        </ul>

        <h3>Automatically Collected Information</h3>
        <ul>
          <li>IP addresses for rate limiting and security purposes</li>
          <li>Usage logs (call attempts, timestamps, success/failure status)</li>
          <li>Browser and device information</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide and operate the Service (place calls via third-party APIs)</li>
          <li>Enforce rate limits and prevent abuse</li>
          <li>Detect and prevent fraud, harassment, and illegal activity</li>
          <li>Comply with legal obligations and respond to legal requests</li>
          <li>Improve and maintain the Service</li>
        </ul>

        <h2>3. Information Sharing & Third Parties</h2>
        <p>We share information with the following third parties:</p>

        <h3>Service Providers</h3>
        <ul>
          <li>
            <strong>Vapi.ai</strong> - Voice call infrastructure (phone numbers, call audio, conversation data)
          </li>
          <li>
            <strong>OpenAI</strong> - AI language model processing (conversation content, prompts)
          </li>
          <li>
            <strong>ElevenLabs</strong> - Voice synthesis (text-to-speech conversion)
          </li>
        </ul>

        <p>
          These providers have their own privacy policies and data retention practices. We are not responsible for their
          data handling.
        </p>

        <h3>Legal Compliance</h3>
        <p>We may disclose information to:</p>
        <ul>
          <li>Comply with legal obligations, court orders, or subpoenas</li>
          <li>Protect our rights, property, or safety</li>
          <li>Investigate fraud, abuse, or violations of our Terms of Service</li>
          <li>Cooperate with law enforcement investigations</li>
        </ul>

        <h2>4. Call Recordings</h2>
        <p>
          If you enable call recording, audio recordings are stored by Vapi.ai according to their retention policies.
          <strong> You are solely responsible for obtaining proper consent before recording calls.</strong>
        </p>

        <h2>5. Data Retention</h2>
        <ul>
          <li>Rate limiting data: Stored in memory for 1 hour, then automatically deleted</li>
          <li>Audit logs: Retained for security and compliance purposes (implementation dependent)</li>
          <li>Call recordings: Retained by Vapi.ai per their policies</li>
          <li>Custom templates: Stored locally in your browser only</li>
        </ul>

        <h2>6. Your Rights & Choices</h2>

        <h3>California Residents (CCPA)</h3>
        <p>California residents have the right to:</p>
        <ul>
          <li>Know what personal information we collect and how we use it</li>
          <li>Request deletion of your personal information</li>
          <li>Opt-out of the sale of personal information (we do not sell personal information)</li>
        </ul>

        <h3>European Users (GDPR)</h3>
        <p>EU/EEA users have the right to:</p>
        <ul>
          <li>Access, correct, or delete your personal data</li>
          <li>Object to processing or request data portability</li>
          <li>Withdraw consent at any time</li>
          <li>Lodge a complaint with a supervisory authority</li>
        </ul>

        <p>
          <strong>Note:</strong> This Service is primarily intended for US users. If you are located in the EU/EEA,
          please be aware that your data will be transferred to and processed in the United States.
        </p>

        <h2>7. Security</h2>
        <p>We implement security measures including:</p>
        <ul>
          <li>HTTPS encryption for all data transmission</li>
          <li>Rate limiting to prevent abuse</li>
          <li>Content moderation to detect prohibited activity</li>
          <li>Audit logging of security events</li>
          <li>Secure storage of API credentials</li>
        </ul>

        <h2>8. Children's Privacy</h2>
        <p>
          The Service is not intended for users under 18 years of age. We do not knowingly collect personal information
          from children under 18. If we learn we have collected such information, we will delete it immediately.
        </p>

        <h2>9. Cookies & Tracking</h2>
        <p>
          We use minimal tracking. Custom templates are stored in your browser's localStorage only. We do not use
          third-party advertising cookies.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The "Last Updated" date will reflect any changes.
          Continued use of the Service after changes constitutes acceptance of the updated policy.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          For privacy-related questions or to exercise your rights, please contact us at the support channel provided in
          the application.
        </p>
      </section>
    </div>
  );
}
