import mongoose from "mongoose";
import Module from "../models/Module.js";
import Course from "../models/Course.js";
import { syncLessonHierarchy } from "../services/aggregationService.js";
import { triggerModulePublishedAnnouncement } from "../services/announcementService.js";

/**
 * @desc    Get all modules for a course
 * @route   GET /api/admin/courses/:courseId/modules
 * @access  Private (Admin)
 */
export const getModulesByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Omit soft-deleted
    const modules = await Module.find({ courseId, deletedAt: null })
      .sort({ order: 1 });
      
    res.status(200).json({ success: true, modules });
  } catch (error) {
    console.error("Error getting modules:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Get module by ID
 * @route   GET /api/admin/modules/:moduleId
 * @access  Private (Admin)
 */
export const getModuleById = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const module = await Module.findOne({ _id: moduleId, deletedAt: null });
    
    if (!module) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    res.status(200).json({ success: true, module });
  } catch (error) {
    console.error("Error getting module:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Create a new module
 * @route   POST /api/admin/courses/:courseId/modules
 * @access  Private (Admin)
 */
export const createModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, slug, shortDescription, description, learningObjectives, settings, status } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Determine order
    const lastModule = await Module.findOne({ courseId, deletedAt: null }).sort({ order: -1 });
    const order = lastModule ? lastModule.order + 1 : 1;

    // Check slug uniqueness
    const generatedSlug = slug || title.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');
    const existingSlug = await Module.findOne({ courseId, slug: generatedSlug });
    if (existingSlug) {
      return res.status(400).json({ success: false, message: "Slug must be unique within the course" });
    }

    const newModule = new Module({
      courseId,
      title,
      slug: generatedSlug,
      shortDescription,
      description,
      learningObjectives,
      settings,
      status: status || 'draft',
      order,
      // createdBy: req.admin?._id // Assuming admin is attached to req
    });

    await newModule.save();
    
    await syncLessonHierarchy(newModule._id, courseId);
    
    // Non-blocking publication announcement trigger
    if (newModule.status === 'published') {
      triggerModulePublishedAnnouncement(newModule._id).catch(err =>
        console.error("Non-blocking error in triggerModulePublishedAnnouncement:", err)
      );
    }
    
    res.status(201).json({ success: true, module: newModule });
  } catch (error) {
    console.error("Error creating module:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Update a module
 * @route   PUT /api/admin/modules/:moduleId
 * @access  Private (Admin)
 */
export const updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const updates = req.body;

    const module = await Module.findOne({ _id: moduleId, deletedAt: null });
    if (!module) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    const wasPublished = module.status === 'published';

    // Check slug if it's being updated
    if (updates.slug && updates.slug !== module.slug) {
      const existingSlug = await Module.findOne({ courseId: module.courseId, slug: updates.slug });
      if (existingSlug && existingSlug._id.toString() !== moduleId) {
        return res.status(400).json({ success: false, message: "Slug must be unique within the course" });
      }
    }

    const updatedModule = await Module.findByIdAndUpdate(
      moduleId,
      { $set: updates }, // updatedBy: req.admin?._id
      { new: true, runValidators: true }
    );

    // Trigger announcement only on transition to published
    if (updatedModule && updatedModule.status === 'published' && (!wasPublished || updates.status === 'published')) {
      triggerModulePublishedAnnouncement(updatedModule._id).catch(err =>
        console.error("Non-blocking error in triggerModulePublishedAnnouncement:", err)
      );
    }

    res.status(200).json({ success: true, module: updatedModule });
  } catch (error) {
    console.error("Error updating module:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Soft delete a module
 * @route   DELETE /api/admin/modules/:moduleId
 * @access  Private (Admin)
 */
export const deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    const module = await Module.findById(moduleId);
    if (!module || module.deletedAt) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    module.deletedAt = new Date();
    // module.updatedBy = req.admin?._id;
    await module.save();

    await syncLessonHierarchy(moduleId, module.courseId);

    res.status(200).json({ success: true, message: "Module soft deleted successfully" });
  } catch (error) {
    console.error("Error deleting module:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Update module status
 * @route   PATCH /api/admin/modules/:moduleId/status
 * @access  Private (Admin)
 */
export const updateModuleStatus = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const module = await Module.findById(moduleId);
    if (!module || module.deletedAt) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    module.status = status;
    // module.updatedBy = req.admin?._id;
    await module.save();

    await syncLessonHierarchy(moduleId, module.courseId);

    // Trigger announcement if status updated to published
    if (module.status === 'published') {
      triggerModulePublishedAnnouncement(module._id).catch(err =>
        console.error("Non-blocking error in triggerModulePublishedAnnouncement:", err)
      );
    }

    res.status(200).json({ success: true, module });
  } catch (error) {
    console.error("Error updating module status:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Reorder modules
 * @route   PATCH /api/admin/modules/reorder
 * @access  Private (Admin)
 */
export const reorderModules = async (req, res) => {
  try {
    const { updates } = req.body; // Expecting [{ _id: '...', order: 1 }, ...]

    if (!Array.isArray(updates)) {
      return res.status(400).json({ success: false, message: "Updates must be an array" });
    }

    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update._id },
        update: { $set: { order: update.order } } // updatedBy: req.admin?._id
      }
    }));

    await Module.bulkWrite(bulkOps);

    res.status(200).json({ success: true, message: "Modules reordered successfully" });
  } catch (error) {
    console.error("Error reordering modules:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Duplicate a module
 * @route   POST /api/admin/modules/:moduleId/duplicate
 * @access  Private (Admin)
 */
export const duplicateModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const originalModule = await Module.findOne({ _id: moduleId, deletedAt: null });
    if (!originalModule) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    // Determine new order (place after original, shift others)
    const newOrder = originalModule.order + 1;
    
    // Shift modules down
    await Module.updateMany(
      { courseId: originalModule.courseId, order: { $gte: newOrder }, deletedAt: null },
      { $inc: { order: 1 } }
    );

    // Create unique slug
    const generatedSlug = `${originalModule.slug}-copy-${Date.now()}`;

    const newModule = new Module({
      courseId: originalModule.courseId,
      title: `${originalModule.title} (Copy)`,
      slug: generatedSlug,
      shortDescription: originalModule.shortDescription,
      description: originalModule.description,
      settings: originalModule.settings,
      learningObjectives: originalModule.learningObjectives,
      status: 'draft',
      order: newOrder,
      // createdBy: req.admin?._id
    });

    await newModule.save();

    await syncLessonHierarchy(newModule._id, originalModule.courseId);

    res.status(201).json({ success: true, module: newModule });
  } catch (error) {
    console.error("Error duplicating module:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
