import React from 'react';
import { ShieldCheck, Award, Users, HeartHandshake, Sparkles, Clock, CheckCircle } from 'lucide-react';
import Container from '../components/Container';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';
import { assets } from '../assets/assets';
import ScrollReveal from '../components/ScrollReveal';

export default function About() {
  const stats = [
    { label: 'Total Cars in Fleet', value: '180+' },
    { label: 'Happy Customers', value: '25,000+' },
    { label: 'Cities & Airport Hubs', value: '35+' },
    { label: 'Years in Business', value: '8+' },
  ];

  const values = [
    {
      icon: ShieldCheck,
      title: 'Reliability',
      description: 'Every vehicle in our collection undergoes a meticulous multi-point mechanical inspection and certification prior to every rental.',
    },
    {
      icon: HeartHandshake,
      title: 'Transparency',
      description: 'Zero hidden insurance gotchas, deceptive fuel fees, or surprise surcharges. Transparent daily rates guaranteed from search to return.',
    },
    {
      icon: Sparkles,
      title: 'Luxury Experience',
      description: 'Hand-curated premium interiors, top-tier audio systems, and high-performance engineering that turn every drive into a celebration.',
    },
    {
      icon: Users,
      title: 'Customer Obsession',
      description: 'Dedicated 24/7 concierge assistance and roadside support. We treat every driver like our sole and most valued guest.',
    },
  ];

  const team = [
    {
      name: 'Alexander Vance',
      role: 'Founder & CEO',
      bio: 'Former automotive engineer with 15+ years scaling mobility solutions and premium car services globally.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Elena Rostova',
      role: 'Head of Fleet Operations',
      bio: 'Directs vehicle acquisition, meticulous maintenance protocols, and luxury specification standards across all hubs.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Marcus Sterling',
      role: 'Chief Technology Officer',
      bio: 'Architect of our streamlined digital reservation systems and keyless fleet verification technology.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Sophia Chen',
      role: 'VP of Customer Experience',
      bio: 'Leads our 24/7 concierge team ensuring white-glove handovers and effortless driver support.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return (
    <div className="py-12 sm:py-16 bg-[#0b0f12] text-white">
      <Container>
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#bef264] mb-2 inline-block">
              Our Story & Values
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Redefining The Modern Car Rental Experience
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              Rent Rides was founded on a simple principle: renting a luxury or performance vehicle should be as thrilling and seamless as driving it.
            </p>
          </div>
        </ScrollReveal>

        {/* Hero Visual Banner */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="relative rounded-3xl overflow-hidden mb-20 border border-slate-800 shadow-2xl">
            <img
              src={assets.heroCar}
              alt="Rent Rides fleet presentation"
              className="w-full h-72 sm:h-96 object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f12] via-black/40 to-transparent flex items-end p-8 sm:p-12">
              <div className="max-w-xl">
                <span className="text-xs font-bold uppercase tracking-widest text-[#bef264]">
                  Founded in 2024
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  Elevating Mobility for Visionaries & Explorers
                </h2>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-20">
          {stats.map((stat, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div
                className="bg-[#12181d] border border-slate-800 p-6 rounded-3xl text-center shadow-md hover:border-slate-700 transition-colors"
              >
                <div className="text-3xl sm:text-4xl font-black text-[#bef264] mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Mission & Vision Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-20">
          <div className="lg:col-span-6 space-y-5">
            <ScrollReveal direction="left">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#bef264]">
                Our Mission
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Empowering Journeys with Unmatched Precision & Grace
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Traditional car rental platforms are plagued by slow lines, Bait-and-Switch inventory ("or similar car"), and opaque fees. Rent Rides flips the model on its head.
              </p>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                When you reserve a car with us, the exact model, spec, and color you chose is the exact car that greets you. Paired with 24/7 dedicated human concierge, we ensure every mile feels bespoke.
              </p>
              <div className="pt-2">
                <Button variant="primary" size="md" to="/fleet">
                  Explore Available Fleet
                </Button>
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-6 relative">
            <ScrollReveal direction="right">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
                <img
                  src={assets.heroInterior}
                  alt="Inside Rent Rides vehicle"
                  className="w-full h-80 sm:h-96 object-cover"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="pt-8 mb-20">
          <ScrollReveal direction="up">
            <SectionTitle
              eyebrow="Core Values"
              title="The Rent Rides Standard"
              subtitle="Built from the ground up for modern drivers who demand consistency, performance, and uncompromising trust."
              align="center"
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div
                    className="bg-[#12181d] border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-[#1c242b] border border-slate-700/80 flex items-center justify-center text-[#bef264] mb-4">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        {v.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* Leadership Team Section */}
        <div className="mb-20">
          <ScrollReveal direction="up">
            <SectionTitle
              eyebrow="Our Leadership"
              title="Driven by Automotive Enthusiasts"
              subtitle="Meet the experienced team dedicated to delivering the pinnacle of luxury car rental services."
              align="center"
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div
                  className="bg-[#12181d] border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all group"
                >
                  <div className="h-56 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-white">{member.name}</h3>
                    <div className="text-xs text-[#bef264] font-medium mb-2">{member.role}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <ScrollReveal direction="up">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#141d24] via-[#10181e] to-[#0a0f12] border border-slate-800 p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#bef264] block mb-2">
              Ready to Drive?
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Experience the Rent Rides Difference Today
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
              From iconic supercars to prestigious family SUVs, reserve your dream vehicle with transparent pricing and zero stress.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" to="/fleet" className="font-bold shadow-lg">
                Browse Entire Fleet
              </Button>
              <Button variant="outline" size="lg" to="/contact" className="font-semibold text-slate-200 border-slate-700 hover:text-white">
                Contact Concierge
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </div>
  );
}
