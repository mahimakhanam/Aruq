import React, { useState } from 'react';
import { Layout } from './Layout';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

type AuthTab = 'login' | 'register';

type UserAccount = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  accountStatus: string;
};

const CURRENT_USER_KEY = 'aruqCurrentUser';

const saveCurrentUser = (user: {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

const getReadableFirebaseError = (error: unknown) => {
  console.error('Firebase Auth Error:', error);

  const firebaseError = error as { code?: string; message?: string };
  const code = firebaseError.code || '';
  const message = firebaseError.message || '';

  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists. Please sign in instead.';
  }

  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }

  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 8 characters.';
  }

  if (code === 'auth/operation-not-allowed') {
    return 'Email/Password sign-up is not enabled in Firebase Authentication.';
  }

  if (code === 'auth/configuration-not-found') {
    return 'Firebase Authentication is not fully enabled for this project. Please check Authentication settings in Firebase.';
  }

  if (code === 'auth/api-key-not-valid') {
    return 'Firebase API key is not valid. Please check the firebase.ts config file.';
  }

  if (
      code === 'auth/invalid-credential' ||
      code === 'auth/wrong-password' ||
      code === 'auth/user-not-found'
  ) {
    return 'Invalid email or password. Please check your login details.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Network error. Please check your internet connection and try again.';
  }

  return `Firebase error: ${code || message || 'Unknown error'}`;
};

const AuthPage = () => {
  const [searchParams] = useSearchParams();

  const initialTab: AuthTab =
      searchParams.get('tab') === 'register' ? 'register' : 'login';

  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);

  return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pal-red via-pal-black to-pal-green" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-pal-green/5 rounded-full blur-3xl" />
          <div className="absolute top-20 left-10 w-32 h-32 bg-pal-red/5 rounded-full blur-2xl" />

          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-stone-100 relative z-10">
            <div className="text-center">
              <h2 className="mt-2 text-3xl font-bold text-stone-900">
                {activeTab === 'login' ? 'Welcome Back' : 'Join the Community'}
              </h2>

              <p className="mt-2 text-sm text-stone-600">
                {activeTab === 'login'
                    ? 'Sign in to access your personal dashboard and contributions.'
                    : 'Create an account to preserve and share Palestinian heritage.'}
              </p>
            </div>

            <div className="flex bg-stone-100 p-1 rounded-lg">
              <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      activeTab === 'login'
                          ? 'bg-white shadow text-pal-black'
                          : 'text-stone-500 hover:text-stone-700'
                  }`}
              >
                Sign In
              </button>

              <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      activeTab === 'register'
                          ? 'bg-white shadow text-pal-black'
                          : 'text-stone-500 hover:text-stone-700'
                  }`}
              >
                Register
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                  <LoginForm key="login" />
              ) : (
                  <RegisterForm key="register" />
              )}
            </AnimatePresence>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>

              <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-stone-500">
                Or continue with
              </span>
              </div>
            </div>

            <button
                type="button"
                onClick={() =>
                    alert(
                        'UAE Pass authentication is shown as a prototype feature in this phase.'
                    )
                }
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-stone-300 rounded-lg shadow-sm bg-white text-stone-700 hover:bg-stone-50 font-medium transition-colors"
            >
              <ShieldCheck className="w-5 h-5 text-pal-green" />

              <span className="flex flex-col items-start leading-tight text-xs">
              <span className="font-bold text-sm">UAE PASS</span>
              <span className="text-[10px] text-stone-400">
                Secure National Digital Identity
              </span>
            </span>
            </button>
          </div>
        </div>
      </Layout>
  );
};

const MessageBox = ({
                      type,
                      message,
                    }: {
  type: 'success' | 'error';
  message: string;
}) => {
  const isSuccess = type === 'success';

  return (
      <div
          className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
              isSuccess
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
          }`}
      >
        {isSuccess ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
        ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        )}

        <span>{message}</span>
      </div>
  );
};

const LoginForm = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setMessageType('error');
      setMessage('Please enter your email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');

      const userCredential = await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          cleanPassword
      );

      const firebaseUser = userCredential.user;
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const fallbackUser = {
          firstName: firebaseUser.displayName?.split(' ')[0] || 'Aruq',
          lastName:
              firebaseUser.displayName?.split(' ').slice(1).join(' ') || 'User',
          email: firebaseUser.email || cleanEmail,
          role: 'Member',
        };

        saveCurrentUser(fallbackUser);
      } else {
        const data = userDoc.data() as UserAccount;

        saveCurrentUser({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
        });
      }

      setMessageType('success');
      setMessage('Login successful! Redirecting to dashboard...');

      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    } catch (error) {
      setMessageType('error');
      setMessage(getReadableFirebaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="space-y-6"
      >
        {message && <MessageBox type={messageType} message={message} />}

        <div>
          <label
              htmlFor="login-email"
              className="block text-sm font-medium text-stone-700"
          >
            Email
          </label>

          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-stone-400" />
            </div>

            <input
                type="email"
                name="login-email"
                id="login-email"
                className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-lg focus:ring-pal-green focus:border-pal-green sm:text-sm text-stone-900 placeholder:text-stone-400 bg-white"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
                htmlFor="login-password"
                className="block text-sm font-medium text-stone-700"
            >
              Password
            </label>

            <button
                type="button"
                onClick={() =>
                    alert(
                        'Forgot password is planned for a future version of this prototype.'
                    )
                }
                className="text-sm font-medium text-pal-red hover:text-red-700"
            >
              Forgot password?
            </button>
          </div>

          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-stone-400" />
            </div>

            <input
                type="password"
                name="login-password"
                id="login-password"
                className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-lg focus:ring-pal-green focus:border-pal-green sm:text-sm text-stone-900 placeholder:text-stone-400 bg-white"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </div>

        <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pal-black hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pal-black transition-colors"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </button>
      </motion.form>
  );
};

const RegisterForm = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanFirstName || !cleanLastName || !cleanEmail || !cleanPassword) {
      setMessageType('error');
      setMessage('Please fill in all required fields.');
      return;
    }

    if (cleanPassword.length < 8 || cleanPassword.length > 16) {
      setMessageType('error');
      setMessage('Password must be between 8 and 16 characters long.');
      return;
    }

    if (!termsAccepted) {
      setMessageType('error');
      setMessage('Please agree to the Terms and Privacy Policy.');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');

      const userCredential = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          cleanPassword
      );

      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, {
        displayName: `${cleanFirstName} ${cleanLastName}`,
      });

      const userProfile: UserAccount = {
        uid: firebaseUser.uid,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        role,
        accountStatus: 'Active',
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userProfile,
        isVerified: true,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      saveCurrentUser({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        role,
      });

      setMessageType('success');
      setMessage('Account created successfully! Redirecting to dashboard...');

      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    } catch (error) {
      setMessageType('error');
      setMessage(getReadableFirebaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <motion.form
          onSubmit={handleRegister}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
      >
        {message && <MessageBox type={messageType} message={message} />}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
                htmlFor="first-name"
                className="block text-sm font-medium text-stone-700"
            >
              First Name
            </label>

            <input
                type="text"
                id="first-name"
                className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:ring-pal-green focus:border-pal-green sm:text-sm text-stone-900 placeholder:text-stone-400 bg-white"
                placeholder="First name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
            />
          </div>

          <div>
            <label
                htmlFor="last-name"
                className="block text-sm font-medium text-stone-700"
            >
              Last Name
            </label>

            <input
                type="text"
                id="last-name"
                className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:ring-pal-green focus:border-pal-green sm:text-sm text-stone-900 placeholder:text-stone-400 bg-white"
                placeholder="Last name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label
              htmlFor="register-email"
              className="block text-sm font-medium text-stone-700"
          >
            Email
          </label>

          <input
              type="email"
              id="register-email"
              className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:ring-pal-green focus:border-pal-green sm:text-sm text-stone-900 placeholder:text-stone-400 bg-white"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label
              htmlFor="role"
              className="block text-sm font-medium text-stone-700"
          >
            Role
          </label>

          <select
              id="role"
              className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:ring-pal-green focus:border-pal-green sm:text-sm text-stone-900 bg-white"
              value={role}
              onChange={(event) => setRole(event.target.value)}
          >
            <option>Member</option>
            <option>Heritage Partner</option>
            <option>Moderator</option>
            <option>Government</option>
            <option>Admin</option>
            <option>Technician</option>
          </select>
        </div>

        <div>
          <label
              htmlFor="register-password"
              className="block text-sm font-medium text-stone-700"
          >
            Password
          </label>

          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-stone-400" />
            </div>

            <input
                type="password"
                id="register-password"
                className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-lg focus:ring-pal-green focus:border-pal-green sm:text-sm text-stone-900 placeholder:text-stone-400 bg-white"
                placeholder="8 to 16 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <p className="text-xs text-stone-400 mt-1">
            Password must be between 8 and 16 characters.
          </p>
        </div>

        <label className="flex items-start gap-2 text-xs text-stone-500">
          <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-pal-green focus:ring-pal-green"
          />

          <span>
          I agree to the Terms and Privacy Policy for using A&apos;ruq as a
          cultural preservation platform.
        </span>
        </label>

        <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pal-red hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pal-red transition-colors"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </button>
      </motion.form>
  );
};

export default AuthPage;