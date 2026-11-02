import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = { title: "Terms of membership" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of membership">
      <h2>Membership</h2>
      <ul>
        <li>A membership starts when your payment is verified and runs for the number of days shown at checkout.</li>
        <li>Renewing before your membership ends adds the new period on top of your current end date.</li>
        <li>Memberships are personal and cannot be transferred.</li>
      </ul>
      <h2>Payments</h2>
      <ul>
        <li>Prices are shown in Indian rupees and are charged once per billing period. There is no automatic renewal.</li>
        <li>[Placeholder: refund, freeze and cancellation policy to be provided by the gym.]</li>
      </ul>
      <h2>Health and safety</h2>
      <ul>
        <li>Consult a doctor before starting a new exercise or nutrition programme, especially if you have a medical condition.</li>
        <li>Follow coach instructions and gym rules. Report any injury or unsafe equipment to staff immediately.</li>
        <li>Training and nutrition content on this website is general guidance, not medical advice.</li>
      </ul>
    </LegalPage>
  );
}
