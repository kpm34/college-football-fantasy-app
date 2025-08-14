'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  TrophyIcon, 
  UserGroupIcon,
  ClockIcon,
  CheckIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function LaunchPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Add email to waitlist/early access
      await fetch('/api/launch/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'launch_page' })
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit email:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: SparklesIcon,
      title: "AI Draft Assistant",
      description: "Get real-time recommendations powered by Claude AI during your draft"
    },
    {
      icon: TrophyIcon,
      title: "Power 4 Conferences",
      description: "Draft from SEC, ACC, Big 12, and Big Ten - the players you actually watch"
    },
    {
      icon: UserGroupIcon,
      title: "Free League Creation",
      description: "Create leagues with friends in under 60 seconds, completely free"
    },
    {
      icon: ClockIcon,
      title: "Real-Time Scoring",
      description: "Live updates during games with sub-100ms latency"
    }
  ];

  const stats = [
    { value: "30M+", label: "Fantasy Players Want College" },
    { value: "0", label: "Major Competitors" },
    { value: "<60s", label: "League Creation Time" },
    { value: "100%", label: "Free to Play" }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6B3AA0] via-[#A374B5] to-[#E73C7E]">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4">
        <div className="container mx-auto text-center">
          {/* Countdown Timer */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#E73C7E] text-white px-6 py-2 rounded-full font-semibold mb-8"
          >
            <FireIcon className="h-5 w-5" />
            Season starts in 18 days!
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold text-white mb-6"
          >
            College Fantasy
            <br />
            <span className="bg-gradient-to-r from-[#E73C7E] to-[#F7EAE1] bg-clip-text text-transparent">
              Is Finally Here
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl text-[#F7EAE1] mb-12 max-w-3xl mx-auto"
          >
            The first professional fantasy platform built exclusively for college football. 
            Draft your favorite players, powered by AI, completely free.
          </motion.p>

          {/* Email Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-md mx-auto"
          >
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for early access"
                  className="flex-1 px-6 py-4 rounded-lg text-black text-lg"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-[#E73C7E] hover:bg-[#d6356f] text-white font-semibold rounded-lg text-lg transition-colors disabled:opacity-60"
                >
                  {loading ? 'Joining...' : 'Get Early Access'}
                </button>
              </form>
            ) : (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6">
                <CheckIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">You're In! 🎉</h3>
                <p className="text-[#F7EAE1]">
                  We'll email you when the platform launches. Get ready to dominate!
                </p>
              </div>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-[#F7EAE1]/60 mt-4"
          >
            Join 5,000+ college football fans already signed up
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-[#F7EAE1]/80">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white text-center mb-16"
          >
            Why College Fantasy Hits Different
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/15 transition-colors"
              >
                <feature.icon className="h-12 w-12 text-[#E73C7E] mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-[#F7EAE1]/80">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-12"
          >
            College Football Fans Are Excited
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Finally! ESPN's college fantasy has been trash for years. This looks incredible.",
                author: "Sarah M., Georgia Fan"
              },
              {
                quote: "AI draft assistant is a game changer. Can't wait to try this with my fraternity.",
                author: "Mike T., Penn State Student"
              },
              {
                quote: "Free AND actually works? Sign me up. Ready to destroy my friends.",
                author: "Jessica R., Alabama Alumni"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
              >
                <p className="text-[#F7EAE1] mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <p className="text-white font-semibold">
                  — {testimonial.author}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-8"
          >
            Don't Miss The Launch
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-[#F7EAE1] mb-12"
          >
            Season starts in 18 days. Be among the first 10,000 users.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/signup"
              className="inline-block px-12 py-6 bg-[#E73C7E] hover:bg-[#d6356f] text-white font-bold text-xl rounded-lg transition-colors"
            >
              Get Early Access Now
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-[#F7EAE1]/60 mt-6"
          >
            100% free • No credit card required • Instant access
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto text-center">
          <p className="text-[#F7EAE1]/60">
            © 2025 College Fantasy Football. Made for college football fans, by college football fans.
          </p>
        </div>
      </footer>
    </main>
  );
}