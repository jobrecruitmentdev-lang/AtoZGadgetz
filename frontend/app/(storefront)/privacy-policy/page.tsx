import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | AtoZ Gadgetz',
  description: 'Privacy Policy for AtoZ Gadgetz.',
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Privacy Policy</h1>
      
      <div className="space-y-8 text-gray-700 leading-relaxed">
        
        <section>
          <p>
            We take security and privacy with the utmost regard. Following is the information about the policies and procedures of Atoz Gadgetz and the collection, usage, disclosure, and dissemination of information. By visiting this Website you agree to be bound by the terms and conditions of this Privacy Policy. If you do not agree please do not use or access our Website. By use of the Website, you expressly consent to our use and disclosure of your personal information in accordance with this Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">Scope of Privacy Policy</h2>
          <p>
            This Privacy Policy does not apply to the practices of third parties that we do not own or control, including but not limited to any third-party websites, services, and applications (“Third Party Services”) that you elect to access through the offerings or to individuals that we do not manage or employ. We take an effort in selecting and facilitating access to service providers with high privacy and security standards. However, we cannot take responsibility for third party service providers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">Information Collection</h2>
          <p>
            We collect information to enable us to provide a safe, personalized, and optimized experience to our users. It helps us improve and update the offerings for the users. We only collect information that we consider necessary to achieve this purpose. You can browse the website anonymously without revealing your identity or any personal information about yourself. Once you give us your personal information, you are not anonymous to us.
          </p>
          <p className="mt-3">
            On the usage of our website whether by logging in or simply surfing, we may collect behavioral information. We use this information to analyze users’ demographics, interests, and behavior to better understand, protect and serve our users at aggregate levels. We use “cookies” for data collection. The information collected is used to analyze the effectiveness of the website features, webpage flow, and experience. Cookies also allow users to enter the password less frequently during a session.
          </p>
          <p className="mt-3">
            We collect personally identifiable information (email address, name, phone number, credit card/debit card / other payment instrument details, etc.) from you when you set up a free account with us. While you can browse some sections of our website without being a registered member, certain activities (such as placing an order) do require registration. We do use your contact information to send you offers based on your previous orders and your interests.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">Account Information</h2>
          <p>
            When you create an Account, you will provide information that could be Personal Information, such as your username, password, and email address. You acknowledge that this information may be personal to you, and by creating an account on the website and providing Personal Information to us, you allow others, including us, to identify you and therefore may not be anonymous. We may use your contact information to send you information about our offerings, but only rarely when we feel such information is important.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">Use of Demographic and Profile Data</h2>
          <p>
            We use your personal information to resolve disputes; troubleshoot problems; help promote a safe service; collect money; measure consumer interest in our products and services, inform you about online and offline offers, products, services, and updates; customize your experience; detect and protect us against error, fraud, and other criminal activity; enforce our terms and conditions; and as otherwise described to you at the time of collection.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">Sharing of Personal Information</h2>
          <p>
            We may share personal information with our other corporate entities and affiliates to help detect and prevent identity theft, fraud, and other potentially illegal acts; correlate related or multiple accounts to prevent abuse of our services, and facilitate joint or co-branded services that you request where such services are provided by more than one corporate entity. We may disclose personal information if required to do so by law or in the good faith belief that such disclosure is reasonably necessary to respond to subpoenas, court orders, or another legal process.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">Links to Other Sites & Security</h2>
          <p>
            Our website links to other websites that may collect personally identifiable information about you. Atoz Gadgetz is not responsible for the privacy practices or the content of those linked websites.
          </p>
          <p className="mt-3">
            <strong>Steps taken by us to secure your Information:</strong> We follow generally accepted industry standards to protect the personal information submitted to us. All your information is restricted in our offices. Only employees who need the information to perform a specific job are granted access to personally identifiable information. While we implement safeguards designed to protect your information, no security system is impenetrable. When our registration/order process asks you to enter sensitive information (such as a credit card number), such information is encrypted.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">Your Consent</h2>
          <p>
            By using the website and/ or by providing your information, you consent to the collection and use of the information you disclose on the website in accordance with this Privacy Policy, including but not limited to Your consent for sharing your information as per this privacy policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900">Grievance Officer</h2>
          <p>
            In accordance with Information Technology Act 2000 and rules made thereunder, the name and contact details of the Grievance Officer are provided below:
          </p>
          <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-100">
            <p className="font-semibold text-gray-900">Atoz Gadgetz</p>
            <p>Instagram: <a href="https://www.instagram.com/atozgadgetzofficial/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@atozgadgetzofficial</a></p>
            <p>Active Hours: All Days (11am-9pm)</p>
            <p>Email: <strong>contact@atozgadgetz.com</strong></p>
          </div>
        </section>

      </div>
    </div>
  );
}
