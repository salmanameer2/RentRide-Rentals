import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare, ChevronDown, HelpCircle } from 'lucide-react';
import Container from '../components/Container';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';
import ScrollReveal from '../components/ScrollReveal';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      question: 'What are the age and driver’s license requirements to rent with Rent Rides?',
      answer:
        'Drivers must be at least 21 years of age with a valid government-issued driver’s license held for at least one full year. Drivers between 21 and 24 may incur a modest young-driver surcharge on select high-performance vehicles. International visitors must present a valid passport and international driving permit (if their native license is not in English).',
    },
    {
      question: 'What is your cancellation and modification policy?',
      answer:
        'We offer 100% free cancellation and full refunds for reservations cancelled up to 48 hours prior to your scheduled pickup time. Modifications made within 48 hours are subject to vehicle availability and rate adjustments without punitive cancellation penalties.',
    },
    {
      question: 'What insurance coverage is included in the daily rental rate?',
      answer:
        'All rentals include standard third-party liability coverage and complimentary 24/7 roadside assistance. Optional comprehensive collision damage waivers (CDW) and zero-deductible premium protection packages can be added during your reservation checkout.',
    },
    {
      question: 'How do airport pickups and concierge deliveries work?',
      answer:
        'For airport reservations, our concierge team monitors your flight in real-time. Upon landing, our representative meets you curbside or at the VIP terminal with the sanitized vehicle and keys ready. We also deliver directly to hotels, private residences, and corporate offices within our metropolitan service zones.',
    },
    {
      question: 'What is the security deposit and when is it released?',
      answer:
        'A pre-authorization security deposit ranging from $500 to $2,500 (depending on the vehicle tier: Executive, Luxury, or Exotic) is held on a valid credit card upon vehicle handover. The hold is immediately released upon safe inspection return, typically reflected on your statement within 2 to 5 business days.',
    },
    {
      question: 'Is there a mileage limitation on vehicles in the fleet?',
      answer:
        'Most vehicles in our Luxury Sedan and Premium SUV tiers include 150 to 200 complimentary miles per day, with generous cumulative weekly mileage allowances. Exotic and Hypercar tiers feature specified mileage limits detailed clearly in each vehicle profile, with reasonable per-mile rates thereafter.',
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="py-12 sm:py-16 bg-[#0b0f12] text-white">
      <Container>
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#bef264] mb-2 inline-block">
              Get in Touch
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              We're Here For You
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-400">
              Have a question about a reservation, corporate fleet partnerships, or specialized vehicle delivery? Reach our dedicated concierge team.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <ScrollReveal direction="left">
              <div className="bg-[#12181d] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="text-xl font-bold text-white">Direct Contact</h3>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#1c242b] border border-slate-700 flex items-center justify-center text-[#bef264] shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Customer Concierge (24/7)</div>
                      <div className="text-base font-bold text-white mt-0.5">+1 (800) 736-8743</div>
                      <div className="text-xs text-slate-500">Toll-free across North America</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#1c242b] border border-slate-700 flex items-center justify-center text-[#bef264] shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Electronic Inquiries</div>
                      <div className="text-base font-bold text-white mt-0.5">concierge@rentrides.com</div>
                      <div className="text-xs text-slate-500">Typical response time: under 15 minutes</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#1c242b] border border-slate-700 flex items-center justify-center text-[#bef264] shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Global Headquarters</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        450 Grand Avenue, Suite 900
                      </div>
                      <div className="text-xs text-slate-500">Beverly Hills, CA 90210</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#1c242b] border border-slate-700 flex items-center justify-center text-[#bef264] shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Lounge & Delivery Hours</div>
                      <div className="text-base font-bold text-white mt-0.5">24 Hours Daily</div>
                      <div className="text-xs text-slate-500">Airport curbside handover anytime</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Quick Guarantee Box */}
            <ScrollReveal direction="left" delay={0.1}>
              <div className="bg-[#12181d] border border-slate-800 rounded-3xl p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#bef264]/10 text-[#bef264] flex items-center justify-center shrink-0 font-bold">
                  ✓
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Rent Rides guarantees guaranteed vehicle allocation and clean sanitized delivery for all confirmed reservations.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <ScrollReveal direction="right">
              <div className="bg-[#12181d] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
                {isSubmitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[#bef264] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-[#bef264]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Message Received</h3>
                    <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                      Thank you, <span className="font-semibold text-white">{formData.name}</span>. Your message has been logged in Phase 1 demonstration mode. A concierge member will contact you shortly.
                    </p>
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsSubmitted(false);
                          setFormData({
                            name: '',
                            email: '',
                            phone: '',
                            subject: 'General Inquiry',
                            message: '',
                          });
                        }}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        Send a Message
                      </h3>
                      <p className="text-xs text-slate-400">
                        Fill in your details below and our team will get back to you promptly.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Alex Rivera"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full bg-[#182128] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#bef264]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="alex@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full bg-[#182128] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#bef264]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 019-2834"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full bg-[#182128] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#bef264]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                          Subject
                        </label>
                        <select
                          value={formData.subject}
                          onChange={(e) =>
                            setFormData({ ...formData, subject: e.target.value })
                          }
                          className="w-full bg-[#182128] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#bef264] cursor-pointer"
                        >
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Fleet Availability">Fleet Availability</option>
                          <option value="Corporate & VIP Rental">Corporate & VIP Rental</option>
                          <option value="Airport Handover Request">Airport Handover Request</option>
                          <option value="Feedback / Support">Feedback / Support</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                        Your Message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Tell us about your rental schedule, preferred vehicle model, or special requirements..."
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="w-full bg-[#182128] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#bef264] resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      icon={Send}
                      iconPosition="right"
                      className="w-full font-bold justify-center text-sm shadow-xl"
                    >
                      Submit Message
                    </Button>
                  </form>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="mt-20 pt-16 border-t border-slate-800/80 max-w-4xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#bef264] block mb-2">
                Common Inquiries
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
                Everything you need to know about our reservation guidelines, coverage options, and white-glove delivery.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <ScrollReveal key={idx} delay={idx * 0.05} direction="up">
                  <div
                    className="bg-[#12181d] border border-slate-800 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    >
                      <span className="text-sm sm:text-base font-bold text-white flex items-center gap-3">
                        <HelpCircle className="w-4 h-4 text-[#bef264] shrink-0" />
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-[#bef264]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
}
