import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <section className="bg-black py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
            Contact <span className="text-red-600">Us</span>
          </h1>
          <p className="text-xl text-gray-400">
            Visit our store or get in touch with us
          </p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Get In Touch</h2>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4 bg-zinc-900 p-6 rounded-lg border-2 border-zinc-800 hover:border-red-600 transition-colors">
                  <div className="bg-red-600 p-3 rounded-lg">
                    <MapPin size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">Visit Our Store</h3>
                    <p className="text-gray-400">
                      Opposite Vibgyor School, Uppilipalayam<br />
                      Coimbatore, Tamil Nadu, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-zinc-900 p-6 rounded-lg border-2 border-zinc-800 hover:border-red-600 transition-colors">
                  <div className="bg-red-600 p-3 rounded-lg">
                    <Phone size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">Call Us</h3>
                    <a href="tel:+919876543210" className="text-gray-400 hover:text-red-600 transition-colors">
                      +91 98765 43210
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-zinc-900 p-6 rounded-lg border-2 border-zinc-800 hover:border-red-600 transition-colors">
                  <div className="bg-red-600 p-3 rounded-lg">
                    <Mail size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">Email Us</h3>
                    <a href="mailto:info@mutantmodz.com" className="text-gray-400 hover:text-red-600 transition-colors">
                      info@mutantmodz.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-zinc-900 p-6 rounded-lg border-2 border-zinc-800 hover:border-red-600 transition-colors">
                  <div className="bg-red-600 p-3 rounded-lg">
                    <Clock size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">Store Hours</h3>
                    <p className="text-gray-400">
                      Monday - Saturday: 10:00 AM - 8:00 PM<br />
                      Sunday: 10:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-white font-semibold mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-900 text-white border-2 border-zinc-800 rounded-md focus:border-red-600 focus:outline-none transition-colors"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-white font-semibold mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-900 text-white border-2 border-zinc-800 rounded-md focus:border-red-600 focus:outline-none transition-colors"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-white font-semibold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-900 text-white border-2 border-zinc-800 rounded-md focus:border-red-600 focus:outline-none transition-colors"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-white font-semibold mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-zinc-900 text-white border-2 border-zinc-800 rounded-md focus:border-red-600 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about your requirements"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-md text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  {submitted ? 'Message Sent!' : 'Send Message'}
                  <Send size={20} />
                </button>

                {submitted && (
                  <div className="bg-green-600 text-white p-4 rounded-md text-center">
                    Thank you! We'll get back to you soon.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Find Us on Map</h2>
          <div className="w-full h-96 bg-zinc-800 rounded-lg overflow-hidden border-2 border-zinc-700">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.3947444885!2d76.9990000!3d11.0168000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDAxJzAwLjUiTiA3NsKwNTknNTYuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mutant Modz Location"
            ></iframe>
          </div>
          <p className="text-center text-gray-400 mt-4">
            Opposite Vibgyor School, Uppilipalayam, Coimbatore
          </p>
        </div>
      </section>
    </div>
  );
}
