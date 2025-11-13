import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Jobsposted = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJobApplicants, setSelectedJobApplicants] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL ;

  // Read cookie by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
      return decodeURIComponent(parts.pop().split(";").shift());
  };

  // Fetch all jobs posted by logged-in employer
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const token = getCookie("auth_token");
        if (!token) {
          setError("No authentication token found.");
          setLoading(false);
          return;
        }

        // Decode token to get userId
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const userId =
          decodedToken.userId || decodedToken.id || decodedToken._id;

        const res = await axios.get(`${API_URL}/jobs/user/${userId}`);
        setJobs(res.data.jobs || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Fetch all applicants for a specific job
  const fetchApplicants = async (jobId, title) => {
    try {
      const res = await axios.get(`${API_URL}/applications/job/${jobId}`);
      setSelectedJobApplicants(res.data.applicants || []);
      setSelectedJobTitle(title);
      setDrawerOpen(true);
    } catch (err) {
      console.error("Error fetching applicants:", err);
      alert("Failed to load applicants.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800">📋 Jobs You Posted</h2>
          <button
            onClick={() => navigate("/postjob")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md hover:shadow-lg transform hover:scale-105"
          >
            ➕ Post a New Job
          </button>
        </motion.div>

        {/* Job Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="text-gray-600 mt-4">Loading your posted jobs...</p>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center"
          >
            {error}
          </motion.div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 bg-white rounded-lg shadow-md"
          >
            <p className="text-gray-600 text-lg">You haven't posted any jobs yet.</p>
            <p className="text-gray-500 text-sm mt-2">Click the button above to create your first job posting!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{job.title}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium text-purple-600 mr-2">Company:</span>
                      <span>{job.company}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium text-purple-600 mr-2">Location:</span>
                      <span>{job.location}</span>
                    </div>
                    
                    <div className="flex items-start text-sm text-gray-600">
                      <span className="font-medium text-purple-600 mr-2 whitespace-nowrap">Skills:</span>
                      <span className="flex-1">
                        {job.skillsRequired?.length > 0 
                          ? job.skillsRequired.join(", ") 
                          : "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-purple-600">{job.appliedcount || 0}</span>
                      <span className="text-sm text-gray-500 ml-2">Applicants</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => fetchApplicants(job._id, job.title)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition mt-4 shadow-md hover:shadow-lg"
                  >
                    👀 View Applicants
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Sliding Drawer (Right Side) */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-full sm:w-[500px] h-full bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Applicants</h3>
                    <p className="text-purple-600 font-medium mt-1">{selectedJobTitle}</p>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                {selectedJobApplicants.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No applicants yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedJobApplicants.map((app, idx) => (
                      <motion.div
                        key={app._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-purple-300 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">
                                {app.userId?.name || "Unknown"}
                              </p>
                              <p className="text-sm text-gray-500">
                                Applied {new Date(app.appliedAt).toLocaleDateString("en-IN")}
                              </p>
                            </div>
                          </div>
                          <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {app.score || "N/A"}%
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">📧</span>
                            <span>{app.userId?.email || "Not provided"}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">📞</span>
                            <span>{app.userId?.phone || "Not provided"}</span>
                          </div>
                        </div>

                        {app.resumeUrl && (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                          >
                            📄 View Resume
                          </a>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Jobsposted;