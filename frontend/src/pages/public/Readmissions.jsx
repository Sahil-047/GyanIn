import { useState, useEffect } from 'react';
import { publicApiCall, apiCall } from '../../utils/api';

const Readmissions = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    contact: '',
    course: '',
    slotName: '',
    reason: '',
    previousCourse: ''
  });

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: false, message: '' });
  const [slotsLoading, setSlotsLoading] = useState(true);

  // Fetch available slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        // Build query parameters
        const params = new URLSearchParams();
        params.append('isActive', 'true');
        params.append('limit', '100');
        
        const url = `/public/slots?${params.toString()}`;
        console.log('Fetching slots from:', url);
        const response = await publicApiCall(url);
        
        console.log('Slots response:', response);
        
        if (response.success) {
          console.log('Setting slots:', response.data);
          setSlots(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
        console.error('Error details:', error.message, error.status, error.data);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, []);

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
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Valid email is required';
    }
    if (!formData.contact.trim() || formData.contact.length < 10) {
      errors.contact = 'Valid contact number is required';
    }
    if (!formData.course) errors.course = 'Please select a course';
    if (!formData.slotName) errors.slotName = 'Please select a slot';
    if (!formData.reason.trim()) errors.reason = 'Reason for readmission is required';

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
        email: formData.email.trim(),
        contact: formData.contact.trim(),
        course: formData.course,
        slotName: formData.slotName,
        reason: formData.reason.trim(),
        previousCourse: formData.previousCourse.trim() || ''
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
        // Reset form
        setFormData({
          studentName: '',
          email: '',
          contact: '',
          course: '',
          slotName: '',
          reason: '',
          previousCourse: ''
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

  // Group slots by course
  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.course]) {
      acc[slot.course] = [];
    }
    acc[slot.course].push(slot);
    return acc;
  }, {});

  return (
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
            <div className={`px-6 py-4 ${
              submitStatus.success ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
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

            {/* Readmission Details */}
            <div className="pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Readmission Details</h2>
              
              <div>
                <label htmlFor="previousCourse" className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Course (if applicable)
                </label>
                <input
                  type="text"
                  id="previousCourse"
                  name="previousCourse"
                  value={formData.previousCourse}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your previous course"
                />
              </div>

              <div className="mt-6">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Readmission *
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={4}
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please provide your reason for readmission..."
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="reset"
                onClick={() => setFormData({
                  studentName: '',
                  email: '',
                  contact: '',
                  course: '',
                  slotName: '',
                  reason: '',
                  previousCourse: ''
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
  );
};

export default Readmissions;
