// Utility function to generate ongoing batches from active slots/batches
const CMS = require('../models/CMS');
const Slot = require('../models/Slot');
const { clearCacheBySection } = require('../middleware/cache');

const generateOngoingCourses = async () => {
  try {
    // Get all active slots (batches) with available seats
    const activeSlots = await Slot.find({ 
      isActive: true 
    }).sort({ createdAt: -1 });

    // Get existing CMS data to preserve manual edits/deletions
    let existingCmsContent = await CMS.findOne({ section: 'ongoingCourses' });
    const existingCourses = existingCmsContent?.data?.ongoingCourses || [];
    const hiddenSlotIds = existingCourses
      .filter(c => c.isHidden === true)
      .map(c => c.slotId);

    // Transform slots into ongoing courses format
    const newOngoingCourses = activeSlots
      .filter(slot => !hiddenSlotIds.includes(slot._id.toString())) // Skip hidden ones
      .map((slot, index) => {
        const availableSeats = slot.capacity - slot.enrolledStudents;
        
        // Check if this slot already exists in CMS (preserve manual edits)
        const existingCourse = existingCourses.find(
          c => c.slotId === slot._id.toString() && !c.isHidden
        );

        // Generate color based on availability
        const colors = [
          'from-blue-500 to-blue-600',
          'from-green-500 to-green-600',
          'from-purple-500 to-purple-600',
          'from-orange-500 to-orange-600',
          'from-red-500 to-red-600',
          'from-teal-500 to-teal-600',
          'from-indigo-500 to-indigo-600',
          'from-pink-500 to-pink-600',
          'from-cyan-500 to-cyan-600',
          'from-emerald-500 to-emerald-600'
        ];
        const color = existingCourse?.color || colors[index % colors.length];

        // Always sync slot data to ongoing courses (slot updates should reflect in carousel)
        // Only preserve color customization, everything else syncs from slot
        return {
          id: existingCourse?.id || slot._id.toString(),
          name: slot.name || `${slot.subject} - Class ${slot.class}`, // Always sync from slot
          title: slot.name || `${slot.subject} - Class ${slot.class}`, // Always sync from slot
          offer: slot.course || `${slot.subject} | ${slot.instructor}`, // Always sync from slot
          description: slot.course || `${slot.subject} | ${slot.instructor}`, // Always sync from slot
          slotId: slot._id.toString(),
          courseId: slot.course || '', // Always sync from slot
          color: color, // Preserve color customization only
          isActive: slot.isActive, // Always sync from slot
          isHidden: false, // Reset hidden status for active slots
          availableSeats: availableSeats, // Always update from slot
          capacity: slot.capacity, // Always sync from slot
          enrolledStudents: slot.enrolledStudents, // Always sync from slot
          instructor: slot.instructor, // Always sync from slot
          class: slot.class, // Always sync from slot
          subject: slot.subject, // Always sync from slot
          type: slot.type, // Always sync from slot
          location: slot.location, // Always sync from slot
          days: slot.days || [], // Always sync from slot
          startTime: slot.startTime || '', // Always sync from slot
          endTime: slot.endTime || '' // Always sync from slot
        };
      });

    // Keep hidden courses (deleted from carousel but not actual batch)
    const hiddenCourses = existingCourses.filter(c => c.isHidden === true);

    // Merge: new courses + hidden courses
    const allCourses = [...newOngoingCourses, ...hiddenCourses];

    // Update or create CMS entry for ongoing courses
    if (existingCmsContent) {
      existingCmsContent.data = {
        ongoingCourses: allCourses
      };
      existingCmsContent.updatedAt = new Date();
      await existingCmsContent.save();
    } else {
      existingCmsContent = new CMS({
        section: 'ongoingCourses',
        data: {
          ongoingCourses: allCourses
        }
      });
      await existingCmsContent.save();
    }

    // Clear cache for ongoing courses section to ensure fresh data
    clearCacheBySection('ongoingCourses');

    return {
      success: true,
      count: newOngoingCourses.length,
      data: allCourses
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { generateOngoingCourses };

