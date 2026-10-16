import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  Building,
  ShieldAlert,
  Headphones
} from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // Simulate immediate submission & feedback
    setTimeout(() => {
      setLoading(false);
      setStatus({
        type: 'success',
        message:
          'Thank you for reaching out! Your message has been received by our clinical coordination team. We typically respond within 1 hour for urgent requests.'
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
      });
    }, 600);
  };

  const centers = [
    {
      name: 'Central Blood Transfusion & Research Center',
      address: 'Plot 42, Healthcare City, Medical Enclave, New Delhi - 110029',
      phone: '+91 11 2659 8700 / 1800-BLOOD-CARE',
      email: 'central.bloodbank@bloodcare.org',
      hours: '24/7 Continuous Emergency Operations'
    },
    {
      name: 'Metropolitan Red Cross Donation Station',
      address: '108 Red Cross Marg, Connaught Place, New Delhi - 110001',
      phone: '+91 11 2371 6441',
      email: 'delhi.redcross@bloodcare.org',
      hours: 'Mon - Sat: 8:00 AM - 8:00 PM (Emergency 24/7)'
    },
    {
      name: 'Memorial Regional Trauma Blood Center',
      address: 'Ring Road, Sector 7, RK Puram, New Delhi - 110022',
      phone: '+91 11 2616 5500',
      email: 'trauma.bloodbank@bloodcare.org',
      hours: '24/7 Critical Trauma Support'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blood-50 border border-blood-200 text-blood-700 text-xs font-bold uppercase tracking-wider">
          <Headphones className="w-3.5 h-3.5" />
          Always Available
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Contact Our Blood Care Network
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Need emergency blood units, want to organize a college/corporate donation drive, or have inquiries regarding compatibility matching? Reach out directly.
        </p>
      </div>

      {/* 24/7 Emergency Helpline Callout */}
      <div className="bg-gradient-to-r from-blood-700 via-rose-700 to-blood-800 text-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-blood-700/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-200" />
            24/7 Critical Emergency Helpline
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Urgent Patient Blood Requirement?
          </h2>
          <p className="text-xs sm:text-sm text-blood-100 max-w-lg">
            Our trauma and transfusion team operates non-stop. For immediate life-critical blood dispatch or urgent rare-donor mobilization, call our toll-free hotline:
          </p>
        </div>

        <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg text-center shrink-0 w-full md:w-auto space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Toll-Free Emergency Line
          </span>
          <div className="text-2xl font-black text-blood-600 font-mono">
            1800-BLOOD-CARE
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            (1800-256-632) / +91 11 2659 8700
          </p>
        </div>
      </div>

      {/* Form & Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Contact Form */}
        <div className="lg:col-span-3 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Send Us a Message
            </h2>
            <p className="text-xs text-slate-500">
              Fill out the form below and our medical coordinators will respond promptly.
            </p>
          </div>

          {status && (
            <div
              className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
                status.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Inquiry Topic *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blood-500 focus:outline-none bg-white"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Organize Blood Donation Drive">Organize Blood Donation Drive</option>
                  <option value="Hospital Blood Bank Integration">Hospital Blood Bank Integration</option>
                  <option value="Voluntary Donor Support">Voluntary Donor Support</option>
                  <option value="Technical Feedback">Technical Feedback / Project Demo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Your Message *
              </label>
              <textarea
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we assist you?"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blood-500 focus:outline-none resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl shadow-md shadow-blood-600/25 transition-all text-xs sm:text-sm inline-flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Transmit Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Contact Info & Hours */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900">Direct Office Contacts</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blood-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Headquarters:</strong>
                  <span className="text-slate-600">
                    Central Blood Transfusion & Research Center, Plot 42, Medical Enclave, New Delhi - 110029
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-blood-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Direct Telephone:</strong>
                  <span className="text-slate-600 font-mono">+91 11 2659 8700</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-blood-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">General Inquiries:</strong>
                  <span className="text-slate-600">contact@bloodcare.org</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-blood-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Administrative Hours:</strong>
                  <span className="text-slate-600">Monday – Saturday: 9:00 AM – 6:00 PM</span>
                  <span className="text-blood-700 font-semibold block mt-0.5">
                    (Emergency Blood Requests 24/7)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Examiner & Demo Note
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              For live viva/project demonstration, seed administrator account credentials can be used:
              <br />
              <code className="text-slate-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-300 mt-1 inline-block">
                admin@bloodcare.org / Admin@123
              </code>
            </p>
          </div>
        </div>
      </div>

      {/* Network of Certified Blood Centers */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-black text-slate-900">Regional Blood Banks & Transfusion Centers</h2>
          <p className="text-xs text-slate-500">
            Certified partner institutions maintaining active inventory on the Blood Care platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {centers.map((center, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3"
            >
              <div className="flex items-center gap-2 text-blood-600">
                <Building className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-slate-900 text-sm">{center.name}</h3>
              </div>
              <p className="text-xs text-slate-600 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{center.address}</span>
              </p>
              <p className="text-xs text-slate-600 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono">{center.phone}</span>
              </p>
              <p className="text-xs text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-emerald-700">{center.hours}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
