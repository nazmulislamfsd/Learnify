import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    category: 'Payments',
    question: 'How do I pay for a course?',
    answer: 'We support SSLCommerz and Stripe. You can pay using Credit/Debit cards, Net Banking, or Mobile Wallets. Once the payment is successful, your course will be instantly unlocked.'
  },
  {
    category: 'Account',
    question: 'Can I access the courses from multiple devices?',
    answer: 'To ensure security and platform integrity, we implement session management. While you can log in from different devices, simultaneous active sessions are restricted to prevent account sharing.'
  },
  {
    category: 'Course',
    question: 'Are the certificates industry-recognized?',
    answer: 'Yes! Upon completing 100% of the lessons, you will receive a digital certificate generated through our automated system, verified with a unique ID.'
  },
  {
    category: 'Support',
    question: 'What if I need help during the course?',
    answer: 'Every course comes with a dedicated Q&A section where you can interact with the instructor and fellow students. For technical issues, our support team is available 24/7.'
  }
];

export default function FAQAccordion() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="faq" className="py-24 px-6 bg-[#080808]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-brand-primary text-xs font-bold uppercase tracking-widest mb-4">
            <HelpCircle className="w-3 h-3" />
            Common Questions
          </div>
          <h2 className="text-5xl font-bold mb-4">Got <span className="gradient-text">Questions</span>?</h2>
          <p className="text-white/50 text-lg">Everything you need to know about Learnify.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div 
              key={index}
              className={`rounded-3xl transition-all duration-300 border ${
                activeIndex === index ? 'glass-dark border-brand-primary/30' : 'bg-transparent border-white/5 hover:border-white/10'
              }`}
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-primary opacity-70">
                    {faq.category}
                  </span>
                  <span className="text-xl font-semibold tracking-tight">{faq.question}</span>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  activeIndex === index ? 'bg-brand-primary text-white rotate-180' : 'bg-white/5 text-white/40'
                }`}>
                  {activeIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-8 text-white/60 leading-relaxed text-lg border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
