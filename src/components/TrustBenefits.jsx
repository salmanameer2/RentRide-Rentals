import React from 'react';
import { Car, ShieldCheck, Tag, Zap, Headphones } from 'lucide-react';
import Container from './Container';

/**
 * Trust & Benefits Section for Rent Rides
 * Highlights: Wide Selection, Reliable Vehicles, Transparent Pricing, Easy Booking, 24/7 Support
 */
export default function TrustBenefits({ className = '' }) {
  const benefits = [
    {
      icon: Car,
      title: 'Wide Selection',
      description: 'From exotic supercars to executive sedans and spacious family SUVs.',
    },
    {
      icon: ShieldCheck,
      title: 'Reliable Vehicles',
      description: 'Every car is rigorously inspected, detailed, and certified before handover.',
    },
    {
      icon: Tag,
      title: 'Transparent Pricing',
      description: 'Zero hidden insurance gotchas, deceptive fuel fees, or surprise surcharges.',
    },
    {
      icon: Zap,
      title: 'Easy Booking',
      description: 'Reserve in under 2 minutes with flexible dates and streamlined delivery.',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Dedicated concierge team and roadside assistance anytime, anywhere.',
    },
  ];

  return (
    <section className={`bg-[#0e1418] text-white py-16 border-b border-slate-800/80 ${className}`}>
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#141b22] border border-slate-800 hover:border-slate-700 hover:bg-[#182129] transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#bef264]/10 text-[#bef264] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
