import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth, useToast } from '../hooks';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ArrowRight, Lock, Mail, User, ShieldAlert } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup, intendedDestination, setIntendedDestination } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    let valid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setServerError(null);

    if (!name.trim()) {
      setNameError('Please enter your full name.');
      valid = false;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters.');
      valid = false;
    }

    if (!email.trim()) {
      setEmailError('Please enter your email address.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Please create a password.');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password.');
      valid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match.');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      const user = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      toast({
        title: `Welcome to JAS Hotel, ${user.name.split(' ')[0]}`,
        description: 'Your guest concierge profile is ready.',
        type: 'success',
      });

      const dest = intendedDestination || '/account';
      setIntendedDestination(null);
      navigate(dest, { replace: true });
    } catch (err: any) {
      setServerError(err.message || 'Unable to create account. Please check your details.');
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
            Guest Concierge Registration
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#121211] font-light pt-2">
            Create Guest Account
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
            id="signup-name"
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
            leftIcon={<User className="w-4 h-4" />}
            autoComplete="name"
            required
          />

          <Input
            id="signup-email"
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            leftIcon={<Mail className="w-4 h-4" />}
            autoComplete="email"
            required
          />

          <Input
            id="signup-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            leftIcon={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
            required
          />

          <Input
            id="signup-confirm-password"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmPasswordError}
            leftIcon={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
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
              Complete Registration
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#E6DBCA] text-center text-xs text-[#7A766C]">
          <span>Already have a stay profile? </span>
          <Link
            to="/login"
            className="font-semibold text-[#886E4B] hover:text-[#121211] underline transition-colors"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
