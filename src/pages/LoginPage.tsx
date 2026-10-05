import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth, useToast } from '../hooks';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ArrowRight, Lock, Mail, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, intendedDestination, setIntendedDestination } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setServerError(null);

    if (!email.trim()) {
      setEmailError('Please enter your email address.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      const user = await login({ email: email.trim(), password });
      toast({
        title: `Welcome back, ${user.name.split(' ')[0]}`,
        description: 'You are now signed into your JAS Hotel guest account.',
        type: 'success',
      });

      // Redirect to intended destination (e.g. /order) or /account
      const dest = intendedDestination || '/account';
      setIntendedDestination(null);
      navigate(dest, { replace: true });
    } catch (err: any) {
      setServerError(err.message || 'Email or password is incorrect.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#FAF7F0] flex items-center justify-center text-left">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-4 bg-[#FDFCF9] border border-[#E6DBCA] rounded-2xl shadow-xl p-8 sm:p-10 space-y-6"
      >
        {/* Brand Monogram */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <span className="font-serif text-3xl tracking-[0.2em] uppercase font-light text-[#121211]">
              JAS <span className="text-[#C5A880] font-normal">Hotel</span>
            </span>
          </Link>
          <p className="text-xs uppercase tracking-[0.25em] text-[#886E4B] font-semibold">
            Guest Concierge Portal
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#121211] font-light pt-2">
            Sign In to Your Stay
          </h1>
        </div>

        {serverError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="login-email"
            label="Email Address"
            type="email"
            placeholder="guest@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            leftIcon={<Mail className="w-4 h-4" />}
            autoComplete="email"
            required
          />

          <Input
            id="login-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            leftIcon={<Lock className="w-4 h-4" />}
            autoComplete="current-password"
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-xs uppercase tracking-widest font-semibold"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#E6DBCA] text-center text-xs text-[#7A766C]">
          <span>First time dining with JAS Hotel? </span>
          <Link
            to="/signup"
            className="font-semibold text-[#886E4B] hover:text-[#121211] underline transition-colors"
          >
            Create Guest Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
