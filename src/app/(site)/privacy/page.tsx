import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <p>This policy explains what personal information Fitness World collects through this website and how it is used.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Enquiries: name, mobile number, optional email, training interest, goal, preferred contact time and your message.</li>
        <li>Members: name, email, mobile number, membership and payment records, and any progress data you choose to log.</li>
        <li>Payments are processed by Razorpay. We store transaction references and amounts, never card numbers, UPI PINs or bank credentials.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To respond to your enquiry by phone, WhatsApp or email, as you agreed when submitting the form.</li>
        <li>To provide your membership, issue receipts and send account emails such as password resets.</li>
        <li>We do not sell your data. Marketing messages are sent only if you opt in, and you can opt out at any time.</li>
      </ul>
      <h2>Chat assistant</h2>
      <p>
        Messages you send to FITBOT are processed by an AI service provider to generate replies. Please don&apos;t share
        health, payment or other sensitive details in the chat.
      </p>
      <h2>Your choices</h2>
      <p>
        You can view and update your profile in My Fitness, or ask us to correct or delete your data by contacting the
        gym. [Placeholder: add the data-protection contact and retention periods.]
      </p>
    </LegalPage>
  );
}
