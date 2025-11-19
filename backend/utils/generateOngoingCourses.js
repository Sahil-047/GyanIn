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

        // If exists, preserve manual edits, otherwise use defaults
        return {
          id: existingCourse?.id || slot._id.toString(),
          name: existingCourse?.name || slot.name || `${slot.subject} - Class ${slot.class}`,
          title: existingCourse?.title || slot.name || `${slot.subject} - Class ${slot.class}`,
          offer: existingCourse?.offer || slot.course || `${slot.subject} | ${slot.instructor}`,
          description: existingCourse?.description || slot.course || `${slot.subject} | ${slot.instructor}`,
          slotId: slot._id.toString(),
          courseId: existingCourse?.courseId || slot.course || '',
          color: color,
          isActive: existingCourse?.isActive !== undefined ? existingCourse.isActive : slot.isActive,
          isHidden: false, // Reset hidden status for active slots
          availableSeats: availableSeats, // Always update from slot
          capacity: slot.capacity,
          enrolledStudents: slot.enrolledStudents,
          instructor: slot.instructor,
          class: slot.class,
          subject: slot.subject,
          type: slot.type,
          location: slot.location,
          days: slot.days || [],
          startTime: slot.startTime || '',
          endTime: slot.endTime || ''
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

    // Clear cache for ongoing courses section
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

