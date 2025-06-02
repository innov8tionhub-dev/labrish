import React from 'react';

const FaqSection: React.FC = () => {
  const faqs = [
    {
      question: "How does the voice training work?",
      answer: "Our AI technology analyzes your voice patterns from a short recording sample. You'll need to read a few paragraphs of text, and our system will create a digital voice model that captures your unique accent and speaking style."
    },
    {
      question: "Can I use Labrish for commercial projects?",
      answer: "Yes! Our Storyteller and Enterprise plans include commercial usage rights. You can use Labrish-generated narrations for podcasts, educational content, and other commercial applications."
    },
    {
      question: "What accents are available in the library?",
      answer: "We offer a growing collection of Caribbean accents, including Jamaican, Trinidadian, Barbadian, and more. We regularly add new accents based on user requests and community feedback."
    },
    {
      question: "Is my content secure and private?",
      answer: "Absolutely. We use enterprise-grade encryption to protect your stories and voice data. You have full control over what you share publicly and what remains private."
    }
  ];

  return (
    <section className="py-16 bg-caribbean-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl mb-4 text-gray-800">Frequently Asked Questions</h2>
          <p className="font-body text-lg text-gray-600">Everything you need to know about Labrish</p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-6">
              <h3 className="font-heading text-xl mb-2 text-gray-800">{faq.question}</h3>
              <p className="font-body text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};