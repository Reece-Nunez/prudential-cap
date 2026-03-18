'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BanknotesIcon,
  CreditCardIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        current = value;
        clearInterval(timer);
      }
      setDisplayed(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  const formatted = `${prefix}${Intl.NumberFormat('en-US').format(displayed)}${suffix}`;

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {formatted}
    </motion.span>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#services', label: 'Services' },
    { href: '#about', label: 'About' },
    { href: '#results', label: 'Results' },
    { href: '#testimonials', label: 'Testimonials' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed z-50 transition-all duration-500 ${
        scrolled
          ? 'top-4 left-4 right-4 bg-white/80 backdrop-blur-xl shadow-lg shadow-black/[0.08] rounded-2xl border border-white/50'
          : 'top-0 left-0 right-0 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <Image
              src="/prud-cap-logo.png"
              alt="Prudential Capital"
              width={220}
              height={66}
              className={`h-12 w-auto transition-all duration-500 ${
                scrolled ? '' : 'brightness-0 invert'
              }`}
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group ${
                  scrolled
                    ? 'text-gray-600 hover:text-[#0a2540] hover:bg-gray-100/80'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#0f79be] transition-all duration-300 group-hover:w-6 rounded-full" />
              </a>
            ))}
            <div className={`w-px h-5 mx-3 ${scrolled ? 'bg-gray-200' : 'bg-white/20'}`} />
            <a
              href="tel:7029793327"
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                scrolled
                  ? 'text-gray-500 hover:text-[#0f79be]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <PhoneIcon className="w-4 h-4" />
              (702) 979-3327
            </a>
            <Link
              href="/apply"
              className="ml-2 px-6 py-2.5 bg-[#0f79be] text-white text-sm font-semibold rounded-xl hover:bg-[#0b5e96] transition-all duration-300 shadow-lg shadow-[#0f79be]/25 hover:shadow-[#0f79be]/40 hover:-translate-y-0.5 cursor-pointer"
            >
              Apply Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2.5 rounded-xl transition-colors cursor-pointer ${
              scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100/50 rounded-b-2xl overflow-hidden"
          >
            <div className="px-4 py-6 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-[#0f79be]/5 hover:text-[#0f79be] transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <a
                  href="tel:7029793327"
                  className="flex items-center gap-3 px-4 py-3 text-gray-600 font-medium cursor-pointer"
                >
                  <PhoneIcon className="w-5 h-5 text-[#0f79be]" />
                  (702) 979-3327
                </a>
                <Link
                  href="/apply"
                  onClick={() => setIsOpen(false)}
                  className="block text-center px-6 py-3.5 bg-[#0f79be] text-white font-semibold rounded-xl hover:bg-[#0b5e96] transition-colors cursor-pointer"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function FadeInSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -60]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#071a2e] via-[#0a2540] to-[#0d3a5c]" />

      {/* Animated gradient orbs */}
      <div
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(15,121,190,0.6) 0%, transparent 70%)',
          animation: 'float-slow 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(94,184,232,0.5) 0%, transparent 70%)',
          animation: 'float-medium 15s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-[30%] left-[50%] w-[400px] h-[400px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(15,121,190,0.4) 0%, transparent 70%)',
          animation: 'float-fast 12s ease-in-out infinite',
        }}
      />

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40"
      >
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/[0.08] backdrop-blur-md text-white/90 text-sm font-medium rounded-full border border-white/[0.12] mb-8">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Trusted by 1,300+ Businesses Since 2008
            </span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-playfair)] font-bold text-white leading-[1.08] mb-6 tracking-[-0.02em]">
            {'Business Loans Have Never Been Easier'
              .split(' ')
              .map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, filter: 'blur(8px)', y: 12 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.4 + index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`mr-[0.25em] inline-block ${
                    index >= 2 && index <= 4
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#5eb8e8] via-[#7ec8f0] to-[#a8d8f0]'
                      : ''
                  }`}
                >
                  {word}
                </motion.span>
              ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl text-white/60 max-w-xl mb-10 leading-relaxed"
          >
            Simple. Straightforward. Fast. Get funded from $2,000 to $2,000,000
            with approvals in as little as 12 hours. We evaluate your business, not
            just your credit score.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/apply"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#0f79be] text-white text-base font-semibold rounded-xl hover:bg-[#0b5e96] transition-all duration-300 shadow-xl shadow-[#0f79be]/30 hover:shadow-[#0f79be]/50 hover:-translate-y-0.5 cursor-pointer"
            >
              See If You Qualify
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <a
              href="tel:7029793327"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white/[0.08] backdrop-blur-md text-white text-base font-semibold rounded-xl border border-white/[0.15] hover:bg-white/[0.15] hover:border-white/[0.25] transition-all duration-300 cursor-pointer"
            >
              <PhoneIcon className="w-5 h-5" />
              Call (702) 979-3327
            </a>
          </motion.div>

          {/* Quick trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-wrap items-center gap-6 mt-12 pt-8 border-t border-white/[0.08]"
          >
            {[
              { label: 'Same-Day Approvals', icon: ClockIcon },
              { label: '98% Success Rate', icon: ShieldCheckIcon },
              { label: '90+ Professionals', icon: UserGroupIcon },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-white/50">
                <item.icon className="w-4 h-4 text-[#5eb8e8]" />
                {item.label}
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1.5"
        >
          <motion.div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Trust Bar (Infinite Marquee) ─────────────────────────────────────────────
function TrustBar() {
  const features = [
    '$2K - $2M Funding',
    'Same-Day Approvals',
    'Cash Flow Based',
    'No Collateral Required',
    'All Industries Welcome',
    'Since 2008',
    '98% Success Rate',
    '12-Hour Turnaround',
  ];

  const FeatureList = () => (
    <>
      {features.map((feature) => (
        <div
          key={feature}
          className="flex items-center gap-2.5 text-sm text-gray-500 font-medium whitespace-nowrap mx-6 md:mx-8"
        >
          <CheckBadgeIcon className="w-5 h-5 text-[#0f79be] flex-shrink-0" />
          {feature}
          <span className="ml-6 md:ml-8 text-gray-200">|</span>
        </div>
      ))}
    </>
  );

  return (
    <section className="relative py-5 bg-white border-b border-gray-100 overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      <div className="flex animate-marquee" style={{ '--duration': '35s' } as React.CSSProperties}>
        <FeatureList />
        <FeatureList />
      </div>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────
function Services() {
  const services = [
    {
      icon: BanknotesIcon,
      title: 'Working Capital Loans',
      description:
        'Keep your business running smoothly with flexible working capital solutions. Fund payroll, inventory, marketing, and day-to-day operations without disruption.',
      features: ['$2K - $2M funding', 'Same-day approvals', 'Flexible repayment terms'],
      gradient: 'from-[#0f79be] to-[#0b5e96]',
    },
    {
      icon: CreditCardIcon,
      title: 'Business Line of Credit',
      description:
        'Access funds when you need them with a revolving line of credit. Only pay interest on what you use, and replenish your available balance as you repay.',
      features: ['Revolving credit access', 'Pay only what you use', 'Quick draw capability'],
      gradient: 'from-[#0a2540] to-[#0f3d6b]',
    },
    {
      icon: WrenchScrewdriverIcon,
      title: 'Equipment Financing',
      description:
        'Acquire the equipment your business needs to grow without draining your cash reserves. Finance new or used equipment with competitive rates.',
      features: ['Up to 100% financing', 'New & used equipment', 'Competitive rates'],
      gradient: 'from-[#0f79be] to-[#5eb8e8]',
    },
  ];

  return (
    <section id="services" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-[#0f79be]/[0.08] text-[#0f79be] text-sm font-semibold rounded-full mb-4 tracking-wide">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-[#0a2540] mb-5 tracking-[-0.02em]">
            Funding Solutions That Fit
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            We offer a range of business funding options designed to help your company thrive at every stage.
          </p>
        </FadeInSection>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <FadeInSection key={service.title} delay={index * 0.15}>
              <div className="gradient-border group relative h-full bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-2xl hover:shadow-[#0f79be]/[0.08] transition-all duration-500 hover:-translate-y-1">
                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#0f79be]/20 group-hover:scale-105 transition-transform duration-500`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-[#0a2540] mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-[#0f79be]/[0.08] flex items-center justify-center flex-shrink-0">
                        <CheckBadgeIcon className="w-3.5 h-3.5 text-[#0f79be]" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── About / Why Us ───────────────────────────────────────────────────────────
function About() {
  const differentiators = [
    {
      icon: ChartBarIcon,
      title: 'Cash Flow Based Lending',
      description: 'We look at your business performance, not just your FICO score. Our comprehensive evaluations consider the full picture.',
      stat: 'Full Picture',
    },
    {
      icon: ClockIcon,
      title: '12-Hour Approvals',
      description: 'Time is money. We understand the urgency and deliver funding decisions in approximately 12 hours.',
      stat: '12hr',
    },
    {
      icon: UserGroupIcon,
      title: '90+ Professionals',
      description: 'Our dedicated team of funding specialists works around the clock to get your business the capital it needs.',
      stat: '90+',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Since 2008',
      description: 'With over 15 years of experience, we have the expertise and relationships to fund businesses of all sizes.',
      stat: '15+ yrs',
    },
  ];

  return (
    <section id="about" className="py-24 md:py-32 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <FadeInSection>
            <span className="inline-block px-4 py-1.5 bg-[#0f79be]/[0.08] text-[#0f79be] text-sm font-semibold rounded-full mb-4 tracking-wide">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-[#0a2540] mb-6 tracking-[-0.02em]">
              Beyond Traditional Lending
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed mb-8">
              Prudential Capital distinguishes itself by moving beyond traditional FICO-based
              lending models. Since 2008, we conduct comprehensive business evaluations based
              on cash flow rather than owner credit history. We believe every business deserves
              access to the capital it needs to grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/apply"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#0f79be] text-white font-semibold rounded-xl hover:bg-[#0b5e96] transition-all duration-300 shadow-lg shadow-[#0f79be]/20 hover:shadow-[#0f79be]/30 cursor-pointer"
              >
                Get Started Today
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <a
                href="tel:7029793327"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all duration-300 cursor-pointer"
              >
                <PhoneIcon className="w-4 h-4" />
                Speak With Us
              </a>
            </div>
          </FadeInSection>

          {/* Right Grid */}
          <div className="grid grid-cols-2 gap-4">
            {differentiators.map((item, index) => (
              <FadeInSection key={item.title} delay={index * 0.1}>
                <div className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#0f79be]/20 hover:shadow-xl hover:shadow-[#0f79be]/[0.06] transition-all duration-500 cursor-pointer hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-[#0f79be]/[0.08] rounded-lg flex items-center justify-center group-hover:bg-[#0f79be]/[0.12] transition-colors duration-300">
                      <item.icon className="w-5 h-5 text-[#0f79be]" />
                    </div>
                    <span className="text-xs font-bold text-[#0f79be]/60 tracking-wider uppercase">{item.stat}</span>
                  </div>
                  <h3 className="font-bold text-[#0a2540] mb-1.5 text-sm">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { value: 1300, suffix: '+', label: 'Businesses Grown' },
    { value: 70, prefix: '$', suffix: 'M+', label: 'Funded Globally' },
    { value: 36000, suffix: '', label: 'Loans Funded' },
    { value: 98, suffix: '%', label: 'Success Rate' },
    { value: 12000, suffix: '+', label: 'Happy Customers' },
    { value: 24, suffix: 'hr', label: 'Turnaround Time' },
  ];

  return (
    <section id="results" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#071a2e] via-[#0a2540] to-[#0d3a5c]" />

      {/* Animated orbs */}
      <div
        className="absolute top-[-10%] right-[10%] w-[400px] h-[400px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(15,121,190,0.5) 0%, transparent 70%)',
          animation: 'float-slow 18s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-[-10%] left-[5%] w-[350px] h-[350px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(94,184,232,0.4) 0%, transparent 70%)',
          animation: 'float-medium 14s ease-in-out infinite',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-white/[0.08] text-white/80 text-sm font-semibold rounded-full mb-4 tracking-wide border border-white/[0.08]">
            Our Track Record
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-white mb-5 tracking-[-0.02em]">
            Numbers That Speak
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            Over 15 years of helping businesses access the capital they need to grow and succeed.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <FadeInSection key={stat.label} delay={index * 0.08}>
              <div className="text-center p-6 md:p-8 rounded-2xl bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.15] transition-all duration-500 cursor-pointer group">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix || ''} />
                </div>
                <div className="text-sm sm:text-base text-white/50 font-medium group-hover:text-white/70 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials (Premium Carousel) ──────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    {
      quote: "Prudential Capital funded our expansion in just 48 hours. The process was seamless, and their team made us feel like a priority, not just another application.",
      name: 'Marcus Thompson',
      title: 'CEO, Thompson Construction',
      funded: '$250,000',
      rating: 5,
    },
    {
      quote: "After being turned down by three banks, Prudential Capital saw the potential in our business. They looked at our cash flow, not just our credit, and we got approved the same day.",
      name: 'Lisa Chen',
      title: 'Owner, Golden State Catering',
      funded: '$150,000',
      rating: 5,
    },
    {
      quote: "The speed and professionalism were unmatched. We needed equipment financing fast, and Prudential Capital delivered. Their rates were competitive and the terms were fair.",
      name: 'David Rodriguez',
      title: 'COO, Pacific Logistics',
      funded: '$500,000',
      rating: 5,
    },
    {
      quote: "Working with Prudential Capital transformed our business. Their team understood our industry and provided a funding solution tailored to our seasonal revenue patterns.",
      name: 'Sarah Mitchell',
      title: 'Founder, Bloom Retail Co.',
      funded: '$100,000',
      rating: 5,
    },
  ];

  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handlePrev = () => {
    setDirection(-1);
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setDirection(1);
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <section id="testimonials" className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-[#0f79be]/[0.08] text-[#0f79be] text-sm font-semibold rounded-full mb-4 tracking-wide">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-[#0a2540] mb-5 tracking-[-0.02em]">
            What Our Clients Say
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Join thousands of business owners who have trusted Prudential Capital to fuel their growth.
          </p>
        </FadeInSection>

        {/* Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative min-h-[340px] md:min-h-[280px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={active}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 },
                }}
                className="absolute inset-0"
              >
                <div className="testimonial-glow relative h-full bg-gradient-to-br from-[#f8fafc] to-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-lg shadow-black/[0.03]">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-6">
                    {Array.from({ length: testimonials[active].rating }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08, duration: 0.3 }}
                      >
                        <StarIconSolid className="w-5 h-5 text-amber-400" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Quote with word-by-word blur reveal */}
                  <p className="text-gray-600 leading-relaxed mb-8 text-lg md:text-xl">
                    <span className="text-gray-300 text-2xl font-serif">&ldquo;</span>
                    {testimonials[active].quote.split(' ').map((word, index) => (
                      <motion.span
                        key={`${active}-${index}`}
                        initial={{ opacity: 0, filter: 'blur(8px)', y: 4 }}
                        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                        transition={{
                          duration: 0.25,
                          delay: 0.15 + index * 0.025,
                          ease: 'easeOut',
                        }}
                        className="inline-block mr-[0.25em]"
                      >
                        {word}
                      </motion.span>
                    ))}
                    <span className="text-gray-300 text-2xl font-serif">&rdquo;</span>
                  </p>

                  {/* Author */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0f79be] to-[#0a2540] flex items-center justify-center text-white font-semibold text-sm">
                          {testimonials[active].name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <motion.div
                          className="absolute -inset-1 rounded-full border-2 border-[#0f79be]/20"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-[#0a2540]">{testimonials[active].name}</p>
                        <p className="text-gray-500 text-sm">{testimonials[active].title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Funded</p>
                      <p className="text-[#0f79be] font-bold text-lg">{testimonials[active].funded}</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <motion.button
              onClick={handlePrev}
              className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-[#0f79be]/10 hover:text-[#0f79be] transition-all cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Previous testimonial"
            >
              <ArrowRightIcon className="w-5 h-5 rotate-180" />
            </motion.button>

            <div className="flex gap-2.5">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setDirection(index > active ? 1 : -1);
                    setActive(index);
                  }}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    index === active
                      ? 'w-8 h-3 bg-[#0f79be]'
                      : 'w-3 h-3 bg-gray-200 hover:bg-gray-300'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <motion.button
              onClick={handleNext}
              className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-[#0f79be]/10 hover:text-[#0f79be] transition-all cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Next testimonial"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] via-[#e8f4fc] to-[#f0f7fc]" />
      <div
        className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(15,121,190,0.15) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeInSection>
          <div className="bg-white rounded-3xl p-10 md:p-16 shadow-xl shadow-[#0f79be]/[0.06] border border-gray-100/80">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-[#0a2540] mb-6 tracking-[-0.02em]">
              Ready to Grow Your Business?
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Join over 1,300 businesses that have trusted Prudential Capital to fuel their growth.
              Apply today and see if you qualify in minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/apply"
                className="group inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-[#0f79be] text-white text-lg font-semibold rounded-xl hover:bg-[#0b5e96] transition-all duration-300 shadow-xl shadow-[#0f79be]/25 hover:shadow-[#0f79be]/40 hover:-translate-y-0.5 cursor-pointer"
              >
                Start Your Application
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <a
                href="tel:7029793327"
                className="inline-flex items-center justify-center gap-2.5 px-10 py-4 border-2 border-gray-200 text-gray-700 text-lg font-semibold rounded-xl hover:border-[#0f79be] hover:text-[#0f79be] transition-all duration-300 cursor-pointer"
              >
                <PhoneIcon className="w-5 h-5" />
                Call Us Now
              </a>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function Contact() {
  const contacts = [
    {
      icon: PhoneIcon,
      title: 'Phone',
      value: '(702) 979-3327',
      href: 'tel:7029793327',
      description: 'Mon-Fri, 8am-6pm PST',
    },
    {
      icon: EnvelopeIcon,
      title: 'Email',
      value: 'info@prudentialcap.com',
      href: 'mailto:info@prudentialcap.com',
      description: 'We respond within 24 hours',
    },
    {
      icon: MapPinIcon,
      title: 'Office',
      value: '6605 Grand Montecito Pkwy',
      href: undefined,
      description: 'Suite 100, Las Vegas, NV 89149',
    },
  ];

  return (
    <section id="contact" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-[#0f79be]/[0.08] text-[#0f79be] text-sm font-semibold rounded-full mb-4 tracking-wide">
            Get In Touch
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-[#0a2540] mb-5 tracking-[-0.02em]">
            Contact Us Today
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Have questions? Our team is ready to help you find the right funding solution.
          </p>
        </FadeInSection>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {contacts.map((contact, index) => (
            <FadeInSection key={contact.title} delay={index * 0.1}>
              <div className="group text-center p-8 bg-[#f8fafc] rounded-2xl border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-[#0f79be]/[0.06] hover:border-[#0f79be]/15 transition-all duration-500 cursor-pointer hover:-translate-y-0.5">
                <div className="w-14 h-14 bg-[#0f79be]/[0.08] rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#0f79be]/[0.12] group-hover:scale-105 transition-all duration-300">
                  <contact.icon className="w-6 h-6 text-[#0f79be]" />
                </div>
                <h3 className="font-bold text-[#0a2540] mb-2 text-lg">{contact.title}</h3>
                {contact.href ? (
                  <a href={contact.href} className="text-gray-600 hover:text-[#0f79be] transition-colors font-medium cursor-pointer">
                    {contact.value}
                  </a>
                ) : (
                  <p className="text-gray-600 font-medium">{contact.value}</p>
                )}
                <p className="text-gray-400 text-sm mt-1">{contact.description}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#071a2e] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Image
              src="/prud-cap-logo.png"
              alt="Prudential Capital"
              width={200}
              height={60}
              className="h-12 w-auto mb-5 brightness-0 invert"
            />
            <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-6">
              Prudential Capital provides fast, flexible business funding solutions.
              Since 2008, we&apos;ve helped over 1,300 businesses access the capital
              they need to grow and succeed.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 text-sm text-gray-400">
              <a href="tel:7029793327" className="hover:text-white transition-colors duration-200 flex items-center gap-2 cursor-pointer">
                <PhoneIcon className="w-4 h-4 text-[#0f79be]" /> (702) 979-3327
              </a>
              <span className="hidden sm:block text-gray-700">|</span>
              <a href="mailto:info@prudentialcap.com" className="hover:text-white transition-colors duration-200 flex items-center gap-2 cursor-pointer">
                <EnvelopeIcon className="w-4 h-4 text-[#0f79be]" /> info@prudentialcap.com
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-gray-300 mb-5">
              Services
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#services" className="hover:text-white transition-colors duration-200 cursor-pointer">Working Capital Loans</a></li>
              <li><a href="#services" className="hover:text-white transition-colors duration-200 cursor-pointer">Business Line of Credit</a></li>
              <li><a href="#services" className="hover:text-white transition-colors duration-200 cursor-pointer">Equipment Financing</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-gray-300 mb-5">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#about" className="hover:text-white transition-colors duration-200 cursor-pointer">About Us</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors duration-200 cursor-pointer">Testimonials</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors duration-200 cursor-pointer">Contact</a></li>
              <li><Link href="/apply" className="hover:text-white transition-colors duration-200 cursor-pointer">Apply Now</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Prudential Capital. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            6605 Grand Montecito Pkwy, Suite 100, Las Vegas, NV 89149
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Back to Top ──────────────────────────────────────────────────────────────
function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-[#0f79be] text-white rounded-full shadow-lg shadow-[#0f79be]/30 flex items-center justify-center hover:bg-[#0b5e96] transition-all duration-300 hover:-translate-y-0.5 z-40 cursor-pointer"
          aria-label="Back to top"
        >
          <ChevronUpIcon className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustBar />
      <Services />
      <About />
      <Stats />
      <Testimonials />
      <CTA />
      <Contact />
      <Footer />
      <BackToTop />
    </>
  );
}
