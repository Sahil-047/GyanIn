import { useState, useEffect } from 'react';
import { publicApiCall, apiCall } from '../../utils/api';

const Readmissions = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    contact: '',
    course: '',
    slotName: ''
  });

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: false, message: '' });
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [showGFormModal, setShowGFormModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch available slots
  const fetchSlots = async () => {
    try {
      setSlotsLoading(true);
      const params = new URLSearchParams();
      params.append('isActive', 'true');
      params.append('limit', '100');
      const url = `/public/slots?${params.toString()}`;
      const response = await publicApiCall(url);
      if (response.success) {
        setSlots(response.data || []);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // Poll for real-time updates every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchSlots();
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Auto-open Google Form in a new tab when modal is shown (iframes may be blocked by Google)
  useEffect(() => {
    if (showGFormModal) {
      try {
        window.open('https://forms.gle/ZCuE8XFDgXuQ625s7', '_blank', 'noopener,noreferrer');
      } catch (_) {}
    }
  }, [showGFormModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSlotChange = (e) => {
    const slotId = e.target.value;
    const selectedSlot = slots.find(slot => slot._id === slotId);

    if (selectedSlot) {
      setFormData(prev => ({
        ...prev,
        slotName: selectedSlot.name,
        course: selectedSlot.course,
        slotId: selectedSlot._id
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.studentName.trim()) errors.studentName = 'Student name is required';
    if (!formData.contact.trim() || formData.contact.length < 10) {
      errors.contact = 'Valid contact number is required';
    }
    if (!formData.course) errors.course = 'Please select a course';
    if (!formData.slotName) errors.slotName = 'Please select a slot';
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus({ success: false, message: 'Please fill all required fields correctly' });
      return;
    }

    try {
      setLoading(true);
      setSubmitStatus({ success: false, message: '' });

      const submitData = {
        studentName: formData.studentName.trim(),
        contact: formData.contact.trim(),
        course: formData.course,
        slotName: formData.slotName
      };

      const response = await publicApiCall('/public/readmissions', {
        method: 'POST',
        body: JSON.stringify(submitData)
      });

      if (response.success) {
        setSubmitStatus({
          success: true,
          message: 'Your readmission request has been submitted successfully! We will contact you soon.'
        });
        setShowGFormModal(true);
        // Reset form
        setFormData({
          studentName: '',
          contact: '',
          course: '',
          slotName: ''
        });
      } else {
        setSubmitStatus({ success: false, message: response.message || 'Failed to submit request' });
      }
    } catch (error) {
      console.error('Error submitting readmission:', error);
      setSubmitStatus({ success: false, message: 'Failed to submit request. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Group slots by course and filter out full slots
  const groupedSlots = slots
    .filter(slot => slot.enrolledStudents < slot.capacity) // Only show slots with available capacity
    .reduce((acc, slot) => {
      if (!acc[slot.course]) {
        acc[slot.course] = [];
      }
      acc[slot.course].push(slot);
      return acc;
    }, {});

  return (
    <>
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Readmission Application</h1>
            <p className="text-blue-100">Apply for readmission to continue your learning journey</p>
          </div>

          {/* Success/Error Message */}
          {submitStatus.message && (
            <div className={`px-6 py-4 ${submitStatus.success ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
              }`}>
              <p className={`text-sm ${submitStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                {submitStatus.message}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
            {/* Personal Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your contact number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Course and Slot Selection */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Course & Slot Selection</h2>

              {slotsLoading ? (
                <p className="text-gray-500">Loading available slots...</p>
              ) : slots.length === 0 ? (
                <p className="text-red-500">No slots available at the moment. Please check back later.</p>
              ) : (
                <>
                  <div>
                    <label htmlFor="slot" className="block text-sm font-medium text-gray-700 mb-2">
                      Available Slots *
                    </label>
                    <select
                      id="slot"
                      name="slot"
                      onChange={handleSlotChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a slot</option>
                      {Object.entries(groupedSlots).map(([course, courseSlots]) => (
                        <optgroup key={course} label={course}>
                          {courseSlots.map((slot) => (
                            <option key={slot._id} value={slot._id}>
                              {slot.name} - {slot.startTime} to {slot.endTime} ({slot.type}) - Available: {slot.capacity - slot.enrolledStudents}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {formData.course && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Selected Course:</span> {formData.course}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Selected Slot:</span> {formData.slotName}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Readmission Details removed per new requirements */}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="reset"
                onClick={() => setFormData({
                  studentName: '',
                  contact: '',
                  course: '',
                  slotName: ''
                })}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading || slots.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Available Slots */}
        <div className="mt-6 bg-white border border-blue-200 rounded-lg">
          <div className="px-6 py-4 border-b bg-blue-50 rounded-t-lg flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-900">Available Seats</h3>
            <div className="text-xs text-blue-800">
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
            </div>
          </div>

          <div className="p-6">
            {slotsLoading ? (
              <p className="text-gray-500">Loading available slots...</p>
            ) : Object.keys(groupedSlots).length === 0 ? (
              <p className="text-red-500">No active slots available right now.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(groupedSlots).map(([course, courseSlots]) => (
                  <div key={course} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b">
                      <h4 className="text-sm font-semibold text-gray-800">{course}</h4>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {courseSlots.map((slot) => (
                        <li key={slot._id} className="px-4 py-3 flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{slot.name}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{slot.startTime} - {slot.endTime} • {slot.type}</p>
                          </div>
                          <div className="ml-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                              {Math.max(slot.capacity - slot.enrolledStudents, 0)} seats left
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Information</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Your readmission request will be reviewed by the admin</li>
            <li>• You will receive an email confirmation upon submission</li>
            <li>• You will be contacted via email or phone regarding the status of your application</li>
            <li>• Make sure to provide accurate information to avoid delays</li>
          </ul>
        </div>
      </div>
    </div>
    
    {/* Google Form Modal for Payment Receipt Upload */ }
  {
    showGFormModal && (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Upload Payment Receipt</h3>
            <button onClick={() => setShowGFormModal(false)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-700 mb-4">We opened the Google Form in a new tab. If it didn’t open, click the button below.</p>
            <div className="flex items-center justify-between">
              <a
                href="https://forms.gle/ZCuE8XFDgXuQ625s7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Open Google Form
              </a>
              <button
                onClick={() => setShowGFormModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  </>
  );
};

export default Readmissions;
