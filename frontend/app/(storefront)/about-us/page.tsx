import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | AtoZ Gadgetz',
  description: 'About AtoZ Gadgetz.',
};

export default function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 text-center">
      <h1 className="text-3xl md:text-5xl font-bold mb-8 text-gray-900">About Us</h1>
      
      <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100">
        <p className="text-xl md:text-3xl font-medium text-gray-800 leading-relaxed">
          <span className="font-bold text-blue-600 block mb-4">Get all the trending gadgets here at an affordable price</span>
          Only at Atoz Gadgetz.com with lesser price.
        </p>
      </div>
    </div>
  );
}
