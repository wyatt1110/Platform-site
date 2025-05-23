'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function Login() {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Signup state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/betting-dashboard');
      }
    };
    
    checkSession();
  }, [router]);

  // Handle login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Sign in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Redirect to betting dashboard
      router.push('/betting-dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    if (password.length < 8) {
      setPasswordStrength('weak');
      return false;
    }
    
    // Check for complexity (at least one number, one uppercase, one lowercase, one special character)
    const hasNumber = /\d/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (hasNumber && hasUpperCase && hasLowerCase && hasSpecialChar) {
      setPasswordStrength('strong');
      return true;
    } else if ((hasNumber && hasUpperCase) || (hasUpperCase && hasSpecialChar) || (hasLowerCase && hasNumber)) {
      setPasswordStrength('medium');
      return password.length >= 10; // Medium passwords should be longer
    } else {
      setPasswordStrength('weak');
      return false;
    }
  };

  // Handle signup submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the country value directly from the form element to ensure it's captured
    const form = e.target as HTMLFormElement;
    const countrySelect = form.elements.namedItem('country') as HTMLSelectElement;
    const selectedCountry = countrySelect.value;
    
    setIsLoading(true);
    setSignupError(null);
    setSignupSuccess(null);
    
    // Debug log
    console.log('Form values:', {
      fullName,
      signupEmail,
      telegramUsername,
      phoneNumber,
      country,
      directCountryValue: selectedCountry,
      passwordStrength
    });
    
    // Validate passwords match
    if (signupPassword !== confirmPassword) {
      setSignupError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    // Validate password strength
    if (!checkPasswordStrength(signupPassword)) {
      setSignupError('Password is too weak. Please use a combination of uppercase, lowercase, numbers, and special characters.');
      setIsLoading(false);
      return;
    }
    
    // Validate country selection - use both the state and direct form value
    if (!selectedCountry) {
      setSignupError('Please select your country of residence');
      setIsLoading(false);
      return;
    }
    
    // Use the directly captured country value
    const finalCountry = selectedCountry;
    
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/betting-dashboard`,
          data: {
            full_name: fullName,
            telegram_username: telegramUsername || null,
            phone_number: phoneNumber || null,
            country: finalCountry
          }
        },
      });
      
      if (authError) throw authError;
      
      if (authData?.user) {
        console.log('Creating user profile with country:', finalCountry);
        
        // Store additional user data in user_profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            full_name: fullName,
            email: signupEmail,
            telegram_username: telegramUsername || null,
            phone_number: phoneNumber || null,
            country: finalCountry
          })
          .select();
          
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          throw new Error('Failed to create user profile. Please try again.');
        }
        
        console.log('User profile created:', profileData);
        
        // Create a default bankroll for the user
        try {
          const { data: bankrollData, error: bankrollError } = await supabase
            .from('bankrolls')
            .insert({
              user_id: authData.user.id,
              name: 'Default Bankroll',
              description: 'Your default bankroll for tracking bets',
              initial_amount: 1000,
              current_amount: 1000,
              currency: 'GBP',
              is_active: true
            })
            .select();
            
          if (bankrollError) {
            console.error('Error creating default bankroll:', bankrollError);
            // Don't throw here, just log the error - we still want to complete signup
          } else {
            console.log('Default bankroll created:', bankrollData);
            
            // Create default user settings
            const { error: settingsError } = await supabase
              .from('user_settings')
              .insert({
                user_id: authData.user.id,
                default_stake: 10,
                default_bankroll_id: bankrollData?.[0]?.id,
                stake_currency: 'GBP',
                preferred_odds_format: 'decimal',
                ai_preferences: { model: 'default' }
              });
              
            if (settingsError) {
              console.error('Error creating user settings:', settingsError);
              // Don't throw here, just log the error
            }
          }
        } catch (err) {
          console.error('Error in bankroll/settings creation:', err);
          // Don't throw here, we still want to complete signup
        }
        
        // Show success message
        setSignupSuccess('Account created! Please check your email for the confirmation link.');
        
        // Clear form
        setFullName('');
        setSignupEmail('');
        setTelegramUsername('');
        setPhoneNumber('');
        setSignupPassword('');
        setConfirmPassword('');
        setCountry('');
        setPasswordStrength(null);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setSignupError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = () => {
    if (!signupPassword) return null;
    
    return (
      <div className="mt-2">
        <div className="text-sm mb-1">Password strength: {passwordStrength}</div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              passwordStrength === 'weak' ? 'w-1/3 bg-red-500' : 
              passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' : 
              'w-full bg-green-500'
            }`}
          ></div>
        </div>
      </div>
    );
  };

  // List of countries for dropdown
  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", 
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", 
    "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", 
    "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", 
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", 
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", 
    "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", 
    "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", 
    "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", 
    "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", 
    "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", 
    "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", 
    "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", 
    "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", 
    "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", 
    "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", 
    "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", 
    "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", 
    "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 