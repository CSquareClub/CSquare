'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Zap,
  Mail,
  Smartphone,
  Building2,
  MapPin,
  Image as ImageIcon,
  CheckSquare,
  Square,
  UploadCloud,
} from 'lucide-react';

/* ─── Options ────────────────────────────────────────────── */

const EXPECTATION_OPTIONS = [
  "Social media shoutout",
  "Logo on posters",
  "Certificate of partnership",
  "Featured on website",
  "Networking opportunities",
  "Other"
];

const DELIVERABLE_OPTIONS = [
  "WhatsApp / Telegram sharing",
  "Instagram / LinkedIn posts",
  "Story promotions",
  "Email/newsletter promotion",
  "Community announcements",
  "Hosting info session",
  "Sponsorship support / referrals 💰",
  "Other"
];

/* ─── Styling Helpers ────────────────────────────────────── */

const inputCls =
  'w-full rounded-xl border border-primary/20 bg-black/30 px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors';

const labelCls = 'mb-1.5 block text-sm font-medium text-foreground';

/* ─── Component ──────────────────────────────────────────── */

export default function CommunityPartnerForm() {
  const [formData, setFormData] = useState({
    spocName: '',
    email: '',
    phone: '',
    communityName: '',
    description: '',
  });

  const [expectations, setExpectations] = useState<string[]>([]);
  const [deliverables, setDeliverables] = useState<string[]>([]);
  
  const [logoLight, setLogoLight] = useState<File | null>(null);
  const [logoDark, setLogoDark] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const toggleArrayItem = (list: string[], setList: (arr: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File | null) => void) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0]);
    }
  };

  const validate = (): string | null => {
    if (!formData.spocName.trim()) return 'SPOC Name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) return 'Valid email is required';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!formData.communityName.trim()) return 'Community name is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!logoLight) return 'Light theme logo is required';
    if (!logoDark) return 'Dark theme logo is required';
    if (deliverables.length === 0) return 'Please select at least one way you will support AlgOlympia';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const fd = new FormData();
      fd.append("spocName", formData.spocName);
      fd.append("email", formData.email);
      fd.append("phone", formData.phone);
      fd.append("communityName", formData.communityName);
      fd.append("description", formData.description);
      
      fd.append("expectations", JSON.stringify(expectations));
      fd.append("deliverables", JSON.stringify(deliverables));
      
      if (logoLight) fd.append("logoLight", logoLight);
      if (logoDark) fd.append("logoDark", logoDark);

      const res = await fetch('/api/algolympia/community-partner', {
        method: 'POST',
        body: fd,
      });

      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || 'Registration failed');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-black/30 p-10 text-center backdrop-blur-xl shadow-[0_0_80px_rgba(255,210,50,0.08)]">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
          Welcome to the Network!
        </h3>
        <p className="mx-auto mb-6 max-w-lg text-foreground/70">
          Thank you for joining as a Community Partner for AlgOlympia. We have received your application successfully.
        </p>

        <div className="mx-auto max-w-md rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-inner">
          <h4 className="flex items-center justify-center gap-2 mb-2 text-sm font-semibold text-primary uppercase tracking-widest">
            <Zap className="h-4 w-4" /> Next Steps
          </h4>
          <p className="text-sm text-foreground/60 mb-5">
            Our team will review your application and connect with you on your WhatsApp number shortly to align on the deliverables and share social media kits.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-black/40 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_80px_rgba(255,210,50,0.06)]">
      <div className="pointer-events-none absolute -left-20 top-0 h-44 w-44 rounded-full bg-primary/10 blur-[80px]" />
      
      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        
        {/* SPOC Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider mb-2 border-b border-primary/10 pb-2">
            <User className="h-4 w-4" /> 🔹 SPOC Details
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>SPOC Name *</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.spocName}
                  onChange={(e) => setFormData({ ...formData, spocName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className={inputCls}
                />
                <User className="absolute right-4 top-3.5 h-5 w-5 text-foreground/20" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email ID *</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@organization.com"
                  className={inputCls}
                />
                <Mail className="absolute right-4 top-3.5 h-5 w-5 text-foreground/20" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Phone Number (WhatsApp preferred) *</label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  className={inputCls}
                />
                <Smartphone className="absolute right-4 top-3.5 h-5 w-5 text-foreground/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Community Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider mb-2 border-b border-primary/10 pb-2">
            <Building2 className="h-4 w-4" /> 🔹 Community
          </div>
          
          <div>
            <label className={labelCls}>Community / Organization Name *</label>
            <div className="relative">
              <input
                type="text"
                value={formData.communityName}
                onChange={(e) => setFormData({ ...formData, communityName: e.target.value })}
                placeholder="e.g. Decode Developers"
                className={inputCls}
              />
              <Building2 className="absolute right-4 top-3.5 h-5 w-5 text-foreground/20" />
            </div>
          </div>
          
          <div>
            <label className={labelCls}>Brief Description & Location *</label>
            <p className="text-xs text-foreground/50 mb-2">👉 One line only</p>
            <div className="relative">
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. Developer community based in Delhi tracking web3."
                className={inputCls}
              />
              <MapPin className="absolute right-4 top-3.5 h-5 w-5 text-foreground/20" />
            </div>
          </div>
        </div>

        {/* Logo Uploads */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider mb-2 border-b border-primary/10 pb-2">
            <ImageIcon className="h-4 w-4" /> 🔹 Logo Upload
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-dashed border-primary/30 p-4 transition-colors hover:bg-primary/5 cursor-pointer relative group">
               <label className="absolute inset-0 cursor-pointer w-full h-full opacity-0">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setLogoLight)} />
               </label>
               <div className="flex flex-col items-center justify-center text-center py-2 pointer-events-none">
                  {logoLight ? (
                     <>
                      <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
                      <p className="text-sm font-semibold text-foreground">{logoLight.name}</p>
                     </>
                  ) : (
                     <>
                       <UploadCloud className="h-8 w-8 text-primary/50 mb-2 group-hover:text-primary transition-colors" />
                       <p className="text-sm font-semibold text-foreground">Upload Logo (Light Theme) *</p>
                       <p className="text-xs text-foreground/50 mt-1">PNG or SVG format</p>
                     </>
                  )}
               </div>
            </div>

            <div className="rounded-xl border border-dashed border-primary/30 p-4 transition-colors hover:bg-primary/5 cursor-pointer relative group bg-foreground/5">
               <label className="absolute inset-0 cursor-pointer w-full h-full opacity-0">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setLogoDark)} />
               </label>
               <div className="flex flex-col items-center justify-center text-center py-2 pointer-events-none">
                  {logoDark ? (
                     <>
                      <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
                      <p className="text-sm font-semibold text-foreground">{logoDark.name}</p>
                     </>
                  ) : (
                     <>
                       <UploadCloud className="h-8 w-8 text-primary/50 mb-2 group-hover:text-primary transition-colors" />
                       <p className="text-sm font-semibold text-foreground">Upload Logo (Dark Theme) *</p>
                       <p className="text-xs text-foreground/50 mt-1">PNG or SVG transparent</p>
                     </>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* Expectations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider mb-2 border-b border-primary/10 pb-2">
            <Zap className="h-4 w-4" /> 🔹 Expectations
          </div>
          <p className="text-sm text-foreground/70 mb-3">What do you expect from this partnership? (Select all that apply)</p>
          
          <div className="grid gap-3 sm:grid-cols-2">
            {EXPECTATION_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-primary/10 bg-black/20 cursor-pointer hover:bg-primary/5 transition-colors">
                <button
                  type="button"
                  onClick={() => toggleArrayItem(expectations, setExpectations, opt)}
                  className="flex-shrink-0 mt-0.5"
                >
                  {expectations.includes(opt) ? (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  ) : (
                    <Square className="h-5 w-5 text-foreground/30" />
                  )}
                </button>
                <span className="text-sm text-foreground/90">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Deliverables */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider mb-2 border-b border-primary/10 pb-2">
             <CheckSquare className="h-4 w-4" /> 🔹 Deliverables
          </div>
          <p className="text-sm text-foreground/70 mb-3">How will you support AlgOlympia 2026? * (Select all that apply)</p>
          
          <div className="grid gap-3 sm:grid-cols-2">
            {DELIVERABLE_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-primary/10 bg-black/20 cursor-pointer hover:bg-primary/5 transition-colors">
                <button
                  type="button"
                  onClick={() => toggleArrayItem(deliverables, setDeliverables, opt)}
                  className="flex-shrink-0 mt-0.5"
                >
                  {deliverables.includes(opt) ? (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  ) : (
                    <Square className="h-5 w-5 text-foreground/30" />
                  )}
                </button>
                <span className="text-sm text-foreground/90">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-primary/10">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 rounded-xl border border-primary bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,210,50,0.4)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting Form...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Submit Application
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
