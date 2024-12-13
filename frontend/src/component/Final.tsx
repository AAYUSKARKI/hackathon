import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Inline CountdownTimer component
const CountdownTimer: React.FC<{ deadline: string }> = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(deadline).getTime() - new Date().getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (isExpired) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center bg-red-100 text-red-700 p-4 rounded-lg mb-6"
      >
        Registration is now closed
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="flex justify-center space-x-4 mb-6"
    >
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div
          key={unit}
          className="bg-blue-100 p-3 rounded-lg shadow-md w-20 text-center"
        >
          <div className="text-3xl font-bold text-blue-700">
            {value.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-blue-600 uppercase">
            {unit}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

// Custom hook for form validation
const useFormValidation = () => {
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    semester: "",
    general: "",
  });

  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validateForm = useCallback((formData: {
    name: string;
    email: string;
    semester: string;
  }) => {
    const { name, email, semester } = formData;
    const newErrors = { name: "", email: "", semester: "", general: "" };
    let valid = true;

    if (!name.trim()) {
      newErrors.name = "Full name is required";
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }

    if (!semester) {
      newErrors.semester = "Please select your semester";
      valid = false;
    }

    return { valid, errors: newErrors };
  }, [validateEmail]);

  return useMemo(() => ({ 
    errors, 
    setErrors, 
    validateForm 
  }), [errors, validateForm]);
};

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    semester: "",
  });
  const { errors, setErrors, validateForm } = useFormValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldTouched, setFieldTouched] = useState({
    name: false,
    email: false,
    semester: false
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "", general: "" }));
    setFieldTouched(prev => ({ ...prev, [name]: true }));
  }, [setErrors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { valid, errors: validationErrors } = validateForm(formData);
    
    if (!valid) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("https://aimscodequest.onrender.com/api/v1/user/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      setSuccessMessage("Registration successful! Thank you for participating.");
      setFormData({ name: "", email: "", semester: "" });
    } catch (error: any) {
      const errorMsg = error.message || "Registration failed. Please try again.";
      setErrors(prev => ({ ...prev, general: errorMsg }));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, setErrors]);

  const deadline = '2024-12-16T20:00:00';

    // New function to get a user-friendly deadline message
    const getDeadlineMessage = () => {
        const deadlineDate = new Date(deadline);
        const options: Intl.DateTimeFormatOptions = { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit', 
        };
        const formattedDate = deadlineDate.toLocaleString('en-US', options);
        return `Register until ${formattedDate}`;
      };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 
      flex items-center justify-center px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
        className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden relative 
          border border-blue-100 transform transition-all hover:shadow-3xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 text-center">
          <motion.img 
            src="/images.png" 
            alt="Aims Code Quest 2.0" 
            className="mx-auto h-20 mb-4 rounded-lg shadow-lg"
          />
          <motion.h2 className="text-4xl font-extrabold tracking-tight">
            Aims Code Quest 2.0
          </motion.h2>
          <motion.p className="text-sm text-blue-100 mt-2 italic">
            "Unleash your potential through code!"
          </motion.p>
        </div>

        {/* Countdown Timer */}
        <CountdownTimer deadline={deadline} />

        {/* Deadline Message */}
        <div className="text-center text-sm text-gray-600 pb-2">
          {getDeadlineMessage()}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <AnimatePresence>
            {errors.general && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded"
              >
                {errors.general}
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded"
              >
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 
                ${fieldTouched.name && errors.name
                  ? "border-red-500 bg-red-50 ring-2 ring-red-200" 
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50"}`}
              placeholder="Enter your full name"
              required
              disabled={isSubmitting}
            />
            {fieldTouched.name && errors.name && (
              <p className="text-red-500 text-xs mt-2">{errors.name}</p>
            )}
          </motion.div>

          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 
                ${fieldTouched.email && errors.email
                  ? "border-red-500 bg-red-50 ring-2 ring-red-200" 
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50"}`}
              placeholder="Enter your email"
              required
              disabled={isSubmitting}
            />
            {fieldTouched.email && errors.email && (
              <p className="text-red-500 text-xs mt-2">{errors.email}</p>
            )}
          </motion.div>

          {/* Semester Select */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <div className="relative">
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg appearance-none focus:outline-none transition-all duration-300
                  ${fieldTouched.semester && errors.semester
                    ? "border-red-500 bg-red-50 ring-2 ring-red-200" 
                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50"}`}
                required
                disabled={isSubmitting}
              >
                <option value="">Select Your Semester</option>
                <option value="First">1st Semester</option>
                <option value="Third">3rd Semester</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            {fieldTouched.semester && errors.semester && (
              <p className="text-red-500 text-xs mt-2">{errors.semester}</p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className={`w-full py-3 px-4 text-white font-semibold rounded-lg 
              ${isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:ring-4 focus:ring-blue-300'
              } transition-all duration-300 shadow-lg`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register Now'}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="bg-gray-100 text-center py-4 text-sm text-gray-600 border-t border-gray-200">
          Organized by <span className="font-semibold text-blue-600">CSIT 6th Semester Students</span>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterForm;