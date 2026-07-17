import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Payment Policy | AtoZ Gadgetz',
  description: 'Shipping and payment policy for AtoZ Gadgetz.',
};

export default function ShippingPaymentPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Shipping & Payment Policy</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          We endeavour to dispatch all products ordered within 48 hours after the order has been placed and accepted by us. 10-15 days is the expected delivery time for your parcel — as fast as possible for our beloved customers. It might take a bit longer in Festive Season because of rush and oversurge of parcels in delivery hubs. You will be receiving an OTP from the delivery company at the time of delivery to ensure that the delivery is given to the right person. In case of any queries or issues regarding your parcel you may email us at <strong>contact@atozgadgetz.com</strong>.
        </p>

        <section className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100 mt-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">Delivery Information</h2>
          <ul className="space-y-4">
            <li>
              <span className="font-semibold text-gray-900">Delivery Charges:</span> All domestic orders are delivered for free of charge.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Additional Charges:</span> There are no additional charges. The total payable amount is indicated on the individual items.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Delivery Time:</span> This may vary depending on the delivery location and services of our logistics partner. However, we endeavour to deliver orders within 10 to 15 days — as fast as possible for our beloved customers.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Delivery Areas:</span> We deliver All Over India.
            </li>
          </ul>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100 mt-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">Payment Modes</h2>
          <p>
            Online through Internet banking, UPI, Visa, MasterCard, American Express, Maestro, Debit cards, IMPS
          </p>
        </section>

        <div className="mt-10 p-6 bg-blue-50 text-blue-900 rounded-lg">
          <p className="font-medium">
            For further information please mail us at <strong>contact@atozgadgetz.com</strong>, 11 AM to 9pm, All days (excludes public holidays).
          </p>
        </div>
      </div>
    </div>
  );
}
