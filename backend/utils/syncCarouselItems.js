const mongoose = require('mongoose');
const CMS = require('../models/CMS');
const { CarouselItem, DEFAULT_TEACHER_IMAGE } = require('../models/CarouselItem');
const { clearCacheBySection } = require('../middleware/cache');

const formatCarouselItem = (item) => {
  if (!item) {
    return null;
  }

  const scheduleImage = item.scheduleImage || item.schedule1Image || '';

  return {
    id: item.legacyId || item._id.toString(),
    teacher: {
      name: item.teacherName,
      description: item.description,
      image: item.teacherImage || DEFAULT_TEACHER_IMAGE,
      scheduleImage,
      schedule1Image: item.schedule1Image || scheduleImage || '',
      schedule2Image: item.schedule2Image || '',
    }
  };
};

const seedCarouselItemsFromCMS = async () => {
  const existingDoc = await CMS.findOne({ section: 'carousel' }).lean();
  const items = existingDoc?.data?.carouselItems;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return false;
  }

  await Promise.all(items.map(async (cmsItem) => {
    const teacher = cmsItem.teacher || {};
    const payload = {
      teacherName: teacher.name || cmsItem.title || cmsItem.subtitle || 'Teacher',
      description: teacher.description || cmsItem.description || '',
      teacherImage: teacher.image || cmsItem.image || DEFAULT_TEACHER_IMAGE,
      scheduleImage: teacher.scheduleImage || '',
      schedule1Image: teacher.schedule1Image || '',
      schedule2Image: teacher.schedule2Image || '',
      legacyId: cmsItem.id ? String(cmsItem.id) : undefined
    };

    const filter = payload.legacyId
      ? { legacyId: payload.legacyId }
      : { teacherName: payload.teacherName, description: payload.description };

    await CarouselItem.findOneAndUpdate(
      filter,
      {
        $set: payload,
        $setOnInsert: {
          _id: new mongoose.Types.ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        timestamps: true
      }
    );
  }));

  return true;
};

const syncCarouselItems = async () => {
  await seedCarouselItemsFromCMS();

  const items = await CarouselItem.find().sort({ createdAt: -1 }).lean();
  const carouselItems = items.map(formatCarouselItem);

  await CMS.findOneAndUpdate(
    { section: 'carousel' },
    {
      $set: {
        section: 'carousel',
        'data.carouselItems': carouselItems,
        isActive: true,
        updatedAt: new Date()
      }
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  clearCacheBySection('carousel');

  return carouselItems;
};

module.exports = {
  syncCarouselItems,
  formatCarouselItem
};

