'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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
    { href: '#stats', label: 'Results' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/prud-cap-logo.png"
              alt="Prudential Capital"
              width={260}
              height={78}
              className={`h-16 w-auto transition-all duration-300 ${
                scrolled ? '' : 'brightness-0 invert'
              }`}
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  scrolled
                    ? 'text-gray-700 hover:text-[#0f79be] hover:bg-[#0f79be]/5'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#0f79be] transition-all duration-300 group-hover:w-6 rounded-full" />
              </a>
            ))}
            <div className={`w-px h-6 mx-2 ${scrolled ? 'bg-gray-200' : 'bg-white/20'}`} />
            <a
              href="tel:7029793327"
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                scrolled
                  ? 'text-gray-600 hover:text-[#0f79be]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <PhoneIcon className="w-4 h-4" />
              (702) 979-3327
            </a>
            <Link
              href="/apply"
              className="ml-2 px-6 py-2.5 bg-[#0f79be] text-white text-sm font-semibold rounded-lg hover:bg-[#0b5e96] transition-all duration-200 shadow-lg shadow-[#0f79be]/25 hover:shadow-[#0f79be]/40 hover:-translate-y-0.5"
            >
              Apply Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-gray-700' : 'text-white'
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
            className="md:hidden bg-white border-t border-gray-100 shadow-xl"
          >
            <div className="px-4 py-6 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-[#0f79be]/5 hover:text-[#0f79be] transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <a
                  href="tel:7029793327"
                  className="flex items-center gap-3 px-4 py-3 text-gray-600 font-medium"
                >
                  <PhoneIcon className="w-5 h-5 text-[#0f79be]" />
                  (702) 979-3327
                </a>
                <Link
                  href="/apply"
                  onClick={() => setIsOpen(false)}
                  className="block text-center px-6 py-3 bg-[#0f79be] text-white font-semibold rounded-lg hover:bg-[#0b5e96] transition-colors"
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
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
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
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a2540] via-[#0f3d6b] to-[#0f79be]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(15,121,190,0.3),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(10,37,64,0.5),transparent_60%)]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
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
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium rounded-full border border-white/10 mb-6">
              <ShieldCheckIcon className="w-4 h-4 text-[#0f79be]" />
              Trusted by 1,300+ Businesses Since 2008
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-playfair)] font-bold text-white leading-[1.1] mb-6"
          >
            Business Loans{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5eb8e8] to-[#a8d8f0]">
              Have Never Been
            </span>{' '}
            Easier
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-white/70 max-w-xl mb-10 leading-relaxed"
          >
            Simple. Straightforward. Fast. Get funded from $2,000 to $2,000,000
            with approvals in as little as 12 hours. We evaluate your business, not
            just your credit score.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0f79be] text-white text-base font-semibold rounded-xl hover:bg-[#0b5e96] transition-all duration-200 shadow-xl shadow-[#0f79be]/30 hover:shadow-[#0f79be]/50 hover:-translate-y-0.5 group"
            >
              See If You Qualify
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="tel:7029793327"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-base font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200"
            >
              <PhoneIcon className="w-5 h-5" />
              Call (702) 979-3327
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5"
        >
          <motion.div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>
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
    },
    {
      icon: CreditCardIcon,
      title: 'Business Line of Credit',
      description:
        'Access funds when you need them with a revolving line of credit. Only pay interest on what you use, and replenish your available balance as you repay.',
      features: ['Revolving credit access', 'Pay only what you use', 'Quick draw capability'],
    },
    {
      icon: WrenchScrewdriverIcon,
      title: 'Equipment Financing',
      description:
        'Acquire the equipment your business needs to grow without draining your cash reserves. Finance new or used equipment with competitive rates.',
      features: ['Up to 100% financing', 'New & used equipment', 'Competitive rates'],
    },
  ];

  return (
    <section id="services" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-[#0f79be]/10 text-[#0f79be] text-sm font-semibold rounded-full mb-4">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-[#0a2540] mb-4">
            Funding Solutions That Fit
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            We offer a range of business funding options designed to help your company thrive at every stage.
          </p>
        </FadeInSection>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <FadeInSection key={service.title} delay={index * 0.15}>
              <div className="group relative h-full bg-white rounded-2xl border border-gray-100 p-8 hover:border-[#0f79be]/20 hover:shadow-xl hover:shadow-[#0f79be]/5 transition-all duration-500">
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-[#0f79be] to-[#0b5e96] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-[#0a2540] mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2.5">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <CheckBadgeIcon className="w-5 h-5 text-[#0f79be] flex-shrink-0" />
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
    },
    {
      icon: ClockIcon,
      title: '12-Hour Approvals',
      description: 'Time is money. We understand the urgency and deliver funding decisions in approximately 12 hours.',
    },
    {
      icon: UserGroupIcon,
      title: '90+ Professionals',
      description: 'Our dedicated team of funding specialists works around the clock to get your business the capital it needs.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Since 2008',
      description: 'With over 15 years of experience, we have the expertise and relationships to fund businesses of all sizes.',
    },
  ];

  return (
    <section id="about" className="py-24 md:py-32 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <FadeInSection>
            <span className="inline-block px-4 py-1.5 bg-[#0f79be]/10 text-[#0f79be] text-sm font-semibold rounded-full mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-[#0a2540] mb-6">
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
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0f79be] text-white font-semibold rounded-xl hover:bg-[#0b5e96] transition-all duration-200 shadow-lg shadow-[#0f79be]/20 group"
              >
                Get Started Today
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="tel:7029793327"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-white hover:border-gray-300 transition-all duration-200"
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
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#0f79be]/20 hover:shadow-lg transition-all duration-300">
                  <item.icon className="w-8 h-8 text-[#0f79be] mb-3" />
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
    { value: '1,300+', label: 'Businesses Grown' },
    { value: '$70M+', label: 'Funded Globally' },
    { value: '36,000', label: 'Loans Funded' },
    { value: '98%', label: 'Success Rate' },
    { value: '12K+', label: 'Happy Customers' },
    { value: '24hr', label: 'Turnaround Time' },
  ];

  return (
    <section id="stats" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a2540] via-[#0f3d6b] to-[#0f79be]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,121,190,0.2),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 text-sm font-semibold rounded-full mb-4">
            Our Track Record
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-white mb-4">
            Numbers That Speak
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Over 15 years of helping businesses access the capital they need to grow and succeed.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <FadeInSection key={stat.label} delay={index * 0.1}>
              <div className="text-center p-6 md:p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-white/60 font-medium">
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

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeInSection>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-[#0a2540] mb-6">
            Ready to Grow Your Business?
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
            Join over 1,300 businesses that have trusted Prudential Capital to fuel their growth.
            Apply today and see if you qualify in minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-[#0f79be] text-white text-lg font-semibold rounded-xl hover:bg-[#0b5e96] transition-all duration-200 shadow-xl shadow-[#0f79be]/25 hover:shadow-[#0f79be]/40 hover:-translate-y-0.5 group"
            >
              Start Your Application
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="tel:7029793327"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 border-2 border-gray-200 text-gray-700 text-lg font-semibold rounded-xl hover:border-[#0f79be] hover:text-[#0f79be] transition-all duration-200"
            >
              <PhoneIcon className="w-5 h-5" />
              Call Us Now
            </a>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function Contact() {
  return (
    <section id="contact" className="py-24 md:py-32 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-[#0f79be]/10 text-[#0f79be] text-sm font-semibold rounded-full mb-4">
            Get In Touch
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold text-[#0a2540] mb-4">
            Contact Us Today
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Have questions? Our team is ready to help you find the right funding solution.
          </p>
        </FadeInSection>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <FadeInSection delay={0}>
            <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-[#0f79be]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="w-7 h-7 text-[#0f79be]" />
              </div>
              <h3 className="font-bold text-[#0a2540] mb-2">Phone</h3>
              <a href="tel:7029793327" className="text-gray-500 hover:text-[#0f79be] transition-colors">
                (702) 979-3327
              </a>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-[#0f79be]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <EnvelopeIcon className="w-7 h-7 text-[#0f79be]" />
              </div>
              <h3 className="font-bold text-[#0a2540] mb-2">Email</h3>
              <a href="mailto:info@prudentialcap.com" className="text-gray-500 hover:text-[#0f79be] transition-colors">
                info@prudentialcap.com
              </a>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-[#0f79be]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-7 h-7 text-[#0f79be]" />
              </div>
              <h3 className="font-bold text-[#0a2540] mb-2">Office</h3>
              <p className="text-gray-500 text-sm">
                6605 Grand Montecito Pkwy<br />
                Suite 100, Las Vegas, NV 89149
              </p>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#0a2540] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Image
              src="/prud-cap-logo.png"
              alt="Prudential Capital"
              width={220}
              height={66}
              className="h-14 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-6">
              Prudential Capital provides fast, flexible business funding solutions.
              Since 2008, we&apos;ve helped over 1,300 businesses access the capital
              they need to grow and succeed.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <a href="tel:7029793327" className="hover:text-white transition-colors flex items-center gap-1.5">
                <PhoneIcon className="w-4 h-4" /> (702) 979-3327
              </a>
              <span className="text-gray-600">|</span>
              <a href="mailto:info@prudentialcap.com" className="hover:text-white transition-colors flex items-center gap-1.5">
                <EnvelopeIcon className="w-4 h-4" /> info@prudentialcap.com
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><a href="#services" className="hover:text-white transition-colors">Working Capital Loans</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Business Line of Credit</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Equipment Financing</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              <li><Link href="/apply" className="hover:text-white transition-colors">Apply Now</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
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
          className="fixed bottom-8 right-8 w-12 h-12 bg-[#0f79be] text-white rounded-full shadow-lg shadow-[#0f79be]/30 flex items-center justify-center hover:bg-[#0b5e96] transition-all duration-200 hover:-translate-y-0.5 z-40"
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
      <Services />
      <About />
      <Stats />
      <CTA />
      <Contact />
      <Footer />
      <BackToTop />
    </>
  );
}
