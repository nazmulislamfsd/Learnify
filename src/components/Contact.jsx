import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle, Github, Twitter, Linkedin } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-32 px-6 border-t border-white/5 bg-[#080808] relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            Contact Us
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
            Let's <span className="gradient-text">Connect</span>.
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            Whether you're a student with a question or an organization looking to partner, our elite support team is here for you.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass p-8 rounded-[2.5rem] space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand-primary shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Email Support</h4>
                  <p className="text-white/40 text-sm mb-2">Typically responds within 4 hours.</p>
                  <a href="mailto:support@learnify.tech" className="text-brand-primary font-semibold hover:underline">support@learnify.tech</a>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Direct Line</h4>
                  <p className="text-white/40 text-sm mb-2">Mon - Fri, 9am - 6pm EST</p>
                  <a href="tel:+1800LEARNIFY" className="text-white font-semibold hover:text-brand-primary transition-colors">+1 (800) LEARN-IFY</a>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-orange-400 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Global HQ</h4>
                  <p className="text-white/40 text-sm leading-relaxed">
                    123 Innovation Drive, Silicon Valley,<br />
                    California, United States
                  </p>
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem]">
              <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-brand-primary" />
                Social Channels
              </h4>
              <div className="flex gap-4">
                {[Github, Twitter, Linkedin].map((Icon, i) => (
                  <button key={i} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-brand-primary hover:text-white text-white/50 transition-all">
                    <Icon className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 glass p-10 rounded-[3rem] border-white/10"
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-primary transition-all text-white placeholder:text-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="name@company.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-primary transition-all text-white placeholder:text-white/20"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Subject</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-primary transition-all text-white/60 appearance-none">
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Partnership Request</option>
                  <option>Billing Question</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Message</label>
                <textarea 
                  rows={6}
                  placeholder="Tell us what you're thinking..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand-primary transition-all text-white placeholder:text-white/20 resize-none"
                ></textarea>
              </div>

              <button className="w-full bg-brand-primary text-white py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3">
                Send Message
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
