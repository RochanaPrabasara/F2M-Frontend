import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sprout,
  TrendingUp,
  ShieldCheck,
  Users,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'
import Particles from "react-tsparticles"
import { loadSlim } from "tsparticles-slim"
import type { Engine } from "tsparticles-engine"
import { Navigation } from '../components/Navigation'
import { Footer } from '../components/Footer'
import heroImage from '../assets/sri-lanka-farmland.jpg'
import farmerImage from '../assets/farmer-using-phone.png'

export default function Landing() {
  // Particles.js initialization
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  const features = [
    {
      icon: Users,
      title: 'Direct Connections',
      description:
        'Cut out the middleman. Farmers sell directly to buyers for better margins.',
    },
    {
      icon: TrendingUp,
      title: 'AI Price Predictions',
      description:
        'Plan your harvest and purchases with 4-week advanced price forecasting.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Transactions',
      description:
        'Safe, transparent dealings with verified users and secure payment options.',
    },
    {
      icon: Sprout,
      title: 'Reduce Wastage',
      description: 'Better market visibility means less produce goes to waste.',
    },
  ]

  return (
    <div className="min-h-screen bg-stone-50 relative">
      {/* Particles Background - Only for Features and How It Works sections */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "grab", // Options: "grab", "repulse", "bubble", "attract"
      },
      onClick: {
        enable: true,
        mode: "push", // Adds particles on click
      },
    },
    modes: {
      grab: {
        distance: 200, // Distance particles connect to cursor
        links: {
          opacity: 0.8, // Link opacity on hover
        },
      },
      push: {
        quantity: 4, // Number of particles added on click
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
    },
  },
          particles: {
            color: {
              value: "#16a34a", // green-600
            },
            links: {
              color: "#22c55e", // green-500
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 3,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 0.8,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 60,
            },
            opacity: {
              value: 0.4,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0"
      />

      <div className="relative z-10">
        <Navigation />

        {/* Hero Section */}
        <section className="relative bg-green-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img
              src={heroImage}
              alt="Sri Lankan farmland"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Connecting Farmers Directly to Buyers in Sri Lanka
              </h1>
              <p className="text-xl text-green-100 mb-10 max-w-2xl">
                Fair prices, fresh produce, and AI-powered market insights for a sustainable agricultural future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register?type=farmer">
                  <button className="w-full sm:w-auto cursor-pointer border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                    Join as Farmer
                  </button>
                </Link>
                <Link to="/register?type=buyer">
                  <button className="w-full sm:w-auto cursor-pointer border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                    Join as Buyer
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">
              Why Choose Farm2Market ?
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              We're revolutionizing Sri Lanka's agriculture supply chain by empowering
              farmers and connecting them directly with the market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow relative z-10"
              >
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-green-600">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-stone-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="bg-white/80 backdrop-blur-sm py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-stone-900 mb-6">
                  Empowering Farmers with Technology
                </h2>
                <div className="space-y-6">
                  {[
                    'Register and list your crops in minutes',
                    'Get AI-driven price predictions to plan harvest',
                    'Chat directly with buyers and negotiate',
                    'Receive secure payments instantly',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-600 mr-3 shrink-0" />
                      <span className="text-lg text-stone-700">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link
                    to="/register"
                    className="inline-flex items-center text-green-600 font-semibold hover:text-green-700"
                  >
                    Start your journey <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-green-600 rounded-2xl transform rotate-3"></div>
                <img
                  src={farmerImage}
                  alt="Farmer using phone"
                  className="relative rounded-xl shadow-lg w-full"
                />
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}