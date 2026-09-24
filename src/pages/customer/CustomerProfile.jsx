import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  MapPin,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../services/authService';
import Container from '../../components/Container';
import Button from '../../components/Button';

export default function CustomerProfile() {
  const { user, profile, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('742 Evergreen Terrace, Los Angeles, CA');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Keep local state in sync if auth profile loads or changes
  useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSaving(true);

    try {
      if (user?.id) {
        await authService.updateProfile(user.id, {
          full_name: fullName.trim(),
          phone: phone.trim(),
        });
        if (refreshProfile) {
          await refreshProfile();
        }
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCustomerLogout = async () => {
    await logout(false);
    navigate('/login');
  };

  return (
    <div className="py-10 sm:py-14 bg-[#0b0f12] text-white min-h-[calc(100vh-140px)]">
      <Container className="max-w-3xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Driver Profile & Credentials
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage your verified personal info and rental verification records.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCustomerLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Verification Status Banner */}
          <div className="bg-[#12181d] border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#bef264] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Driver's License Status
                </div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  Verified & Approved
                  <span className="w-2 h-2 rounded-full bg-[#bef264]" />
                </div>
                <div className="text-xs text-slate-500">
                  ID: DL-CA-948271 • Expiration: 2029-12-31
                </div>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#bef264]/10 text-[#bef264] border border-[#bef264]/20">
              Clear for Instant Keyless Pickup
            </span>
          </div>

          {/* Profile Form */}
          <div className="bg-[#12181d] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white">Personal Information</h2>

            {savedSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#bef264]" />
                <span>Profile details updated successfully!</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#182128] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#bef264]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled
                      value={user?.email || 'customer@rentrides.com'}
                      className="w-full bg-[#182128]/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#182128] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#bef264]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                    Residential Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#182128] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#bef264]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={isSaving}
                  disabled={isSaving}
                  className="font-bold"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
