import { Sprout, Facebook, Twitter, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-green-600 p-1.5 rounded-lg">
                <Sprout className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Farm2Market</span>
            </div>
            <p className="text-sm text-stone-400">
              Empowering Sri Lankan agriculture through technology, transparency, and fair trade.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-green-400">For Farmers</a></li>
              <li><a href="#" className="hover:text-green-400">For Buyers</a></li>
              <li><a href="#" className="hover:text-green-400">Price Predictions</a></li>
              <li><a href="#" className="hover:text-green-400">Market Insights</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-green-400">Help Center</a></li>
              <li><a href="#" className="hover:text-green-400">Contact Us</a></li>
              <li><a href="#" className="hover:text-green-400">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-green-400">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex space-x-5">
              <a href="#" className="hover:text-green-400"><Facebook size={20} /></a>
              <a href="#" className="hover:text-green-400"><Twitter size={20} /></a>
              <a href="#" className="hover:text-green-400"><Instagram size={20} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-8 text-center text-sm text-stone-500">
          <p>© {new Date().getFullYear()} Farm2Market Sri Lanka. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}