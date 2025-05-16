import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface LegalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

const LegalDialog: React.FC<LegalDialogProps> = ({
  isOpen,
  onClose,
  title,
  content,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2c3e50] mb-2">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="text-gray-700 leading-relaxed space-y-4">{content}</div>
      </DialogContent>
    </Dialog>
  );
};

const Footer: React.FC = () => {
  const [dialogContent, setDialogContent] = useState<{
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
  }>({
    isOpen: false,
    title: "",
    content: null,
  });

  const openDialog = (title: string, content: React.ReactNode) => {
    setDialogContent({
      isOpen: true,
      title,
      content,
    });
  };

  const closeDialog = () => {
    setDialogContent({
      ...dialogContent,
      isOpen: false,
    });
  };

  const privacyPolicyContent = (
    <div className="space-y-4">
      <p className="font-semibold">Effective Date: January, 5th, 2025</p>

      <div>
        <h3 className="font-bold text-lg">1. Introduction</h3>
        <p>
          At PayNomad Capital Ltd. ("PayNomad," "we," "us," or "our"), we are
          dedicated to safeguarding the privacy and security of your personal
          information. This Privacy Policy outlines how we collect, use,
          disclose, and protect your personal information in accordance with the
          Personal Information Protection and Electronic Documents Act (PIPEDA)
          and other applicable Canadian laws, including regulations tied to our
          Money Service Business (MSB) license issued by the Financial
          Transactions and Reports Analysis Centre of Canada (FINTRAC).
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">2. Scope</h3>
        <p>
          This Privacy Policy applies to all personal information collected from
          clients, website visitors, and users of our financial services,
          including cryptocurrency and digital asset management, currency
          exchange, cross-border payments, remittance services, and
          multi-currency accounts.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">3. Information We Collect</h3>
        <p>We collect the following types of personal information:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <span className="font-medium">Identification Information:</span>{" "}
            Name, address, date of birth, nationality, and government-issued
            identification (e.g., passport, driver's license).
          </li>
          <li>
            <span className="font-medium">Contact Information:</span> Email
            address, phone number, and mailing address.
          </li>
          <li>
            <span className="font-medium">Financial Information:</span> Bank
            account details, credit/debit card information, transaction history,
            and cryptocurrency wallet addresses.
          </li>
          <li>
            <span className="font-medium">Verification Information:</span> Data
            required for anti-money laundering (AML) and counter-terrorist
            financing (CTF) compliance, such as source of funds and occupation.
          </li>
          <li>
            <span className="font-medium">Technical Information:</span> IP
            address, browser type, device information, and website usage data.
          </li>
          <li>
            <span className="font-medium">Sensitive Information:</span> In some
            cases, with your explicit consent, we may collect additional
            sensitive data, such as biometric information or detailed financial
            profiles.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg">4. How We Use Your Information</h3>
        <p>We use your personal information to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Provide and manage our financial services, including account setup,
            transaction processing, and customer support.
          </li>
          <li>
            Comply with legal and regulatory obligations, including AML and CTF
            requirements under FINTRAC.
          </li>
          <li>
            Prevent fraud, money laundering, and other illegal activities.
          </li>
          <li>
            Enhance our services, website functionality, and user experience.
          </li>
          <li>
            Communicate with you regarding your account, transactions, and
            service updates.
          </li>
          <li>
            Conduct risk assessments and maintain the security of our systems.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg">5. Disclosure of Your Information</h3>
        <p>We may disclose your personal information to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Regulatory authorities, such as FINTRAC, to meet legal requirements.
          </li>
          <li>
            Service providers (e.g., payment processors, IT vendors) under
            strict confidentiality agreements.
          </li>
          <li>
            Financial institutions and payment networks (e.g., Interac
            e-Transfer, ACH, SWIFT, IBAN, International Payment Networks (IPN)
            (Visa/Mastercard) to facilitate transactions.
          </li>
          <li>Law enforcement or government agencies, if required by law.</li>
          <li>
            Third parties with your consent or as necessary to complete a
            transaction.
          </li>
        </ul>
        <p>We do not sell or rent your personal information.</p>
      </div>

      <div>
        <h3 className="font-bold text-lg">6. Data Security</h3>
        <p>
          We employ robust safeguards to protect your personal information,
          including:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Encryption of sensitive data.</li>
          <li>Secure storage systems and access controls.</li>
          <li>Regular security audits and vulnerability assessments.</li>
          <li>Employee training on data protection protocols.</li>
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg">7. Your Rights</h3>
        <p>Under PIPEDA, you have the right to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access your personal information held by us.</li>
          <li>Correct inaccurate or incomplete information.</li>
          <li>
            Withdraw consent for certain uses of your information (where
            applicable).
          </li>
          <li>
            Request deletion of your information, subject to legal retention
            obligations.
          </li>
        </ul>
        <p>
          To exercise these rights, contact our Privacy Officer at the details
          provided below.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">8. Cross-Border Data Transfers</h3>
        <p>
          As a global financial services provider, we may transfer your personal
          information outside Canada. We ensure such transfers comply with
          PIPEDA and are protected by appropriate safeguards.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">9. Retention of Information</h3>
        <p>
          We retain your personal information only as long as necessary to
          fulfill the purposes outlined in this Privacy Policy or as required by
          law, including FINTRAC retention obligations.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">10. Updates to This Policy</h3>
        <p>
          We may update this Privacy Policy periodically. Material changes will
          be communicated via our website or other channels.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">11. Contact Us</h3>
        <p>
          For questions or concerns about this Privacy Policy, please contact:
        </p>
        <p>PayNomad Capital Ltd.</p>
        <p>Privacy Officer</p>
        <p>810 Quayside Dr. Unit #205</p>
        <p>New Westminster, British Columbia</p>
        <p>V3M 6B9, Canada</p>
        <p>Email: info@paynomadcapitalltd.ca</p>
      </div>
    </div>
  );

  const termsOfServiceContent = (
    <div className="space-y-4">
      <p className="font-semibold">Effective Date: January 5th, 2025</p>

      <div>
        <h3 className="font-bold text-lg">1. Agreement to Terms</h3>
        <p>
          By accessing or using the services of PayNomad Capital Ltd.
          ("PayNomad," "we," "us," or "our"), you agree to these Terms of
          Service ("Terms"). If you do not agree, you may not use our services.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">2. Services Description</h3>
        <p>
          PayNomad provides financial services tailored to high-net-worth
          individuals (HNWIs) with assets exceeding $2 million, including:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Cryptocurrency and digital asset management with non-custodial
            digital wallets.
          </li>
          <li>Currency exchange and cross-border payment solutions.</li>
          <li>Remittance services for individuals and businesses.</li>
          <li>
            Multi-currency accounts connected to payment networks such as
            Interac e-Transfer (Canada), ACH (USA), SWIFT (international), IBAN
            (Europe) and International Payment Networks (IPN) (Visa/Mastercard).
            Debit Card Services for individuals and businesses.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg">3. Eligibility</h3>
        <p>To use our services, you must:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Be at least 18 years old.</li>
          <li>
            Provide accurate and complete information during registration.
          </li>
          <li>
            Comply with all applicable laws, including AML and CTF regulations.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg">4. Account Management</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <span className="font-medium">Account Opening:</span> Requires
            identity verification and AML/CTF checks.
          </li>
          <li>
            <span className="font-medium">Account Maintenance:</span> You are
            responsible for securing your account credentials and reporting
            unauthorized access immediately.
          </li>
          <li>
            <span className="font-medium">Fees:</span> Service fees will be
            disclosed prior to transactions.
          </li>
          <li>
            <span className="font-medium">Account Closure:</span> You may close
            your account at any time, subject to settling outstanding
            obligations.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg">5. Transactions</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <span className="font-medium">Processing:</span> Transactions follow
            timelines and procedures outlined in our service agreements.
          </li>
          <li>
            <span className="font-medium">Fees and Limits:</span> Details will
            be provided before transaction confirmation.
          </li>
          <li>
            <span className="font-medium">Irreversibility:</span> Some
            transactions (e.g., cryptocurrency transfers) may be irreversible;
            we are not liable for losses from user errors.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg">6. Prohibited Activities</h3>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Use our services for illegal purposes (e.g., money laundering,
            fraud).
          </li>
          <li>Provide false or misleading information.</li>
          <li>Engage in activities that harm our systems or other users.</li>
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg">7. Liability and Disclaimers</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <span className="font-medium">Limitation of Liability:</span> We are
            not liable for indirect, incidental, or consequential damages, to
            the extent permitted by law.
          </li>
          <li>
            <span className="font-medium">Service Availability:</span> We aim
            for uninterrupted service but do not guarantee constant
            availability.
          </li>
          <li>
            <span className="font-medium">Market Risks:</span> You accept the
            volatility of financial markets, including cryptocurrencies, and we
            are not responsible for related losses.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg">8. Intellectual Property</h3>
        <p>
          All content, trademarks, and intellectual property related to our
          services are owned by PayNomad and protected by law.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">9. Termination</h3>
        <p>
          We may suspend or terminate your account for violations of these Terms
          or prohibited activities. You may terminate your account by contacting
          us.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">10. Governing Law</h3>
        <p>
          These Terms are governed by the laws of British Columbia and Canada.
          Disputes will be resolved in British Columbia courts.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">11. Dispute Resolution</h3>
        <p>
          Disputes should first be addressed through negotiation. Unresolved
          disputes may proceed to arbitration under the British Columbia
          International Commercial Arbitration Centre rules.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">12. Updates to These Terms</h3>
        <p>
          We may update these Terms, notifying you of material changes.
          Continued use constitutes acceptance.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">13. Contact Us</h3>
        <p>For questions about these Terms, contact:</p>
        <p>PayNomad Capital Ltd.</p>
        <p>810 Quayside Dr. Unit #205</p>
        <p>New Westminster, British Columbia</p>
        <p>V3M 6B9, Canada</p>
        <p>Email: info@paynomadcapitalltd.ca</p>
      </div>
    </div>
  );

  const cookiePolicyContent = (
    <div className="space-y-4">
      <p className="font-semibold">Effective Date: January 5th, 2025</p>

      <div>
        <h3 className="font-bold text-lg">1. What Are Cookies?</h3>
        <p>
          Cookies are small text files placed on your device when you visit our
          website, enabling us to enhance functionality and analyze usage.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">2. Types of Cookies We Use</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <span className="font-medium">Essential Cookies:</span> Required for
            website operation (e.g., session management).
          </li>
          <li>
            <span className="font-medium">Analytics Cookies:</span> Track
            website usage (e.g., Google Analytics).
          </li>
          <li>
            <span className="font-medium">Marketing Cookies:</span> Deliver
            personalized content and ads.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg">3. Purpose of Cookies</h3>
        <p>We use cookies to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Ensure website security and functionality.</li>
          <li>Analyze traffic and user behavior.</li>
          <li>Personalize your experience.</li>
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg">4. Your Consent</h3>
        <p>
          Using our website implies consent to cookies as outlined here. You may
          adjust preferences via browser settings.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">5. Third-Party Cookies</h3>
        <p>
          We may use third-party cookies (e.g., Google Analytics) governed by
          their respective privacy policies.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">6. Managing Cookies</h3>
        <p>
          You can disable cookies in your browser, though this may impact
          website functionality.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">7. Updates to This Policy</h3>
        <p>
          We may revise this Cookie Policy; please check periodically for
          updates.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-lg">8. Contact Us</h3>
        <p>For questions about cookies, contact:</p>
        <p>PayNomad Capital Ltd.</p>
        <p>810 Quayside Dr. Unit #205</p>
        <p>New Westminster, British Columbia</p>
        <p>V3M 6B9, Canada</p>
        <p>Email: info@paynomadcapitalltd.ca</p>
      </div>
    </div>
  );

  return (
    <footer className="bg-[#2c3e50] text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 lg:gap-24">
          {/* Company Information */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-semibold mb-4">
              PayNomad Capital Ltd.
            </h3>
            <p className="text-gray-300 mb-2">
              810 Quayside Dr. Unit #205,
              <br />
              New Westminster, British Columbia,
              <br />
              V3M 6B9, Canada
            </p>
            <p className="text-gray-300 mb-2">
              Email: info@paynomadcapitalltd.ca
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1 text-center md:text-center">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#about"
                  className="text-gray-300 hover:text-[#0077be] transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-gray-300 hover:text-[#0077be] transition-colors"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#insights"
                  className="text-gray-300 hover:text-[#0077be] transition-colors"
                >
                  Insights
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-gray-300 hover:text-[#0077be] transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-1 md:ml-auto">
            <h3 className="text-xl font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() =>
                    openDialog(
                      "PayNomad Capital Ltd. Privacy Policy",
                      privacyPolicyContent,
                    )
                  }
                  className="text-gray-300 hover:text-[#0077be] transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    openDialog(
                      "PayNomad Capital Ltd. Terms of Service",
                      termsOfServiceContent,
                    )
                  }
                  className="text-gray-300 hover:text-[#0077be] transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    openDialog(
                      "PayNomad Capital Ltd. Cookie Policy",
                      cookiePolicyContent,
                    )
                  }
                  className="text-gray-300 hover:text-[#0077be] transition-colors text-left"
                >
                  Cookie Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400 mb-2">
            Registered in the Province of British Columbia, Canada No. BC1368768
          </p>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} PayNomad Capital Ltd. All rights
            reserved.
          </p>
        </div>
      </div>

      <LegalDialog
        isOpen={dialogContent.isOpen}
        onClose={closeDialog}
        title={dialogContent.title}
        content={dialogContent.content}
      />
    </footer>
  );
};

export default Footer;
