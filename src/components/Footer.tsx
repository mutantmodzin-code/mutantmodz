import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t-2 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-white">MUTANT</span>
              <span className="text-red-600 ml-2">MODZ</span>
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Premium bike accessories and riding gear for motorcycle enthusiasts in Coimbatore.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 text-red-600">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-red-600 mt-1 flex-shrink-0" />
                <p className="text-gray-400 text-sm">
                  Opposite Vibgyor School, Uppilipalayam<br />
                  Coimbatore, Tamil Nadu, India
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-red-600 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-gray-400 text-sm hover:text-red-600 transition-colors">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-red-600 flex-shrink-0" />
                <a href="mailto:info@mutantmodz.com" className="text-gray-400 text-sm hover:text-red-600 transition-colors">
                  info@mutantmodz.com
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 text-red-600">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zinc-900 p-3 rounded-md hover:bg-red-600 transition-colors"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zinc-900 p-3 rounded-md hover:bg-red-600 transition-colors"
              >
                <Facebook size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Mutant Modz. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
