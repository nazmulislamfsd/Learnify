import { motion } from 'motion/react';
import { Target, Award, Rocket, CheckCircle2 } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To empower developers and creatives worldwide by providing access to high-fidelity, industry-standard technical education."
    },
    {
      icon: Award,
      title: "Quality First",
      description: "Every course is vetted by experts with at least 10 years of experience in their respective technology stacks."
    },
    {
      icon: Rocket,
      title: "Career Growth",
      description: "We don't just teach code; we teach system thinking, architecture, and the soft skills needed for leadership roles."
    }
  ];

  return (
    <section id="about" className="py-32 px-6 border-t border-white/5 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest mb-6">
              Our Story
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-[0.9]">
              Reimagining <span className="gradient-text">Education</span> for the Tech Elite.
            </h2>
            <p className="text-xl text-white/60 leading-relaxed mb-8">
              Learnify started in 2024 with a simple observation: most online courses stay at the surface level. We built Learnify to be the platform we wished we had—a place where deep technical mastery and premium user experience coexist.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "100% Industry Verified",
                "Advanced System Design",
                "Direct Mentor Logic",
                "Verifiable Certificates",
              ].map((item, id) => (
                <div key={id} className="flex items-center gap-3 text-white/80 font-medium">
                  <CheckCircle2 className="text-brand-primary w-5 h-5 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="rounded-[3rem] overflow-hidden border border-white/10 glass p-4">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
                alt="Our Team" 
                className="rounded-[2.5rem] w-full h-[500px] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                 <div className="w-24 h-24 rounded-full bg-brand-primary flex items-center justify-center animate-pulse">
                    <Rocket className="text-white w-10 h-10" />
                 </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, id) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: id * 0.1 }}
              className="p-10 glass rounded-[2.5rem] hover:border-brand-primary/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-brand-primary transition-colors duration-500">
                <value.icon className="w-7 h-7 text-brand-primary group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">{value.title}</h3>
              <p className="text-white/50 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
