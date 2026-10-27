"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UserCheck,
  Search,
  KeyRound,
  Camera,
  ShieldCheck,
  FileCheck2,
  Clock,
  Coins,
  MapPin,
  ArrowRight,
  Sparkles,
  Zap,
  Mail,
  Phone,
  MessageSquare,
  Send,
  CheckCircle2,
  Headphones,
  AlertCircle,
} from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      icon: UserCheck,
      title: "Sign Up & Verify",
      desc: "Create an account with your official college .edu email and verify your student status in 60 seconds.",
    },
    {
      num: "02",
      icon: Search,
      title: "Find a Vehicle",
      desc: "Browse bikes and scooters parked right near your dorms, libraries, and campus transit spots.",
    },
    {
      num: "03",
      icon: KeyRound,
      title: "Book & Ride",
      desc: "Select a time slot, get the instant unlock code or meet your classmate, and zip across campus.",
    },
    {
      num: "04",
      icon: Camera,
      title: "Return with Photo",
      desc: "Park at the designated campus hub, snap a timestamped photo in the app, and lock up cleanly.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-24 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-4 tracking-tight">
            How Wheelzy Works
          </h2>
          <p className="text-base text-gray-500 mt-3">
            Designed for busy students. No lengthy rental counters, no surprise deposits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-gray-50/70 hover:bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center justify-center text-emerald-800 group-hover:bg-[#064E3B] group-hover:text-emerald-300 transition-colors">
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span className="text-2xl font-black text-gray-300 group-hover:text-emerald-600 transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#064E3B] transition-colors mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200/50 flex items-center text-xs font-semibold text-emerald-700">
                  <span>Student step {idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WhyChooseSection() {
  const perks = [
    {
      icon: ShieldCheck,
      title: "Verified College Community",
      desc: "Every renter and owner verifies their college identity and valid driver’s license before any ride takes place.",
    },
    {
      icon: Coins,
      title: "Affordable Short-Term Rentals",
      desc: "Rates starting as low as $3.50/hour with flexible booking slots designed around class schedules.",
    },
    {
      icon: FileCheck2,
      title: "Transparent Booking Information",
      desc: "No hidden surge pricing, fuel surprises, or surprise late fees. Pay only for the exact hours you ride.",
    },
    {
      icon: Camera,
      title: "Return Photo Tracking",
      desc: "Timestamped return photo upload ensures mutual accountability and protects both rider and vehicle owner.",
    },
    {
      icon: MapPin,
      title: "Convenient Campus Mobility",
      desc: "Hubs placed right at dorm quads, engineering halls, and student centers so you're never more than a 2-minute walk away.",
    },
    {
      icon: Zap,
      title: "Instant Digital Key Access",
      desc: "Smooth digital checkout directly from your mobile browser without waiting around in lines.",
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-[#F8FAFC] border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
              Why Choose Wheelzy
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-4 tracking-tight">
              Built for campus life, powered by fellow students.
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-500 max-w-md">
            Skip the expensive rideshares and bulky transit schedules. Wheelzy provides convenient, low-cost wheels whenever you need them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {perks.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-start"
              >
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export function ListYourVehicleSection() {
  return (
    <section className="py-20 sm:py-24 bg-white border-b border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#064E3B] to-[#043D2F] rounded-3xl lg:rounded-[2.5rem] p-8 sm:p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden">

          {/* Background decorative glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-300/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                Turn Idle Wheels into College Income
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Got a bike or scooter sitting idle during lectures?
              </h2>

              <p className="text-sm sm:text-base text-emerald-100/90 max-w-xl leading-relaxed">
                List your vehicle on Wheelzy and earn up to $300+/month renting safely to verified classmates on your campus. You set your availability, prices, and pickup rules.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <p className="text-2xl font-black text-white">$15–$30</p>
                  <p className="text-xs text-emerald-200 mt-1">Average daily earnings</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <p className="text-2xl font-black text-white">100%</p>
                  <p className="text-xs text-emerald-200 mt-1">Verified student riders</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <p className="text-2xl font-black text-white">Zero</p>
                  <p className="text-xs text-emerald-200 mt-1">Upfront listing fees</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/owner"
                  className="px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-950/20 active:scale-95 inline-flex items-center gap-2"
                >
                  List Your Vehicle <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/owner"
                  className="px-5 py-3.5 text-white/90 hover:text-white border border-white/20 hover:bg-white/10 rounded-2xl text-sm font-semibold transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Image Container */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
                <Image
                  src="/owner_earning.jpg"
                  alt="College student proudly standing next to parked scooter on campus"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-gray-900 rounded-2xl p-4 shadow-xl border border-gray-100 hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Student Host Certified</p>
                  <p className="text-[11px] text-gray-500">Earned $340 last month</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export function SafetyAndTrustSection() {
  const safetyPoints = [
    {
      title: "College Student Verification",
      desc: "Mandatory .edu identity check and campus enrollment authentication before renting or hosting.",
    },
    {
      title: "Driving Licence Verification",
      desc: "Government-issued driving licence verification for all motorized scooters and road vehicles.",
    },
    {
      title: "Vehicle Document Checks",
      desc: "Registration certificates, insurance documents, and fitness checks reviewed before listing activation.",
    },
    {
      title: "Detailed Booking Records",
      desc: "Cryptographically logged timestamps, campus pickup hubs, and authorized digital handovers.",
    },
    {
      title: "Return Photo Tracking",
      desc: "Comprehensive 360-degree vehicle condition photos uploaded at checkout to avoid disputes.",
    },
    {
      title: "Report & Complaint Handling",
      desc: "24/7 dedicated campus support team to investigate damages, delays, and community concerns.",
    },
  ];

  return (
    <section id="safety" className="py-20 sm:py-24 bg-[#F8FAFC] border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="max-w-3xl mb-14">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
            Trust & Community Safety
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-4 tracking-tight">
            Accountability and trust built into every ride.
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-3 leading-relaxed">
            Wheelzy does not guarantee safety, but we implement rigorous community trust standards and operational verification measures so you can ride and host with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safetyPoints.map((point, i) => (
            <div
              key={point.title}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black flex items-center justify-center mb-4">
                  0{i + 1}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{point.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{point.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export function FinalCTASection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight">
          Your Next Ride Is Closer Than You Think.
        </h2>
        <p className="text-base sm:text-lg text-gray-500 mt-4 max-w-xl mx-auto">
          Find a ride for your next campus trip, or put your vehicle to good use.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#explore-rides"
            className="px-8 py-4 bg-[#064E3B] hover:bg-[#043D2F] text-white font-bold rounded-2xl shadow-xl shadow-emerald-950/20 active:scale-95 transition-all text-sm sm:text-base flex items-center gap-2"
          >
            Find a Ride <ArrowRight className="w-4 h-4" />
          </a>
          <Link
            href="/owner"
            className="px-8 py-4 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold rounded-2xl border border-gray-200 transition-all text-sm sm:text-base"
          >
            List Your Vehicle
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    campus: "UC Berkeley",
    topic: "Renter Support",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };

  return (
    <section id="contact" className="py-20 sm:py-24 bg-gradient-to-b from-white to-gray-50/60 border-b border-gray-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-3 border border-emerald-100">
            <Headphones className="w-3.5 h-3.5 text-emerald-600" />
            <span>Campus Assistance & Operations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Contact & Campus Support
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
            Have questions about booking a ride, listing your two-wheeler, or finding your designated campus hub? We&apos;re here for you 7 days a week.
          </p>
        </div>

        {/* 3 Contact Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Card 1: Student Renters */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Student Riders</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Help with instant bookings, verification, lock codes, and mandatory return schedule check-in.
            </p>
            <div className="space-y-2 pt-3 border-t border-gray-100 text-xs font-semibold text-gray-700">
              <a href="mailto:support@wheelzy.campus" className="flex items-center gap-2 text-emerald-700 hover:underline">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>support@wheelzy.campus</span>
              </a>
              <a href="tel:+15108437433" className="flex items-center gap-2 text-gray-700 hover:text-emerald-700">
                <Phone className="w-3.5 h-3.5 text-gray-500" />
                <span>+1 (510) 843-RIDE (Ext 1)</span>
              </a>
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Daily 7:00 AM – 11:00 PM</span>
              </div>
            </div>
          </div>

          {/* Card 2: Vehicle Hosts */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Vehicle Hosts</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Assistance with adding bikes/scooters, setting return deadlines, daily earnings, and photo verification.
            </p>
            <div className="space-y-2 pt-3 border-t border-gray-100 text-xs font-semibold text-gray-700">
              <a href="mailto:hosts@wheelzy.campus" className="flex items-center gap-2 text-teal-700 hover:underline">
                <Mail className="w-3.5 h-3.5 text-teal-600" />
                <span>hosts@wheelzy.campus</span>
              </a>
              <a href="tel:+15108437433" className="flex items-center gap-2 text-gray-700 hover:text-teal-700">
                <Phone className="w-3.5 h-3.5 text-gray-500" />
                <span>+1 (510) 843-RIDE (Ext 2)</span>
              </a>
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>Campus Quad Hubs: Mon – Fri</span>
              </div>
            </div>
          </div>

          {/* Card 3: 24/7 Safety & Campus Security */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all group bg-gradient-to-br from-white to-emerald-50/20">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Campus Safety & Overdue</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Direct dispatch for overdue vehicle recoveries, damaged rides, or security coordinator escalations.
            </p>
            <div className="space-y-2 pt-3 border-t border-gray-100 text-xs font-semibold text-gray-700">
              <a href="mailto:safety@wheelzy.campus" className="flex items-center gap-2 text-emerald-700 hover:underline">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>safety@wheelzy.campus</span>
              </a>
              <a href="tel:+15108437233" className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold">
                <Phone className="w-3.5 h-3.5 text-red-500" />
                <span>+1 (510) 843-SAFE (24/7 Hotline)</span>
              </a>
              <div className="flex items-center gap-2 text-[11px] text-emerald-700">
                <Clock className="w-3.5 h-3.5" />
                <span>24 Hours / 7 Days On-Campus</span>
              </div>
            </div>
          </div>

        </div>

        {/* Interactive In-Platform Contact Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Send an Inquiry or Feedback</h3>
              <p className="text-xs text-gray-500">Our campus team responds within 1 hour during operational hours.</p>
            </div>
          </div>

          {isSubmitted ? (
            <div className="rounded-2xl bg-emerald-50 p-6 border border-emerald-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-emerald-950">Message Received!</h4>
              <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
                Thank you for reaching out, {formData.name}. A Wheelzy campus coordinator will follow up at <span className="font-semibold">{formData.email}</span> shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ name: "", email: "", campus: "UC Berkeley", topic: "Renter Support", message: "" });
                }}
                className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Marcus Chen"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Student / Campus Email (.edu)</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@berkeley.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Campus Hub</label>
                  <select
                    value={formData.campus}
                    onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  >
                    <option value="UC Berkeley">UC Berkeley (Sproul / Moffitt)</option>
                    <option value="Stanford University">Stanford University (White Plaza)</option>
                    <option value="UCLA">UCLA (Westwood / Bruin Walk)</option>
                    <option value="MIT">MIT / Harvard Yard</option>
                    <option value="UT Austin">UT Austin (Speedway Hub)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Topic</label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  >
                    <option value="Renter Support">Renter & Booking Support</option>
                    <option value="Host Inquiry">Listing & Host Question</option>
                    <option value="Return Deadline">Return Deadline / Scheduling</option>
                    <option value="Safety Report">Report Safety or Incident</option>
                    <option value="General Feedback">General Feedback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">How can we help?</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your question, request, or issue with vehicle location or lock..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Sending..." : "Submit Message"}</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </section>
  );
}

export function FooterSection() {
  return (
    <footer className="bg-[#0B1320] text-gray-400 py-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">Wheelzy</span>
            </div>
            <p className="text-sm font-semibold text-emerald-400 tracking-wide">Book. Ride. Return.</p>
            <p className="text-xs sm:text-sm text-gray-400 max-w-sm leading-relaxed">
              A peer-to-peer bike and scooter rental platform designed for verified college students. Safe, affordable campus transport between classes and dorms.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#vehicles" className="hover:text-white transition-colors">Rent a Ride</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact & Support</a></li>
              <li><Link href="/owner" className="hover:text-white transition-colors">List Your Vehicle</Link></li>
              <li><Link href="/renter" className="hover:text-white transition-colors">Student Dashboard</Link></li>
            </ul>
          </div>

          {/* Campuses */}
          <div id="campus-hubs">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Campus Hubs</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><span className="text-gray-400">UC Berkeley Hub</span></li>
              <li><span className="text-gray-400">Stanford Campus</span></li>
              <li><span className="text-gray-400">UCLA West Quad</span></li>
              <li><span className="text-gray-400">MIT / Harvard Yards</span></li>
              <li><span className="text-gray-400">UT Austin Speedway</span></li>
            </ul>
          </div>

          {/* Safety & Legal */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Trust & Legal</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><a href="#safety" className="hover:text-white transition-colors">Safety Standards</a></li>
              <li><Link href="/renter/report" className="hover:text-white transition-colors">Report an Issue</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 Wheelzy Technologies Inc. All rights reserved.</p>
          <p className="text-[11px] text-gray-500">
            For verified college students with valid campus ID.
          </p>
        </div>

      </div>
    </footer>
  );
}
