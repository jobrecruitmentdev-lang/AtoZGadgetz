import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cancellation, Return & Refund Policy | AtoZ Gadgetz',
  description: 'Cancellation, Return & Refund Policy for AtoZ Gadgetz.',
};

export default function ReturnAndRefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Cancellation, Return & Refund Policy</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="font-semibold text-lg text-gray-900">
          All items come with a 24-hour warranty.
        </p>
        
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg text-amber-900 mt-6">
          <h2 className="text-xl font-bold mb-2">PROPER UNBOXING VIDEO</h2>
          <p>
            Make sure you have the right video of your parcel for security purposes.
          </p>
          <p className="mt-4">
            If you are sent a wrong/empty/damaged/missing parcel, your complaint will not be accepted unless you have the correct unboxing video starting from the time the parcel was sealed until you turn the product on in the same video. (If the device is not charged, then you must charge it and show it in the same video). Video that starts between the two will not be accepted.
          </p>
          <p className="mt-4 font-medium">
            The video must be emailed to us with your Name, Issue, and mention that you purchased from this website for better assistance.
          </p>
        </div>

        <section className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100 mt-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">Exchange Process</h2>
          <p>
            You can contact us at <strong>contact@atozgadgetz.com</strong> within 7 days of delivery to report a defect and request an exchange. We will email you the next steps if the product is found defective.
          </p>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100 mt-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">Return Conditions</h2>
          <ul className="space-y-4 list-disc list-inside">
            <li>
              Returns must be in their original packaging and in their original condition. All returned goods will be inspected upon return. We may not accept exchange requests if the item is returned in an unacceptable condition.
            </li>
            <li>
              We are not responsible for any items that get damaged or lost during return shipping. Therefore, we recommend an insured and tracked mail service. INDIA POST is a good option as it’s affordable.
            </li>
          </ul>
        </section>

        <div className="mt-10 p-6 bg-red-50 text-red-900 rounded-lg font-bold text-lg text-center">
          <p>
            There is no REFUND policy.
          </p>
        </div>
      </div>
    </div>
  );
}
