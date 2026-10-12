
const SubSection = require("../models/Subsection")
const CourseProgress = require("../models/CourseProgress")
const Course = require("../models/Course")
const Section = require("../models/Section")

// ========================================
// UPDATE COURSE PROGRESS
// ========================================
exports.updateCourseProgress = async (req, res) => {
  try {
    const { courseId, subsectionId } = req.body
    const userId = req.user.id

    if (!courseId || !subsectionId) {
      return res.status(400).json({
        success: false,
        message: "Course ID and Subsection ID are required",
      })
    }

    const subsection = await SubSection.findById(subsectionId)

    if (!subsection) {
      return res.status(404).json({
        success: false,
        message: "Invalid subsection",
      })
    }

    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    })

    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId,
        completedVideos: [subsectionId],
      })
    } else {
      const alreadyCompleted = courseProgress.completedVideos.some(
        (id) => id.toString() === subsectionId
      )

      if (alreadyCompleted) {
        return res.status(200).json({
          success: true,
          message: "Subsection already completed",
        })
      }

      courseProgress.completedVideos.push(subsectionId)
      await courseProgress.save()
    }

    return res.status(200).json({
      success: true,
      message: "Course progress updated successfully",
      completedVideos: courseProgress.completedVideos.length,
    })
  } catch (error) {
    console.error("UPDATE COURSE PROGRESS ERROR:", error)

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

// ========================================
// GET COURSE PROGRESS PERCENTAGE
// ========================================
exports.getProgressPercentage = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      })
    }

    const course = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    })

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    })

    const completedVideos = courseProgress
      ? courseProgress.completedVideos.map((id) => id.toString())
      : []

    // Count all subsections/lectures in the course
    let totalLectures = 0

    course.courseContent.forEach((section) => {
      totalLectures += section.subSection
        ? section.subSection.length
        : 0
    })

    if (totalLectures === 0) {
      return res.status(200).json({
        success: true,
        data: 0,
        completedLectures: 0,
        totalLectures: 0,
        message: "No lectures available in this course",
      })
    }

    // Count only completed videos belonging to this course
    const validSubsectionIds = new Set()

    course.courseContent.forEach((section) => {
      section.subSection?.forEach((subsection) => {
        validSubsectionIds.add(subsection._id.toString())
      })
    })

    const validCompletedCount = new Set(
      completedVideos.filter((id) => validSubsectionIds.has(id))
    ).size

    const progressPercentage = Math.round(
      (validCompletedCount / totalLectures) * 10000
    ) / 100

    return res.status(200).json({
      success: true,
      data: progressPercentage,
      completedLectures: validCompletedCount,
      totalLectures,
      message: "Course progress fetched successfully",
    })
  } catch (error) {
    console.error("GET COURSE PROGRESS ERROR:", error)

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}
