import React from 'react';
import { Metadata } from 'next';
import { Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | AtoZ Gadgetz',
  description: 'Contact AtoZ Gadgetz.',
};

export default function ContactUs() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Say Hello</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          By asking any queries, please also mention your contact number so we can get back to you as fast as possible.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
        {/* Contact Info */}
        <div className="space-y-8 bg-gray-50 p-8 rounded-2xl border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>
          
          <div className="flex items-start space-x-4">
            <Mail className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <p className="font-medium text-gray-900">Email</p>
              <a href="mailto:contact@atozgadgetz.com" className="text-gray-600 hover:text-blue-600">contact@atozgadgetz.com</a>
            </div>
          </div>

        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Ask Your Queries</h2>
          <form className="space-y-6" action="#">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input 
                type="email" 
                id="email" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                placeholder="Your Email" 
                required 
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input 
                type="text" 
                id="subject" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                placeholder="Subject" 
                required 
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea 
                id="message" 
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
                placeholder="Message (Please include your contact number)" 
                required 
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              SEND MESSAGE
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
