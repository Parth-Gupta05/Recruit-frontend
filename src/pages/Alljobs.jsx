import React, { useEffect, useState } from "react";
import axios from "axios";
import ApplyJobpage from "./ApplyJobpage";

const API_BASE = import.meta.env.VITE_API_URL; // endpoint provided

function Alljobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE}/jobs`);
      // accept either res.data.jobs or res.data
      const data = res.data?.jobs ?? (Array.isArray(res.data) ? res.data : []);
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs:", err);
      setError("Failed to load jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedJob(null), 300); // Clear after animation
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Available Jobs</h1>
          <p className="text-gray-600">Browse the latest openings</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700">{error}</p>
            <button onClick={fetchJobs} className="mt-2 text-sm text-red-600 underline">Try again</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No jobs available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <article key={job._id || job.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-1">{job.title}</h2>
                <p className="text-sm text-purple-600 font-medium mb-2">{job.company}</p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{job.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm text-gray-700">{job.location || "Remote"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Posted</p>
                    <p className="text-sm text-gray-700">{new Date(job.createdAt || job.postedAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleApplyClick(job)}
                  className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Apply Now
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={handleCloseDrawer}
        />
      )}

      {/* Right Slide Drawer */}
      <div
        className={`fixed right-0 top-0 h-screen w-full md:w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleCloseDrawer}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Drawer Content */}
        {selectedJob && <ApplyJobpage job={selectedJob} onClose={handleCloseDrawer} />}
      </div>
    </div>
  );
}

export default Alljobs;
