"use client";

import { useState } from "react";

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is this platform about?",
      answer:
        "This is an open-source platform designed to connect people and make sharing resources easier. Anyone can contribute or use it freely.",
    },
    {
      question: "Is it free to use?",
      answer:
        "Yes! The platform is completely free and open source. You can also fork the codebase and customize it for your own needs.",
    },
    {
      question: "How can I join the community?",
      answer:
        "You can join our WhatsApp community for discussions, support, and updates. Check the Community page for the link.",
    },
    {
      question: "Can I contribute to the project?",
      answer:
        "Absolutely! Contributions are welcome. You can find the repository on GitHub and submit pull requests or issues.",
    },
    {
      question: "How do I get updates about new features?",
      answer:
        "We regularly post updates in our community and GitHub repository. You can also join the waitlist to receive email notifications.",
    },
  ];

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 font-sans">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-gray-800 tracking-tight">
        Frequently Asked Questions
      </h1>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 overflow-hidden"
          >
            <button
              onClick={() => handleToggle(index)}
              className="flex justify-between items-center w-full p-6 text-left focus:outline-none"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                {faq.question}
              </h2>
              <span
                className={`transform transition-transform duration-300 ${
                  openIndex === index ? "rotate-90" : "rotate-0"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-right"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                openIndex === index
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <p className="overflow-hidden px-6 pb-6 text-gray-600">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}