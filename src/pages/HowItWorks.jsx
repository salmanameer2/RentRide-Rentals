import React from 'react';
import { 
  Car, 
  Calendar, 
  ClipboardCheck, 
  Key, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  Clock, 
  CreditCard,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import Container from '../components/Container';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';
import { howItWorksSteps } from '../assets/assets';
import ScrollReveal from '../components/ScrollReveal';

export default function HowItWorks() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Full Coverage Included',
      description: 'Every rental comes with comprehensive insurance protection for complete peace of mind.'
    },
    {
      icon: Clock,
      title: '24/7 Delivery',
      description: 'We deliver and collect vehicles at any hour, from airports to your doorstep.'
    },
    {
      icon: Zap,
      title: 'Instant Confirmation',
      description: 'No waiting for approval. Your booking is confirmed the second you complete the request.'
    }
  ];

  const faqs = [
    {
      question: 'What documents do I need to rent a car?',
      answer: 'You will need a valid driver\'s license (held for at least 2 years), a credit card in the driver\'s name for the security deposit, and a passport or national ID for identity verification.'
    },
    {
      question: 'How does the insurance work?',
      answer: 'Our standard rental price includes Basic Collision Damage Waiver (CDW). We also offer Premium Protection packages that reduce your excess to zero for a worry-free experience.'
    },
    {
      question: 'Can I choose the exact color of the car?',
      answer: 'Unlike traditional rental companies, Rent Rides guarantees the exact model and specification you see in the listing. While color availability depends on the specific asset, what you see on the confirmation is what you get.'
    },
    {
      question: 'Is there a mileage limit?',
      answer: 'Most of our luxury and SUV rentals come with a generous daily mileage limit of 250 miles. Performance supercars may have more restricted limits (100 miles/day) to preserve vehicle condition.'
    }
  ];

  return (
    <div className="py-12 sm:py-16 bg-[#0b0f12] text-white">
      <Container>
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#bef264] mb-2 inline-block">
              Seamless Mobility
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              How Rent Rides Works
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              Renting a premium vehicle should be as exciting as the drive itself. We've streamlined the entire process into five simple steps.
            </p>
          </div>
        </ScrollReveal>

        {/* Step-by-Step Guide */}
        <div className="relative space-y-12 mb-24">
          {/* Vertical line for desktop */}
          <div className="absolute left-[50%] top-0 bottom-0 w-px bg-slate-800 hidden lg:block" />

          {howItWorksSteps.map((step, index) => (
            <div key={step.step} className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              {/* Step Content */}
              <div className="flex-1 w-full">
                <ScrollReveal direction={index % 2 !== 0 ? 'right' : 'left'}>
                  <div className={`p-8 rounded-3xl bg-[#12181d] border border-slate-800 shadow-xl relative z-10 transition-all hover:border-[#bef264]/30 ${index % 2 !== 0 ? 'lg:text-right' : ''}`}>
                    <div className={`text-4xl font-black text-[#bef264] mb-4 ${index % 2 !== 0 ? 'lg:justify-end' : ''} flex items-center gap-3`}>
                      <span className="opacity-40">{step.step}</span>
                      <div className="h-px w-12 bg-[#bef264]/20 hidden sm:block" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                      {step.description}
                    </p>
                  </div>
                </ScrollReveal>
              </div>

              {/* Step Graphic / Icon */}
              <ScrollReveal direction="up" delay={0.2}>
                <div className="relative flex-none w-20 h-20 rounded-2xl bg-[#bef264] text-black flex items-center justify-center shadow-[0_0_30px_rgba(190,242,100,0.2)] z-20">
                  {index === 0 && <Car className="w-8 h-8" />}
                  {index === 1 && <Calendar className="w-8 h-8" />}
                  {index === 2 && <ClipboardCheck className="w-8 h-8" />}
                  {index === 3 && <CheckCircle2 className="w-8 h-8" />}
                  {index === 4 && <Key className="w-8 h-8" />}
                  
                  {/* Connector for mobile */}
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-px h-12 bg-slate-800 lg:hidden" />
                </div>
              </ScrollReveal>

              <div className="flex-1 hidden lg:block" />
            </div>
          ))}
        </div>

        {/* Benefits Grid */}
        <div className="mb-24">
          <ScrollReveal direction="up">
            <SectionTitle
              eyebrow="The Rent Rides Edge"
              title="Why Rent With Us?"
              subtitle="We prioritize transparency, safety, and a premium digital-first approach to car rental."
              align="center"
            />
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="bg-[#12181d] border border-slate-800 p-8 rounded-3xl text-center group hover:border-slate-700 transition-colors h-full">
                    <div className="w-14 h-14 rounded-2xl bg-[#1c242b] text-[#bef264] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-3">{f.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <ScrollReveal direction="up">
            <SectionTitle
              eyebrow="Common Questions"
              title="Everything You Need to Know"
              align="center"
            />
          </ScrollReveal>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.1} direction="up">
                <div className="p-6 sm:p-8 rounded-3xl bg-[#12181d] border border-slate-800 hover:border-slate-700 transition-colors">
                  <h4 className="text-base sm:text-lg font-bold text-white mb-3 flex items-start gap-3">
                    <span className="text-[#bef264] mt-1 shrink-0 italic">Q.</span>
                    {faq.question}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed pl-7">
                    {faq.answer}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Support CTA */}
        <ScrollReveal direction="up">
          <div className="bg-[#bef264] rounded-3xl p-8 sm:p-12 text-center text-black shadow-2xl relative overflow-hidden">
            {/* Decorative background shape */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <h2 className="text-3xl sm:text-4xl font-black mb-4 relative z-10">Still have questions?</h2>
            <p className="text-black/70 font-medium max-w-xl mx-auto mb-8 relative z-10">
              Our 24/7 concierge team is ready to assist you with your booking, vehicle choice, or custom requirements.
            </p>
            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <Button variant="primary" size="lg" className="bg-black text-white hover:bg-black/80 font-bold border-none" to="/contact">
                Contact Support
              </Button>
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-black/5 border border-black/10">
                <PhoneCall className="w-5 h-5" />
                <span className="font-bold">+1 (800) RENT-RIDES</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </div>
  );
}
