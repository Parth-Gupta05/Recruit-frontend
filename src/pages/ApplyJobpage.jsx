import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL;

// Helper function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

function ApplyJobpage({ job, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    resume: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error on input change
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setResumeFileName(file.name);
      setFormData((prev) => ({
        ...prev,
        resume: file,
      }));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (!formData.resume) {
      setError("Resume is required");
      return;
    }

    try {
      setLoading(true);
      
      // Get userId from JWT token in cookies
      const token = getCookie("auth_token");
      if (!token) {
        setError("Authentication required. Please login first.");
        return;
      }

      // Decode JWT to get userId (basic decode without verification)
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken.userId || decodedToken.id;
      
      if (!userId) {
        setError("Could not retrieve user information. Please login again.");
        return;
      }

      // Build description as combination of skills and description
      const skillsText = job.skillsRequired?.length > 0 
        ? `Skills: ${job.skillsRequired.join(", ")}. ` 
        : "";
      const description = `${skillsText}${job.description}`;

      // Prepare FormData for multipart upload
      const applicationFormData = new FormData();
      applicationFormData.append('jobid', job._id);
      applicationFormData.append('userid', userId);
      applicationFormData.append('description', description);
      applicationFormData.append('resume', formData.resume);

      // Send application with resume to backend
      await axios.post(
        `${API_BASE}/api/resumes/upload`,
        applicationFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("✅ Application submitted successfully!");
      setFormData({ name: "", email: "", phone: "", resume: null });
      setResumeFileName("");
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  if (!job) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col bg-gradient-to-br from-purple-50 to-blue-50 overflow-y-auto"
    >
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {/* Close Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          onClick={onClose}
          className="mb-4 text-gray-400 hover:text-gray-600 transition ml-auto block"
        >
          
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 bg-white rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{job.title}</h2>
          <p className="text-purple-600 font-semibold text-lg">{job.company}</p>
          
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location || "Remote"}
            </div>
          </div>
        </motion.div>

        {/* Job Details */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 mb-6 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Job Details</h3>
          
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{job.description}</p>
          </div>
          
          {job.skillsRequired && job.skillsRequired.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-3">Skills Required</p>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map((skill, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold shadow-sm hover:shadow-md transition"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Application Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">✓</span>
            Apply Now
          </h3>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm flex items-start"
              >
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </motion.div>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg text-green-700 text-sm flex items-start"
              >
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm"
                required
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                placeholder="+91 xxxxx xxxxx"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm"
                required
              />
            </div>

            {/* Resume Upload Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Resume *
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
                id="resume-upload"
                required
              />
              <label
                htmlFor="resume-upload"
                className={`block w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition text-center ${
                  resumeFileName 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center">
                  {resumeFileName ? (
                    <>
                      <svg className="w-10 h-10 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-purple-600 font-semibold mb-1">{resumeFileName}</p>
                      <p className="text-xs text-gray-500">Click to change</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-700 font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-lg transition shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Application
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ApplyJobpage;