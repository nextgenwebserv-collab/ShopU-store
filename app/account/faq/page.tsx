'use client';

import type { FormEvent } from 'react';
import { Suspense, useState } from 'react';
import Navroute from '../../components/Navroute';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What can I buy from Shop U Store?',
    answer:
      'You can buy prescription medicines, over-the-counter (OTC) healthcare products, and daily grocery essentials like fruits, vegetables, dairy, snacks, and beverages all in one place.',
  },
  {
    question: 'How fast is the delivery?',
    answer:
      'We offer delivery within 10–30 minutes in select areas for groceries and same-day delivery for medicines depending on availability and location.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept UPI, Debit/Credit Cards, Net Banking, and Cash on Delivery (COD). Wallets and Buy Now Pay Later options may be available in supported areas.',
  },
  {
    question: 'Can I return medicines or groceries?',
    answer:
      'Due to health and safety regulations, medicines and perishable grocery items are non-returnable. However, if you received the wrong or damaged item, we’ll arrange a replacement or refund.',
  },
  {
    question: 'How do I contact customer support?',
    answer:
      'You can chat with us using the support icon or call us at 1800-123-4567 between 8 AM – 10 PM daily.',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/faq', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setResponse(data.success ? 'Message sent!' : 'Failed to send.');
    setLoading(false);
    setForm({ name: '', subject: '', message: '' });
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Navroute />
      {/* Desktop view */}
      <div className="mx-auto hidden max-w-7xl px-16 py-10 sm:block">
        <div>
          <h2 className="text-primaryColor mb-8 text-xl font-semibold">
            Frequently Asked <span className="text-secondaryColor">Questions</span>
            <hr className="bg-background1 mt-2 h-1 w-70 rounded border-0" />
          </h2>
        </div>
        <div className="lg:flex lg:items-start lg:gap-10">
          {/* Left: FAQ Section */}
          <div className="flex-1">
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="rounded bg-white py-1 shadow-sm">
                  <button
                    onClick={() => setActiveIndex(index === activeIndex ? -1 : index)}
                    className="text-md flex w-full items-center justify-between p-4 text-left font-semibold text-gray-900"
                  >
                    {faq.question}
                    <ChevronDown
                      className={`h-5 w-5 transition-transform duration-200 ${
                        index === activeIndex ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {index === activeIndex && (
                    <div className="border-t border-gray-200 p-4 text-sm text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="mt-10 w-full max-w-md rounded-md bg-white px-10 py-6 shadow-sm lg:mt-0">
            <h2 className="text-primaryColor mb-4 text-lg font-semibold">Ask a Questions</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                required
                placeholder="Your Name"
                className="mb-6 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="text"
                required
                placeholder="Subject"
                className="mb-6 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
              />
              <textarea
                required
                placeholder="Tag Your Message"
                className="mb-3 h-32 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
              />
              <button
                type="submit"
                className="bg-background1 w-full rounded-md px-4 py-2 text-white transition-all hover:opacity-90"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
              {response && <p className="mt-2 text-sm text-green-600">{response}</p>}
            </form>
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:hidden">
        <div className="">
          <h2 className="text-primaryColor mb-8 text-lg font-medium">
            Frequently Asked <span className="text-secondaryColor">Questions</span>
            <hr className="bg-background1 mt-1 w-60 rounded border-2" />
          </h2>
        </div>

        <div className="lg:flex lg:items-start lg:gap-10">
          {/* Left: FAQ Section */}
          <div className="flex-1">
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="rounded bg-white py-1 shadow-sm">
                  <button
                    onClick={() => setActiveIndex(index === activeIndex ? -1 : index)}
                    className="text-md flex w-full items-center justify-between px-4 py-4 text-left font-semibold text-gray-900"
                  >
                    {faq.question}
                    <ChevronDown
                      className={`h-5 w-5 transition-transform duration-200 ${
                        index === activeIndex ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {index === activeIndex && (
                    <div className="border-t border-gray-200 p-4 text-sm text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="mt-10 w-full max-w-md rounded-md bg-white px-10 py-6 shadow-sm lg:mt-0">
            <h2 className="text-primaryColor mb-4 text-lg font-semibold">Ask a Questions</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                required
                placeholder="Your Name"
                className="mb-6 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="text"
                required
                placeholder="Subject"
                className="mb-6 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
              />
              <textarea
                required
                placeholder="Tag Your Message"
                className="mb-3 h-32 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
              />
              <button
                type="submit"
                className="bg-background1 w-full rounded-md px-4 py-2 text-white transition-all hover:opacity-90"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
              {response && <p className="mt-2 text-sm text-green-600">{response}</p>}
            </form>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
