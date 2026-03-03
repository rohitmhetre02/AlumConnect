const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const User = require('../models/User')
const Event = require('../models/Event')
const Opportunity = require('../models/Opportunity')
const News = require('../models/News')
const MentorRequest = require('../models/MentorRequest')

// Get faculty's department students
router.get('/students', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id
    const role = (req.user?.role || '').toLowerCase()

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (role !== 'faculty') {
      return res.status(403).json({ message: 'Only faculty can view department students.' })
    }

    // TODO: Implement real student fetching based on faculty's department
    // For now, return empty array
    const students = []

    res.status(200).json({
      success: true,
      data: students,
      count: students.length
    })
  } catch (error) {
    console.error('Error fetching faculty students:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    })
  }
})

// Get alumni linked to faculty's department
router.get('/alumni', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id
    const role = (req.user?.role || '').toLowerCase()

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (role !== 'faculty') {
      return res.status(403).json({ message: 'Only faculty can view department alumni.' })
    }

    // TODO: Implement real alumni fetching based on faculty's department
    // For now, return empty array
    const alumni = []

    res.status(200).json({
      success: true,
      data: alumni,
      count: alumni.length
    })
  } catch (error) {
    console.error('Error fetching faculty alumni:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alumni',
      error: error.message
    })
  }
})

// Get events requiring faculty approval
router.get('/events/pending', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id
    const role = (req.user?.role || '').toLowerCase()

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (role !== 'faculty') {
      return res.status(403).json({ message: 'Only faculty can view pending events.' })
    }

    // TODO: Implement real event fetching for faculty approval
    // For now, return empty array
    const events = []

    res.status(200).json({
      success: true,
      data: events,
      count: events.length
    })
  } catch (error) {
    console.error('Error fetching pending events:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending events',
      error: error.message
    })
  }
})

// Get student activities in faculty's department
router.get('/student-activities', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id
    const role = (req.user?.role || '').toLowerCase()

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (role !== 'faculty') {
      return res.status(403).json({ message: 'Only faculty can view student activities.' })
    }

    // TODO: Implement real activity fetching for faculty's department
    // For now, return empty array
    const activities = []

    res.status(200).json({
      success: true,
      data: activities,
      count: activities.length
    })
  } catch (error) {
    console.error('Error fetching student activities:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student activities',
      error: error.message
    })
  }
})

// Get engagement metrics for faculty
router.get('/engagement-metrics', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id
    const role = (req.user?.role || '').toLowerCase()

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (role !== 'faculty') {
      return res.status(403).json({ message: 'Only faculty can view engagement metrics.' })
    }

    // TODO: Implement real metrics calculation
    // For now, return default metrics
    const metrics = {
      studentEngagement: 0,
      alumniParticipation: 0,
      eventSuccess: 0
    }

    res.status(200).json({
      success: true,
      data: metrics
    })
  } catch (error) {
    console.error('Error fetching engagement metrics:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch engagement metrics',
      error: error.message
    })
  }
})

// Dashboard endpoints for real-time data

// Get counts for dashboard
router.get('/counts', authMiddleware, async (req, res) => {
  try {
    const [
      studentsCount,
      alumniCount,
      opportunitiesCount,
      eventsCount
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'alumni' }),
      Opportunity.countDocuments(),
      Event.countDocuments({ date: { $gte: new Date() } })
    ])

    res.json({
      students: studentsCount,
      alumni: alumniCount,
      opportunities: opportunitiesCount,
      events: eventsCount
    });
  } catch (error) {
    console.error('Error fetching counts:', error);
    res.status(500).json({ message: 'Error fetching counts' });
  }
});

// Individual count endpoints
router.get('/students/count', authMiddleware, async (req, res) => {
  try {
    let count = 0;
    try {
      count = await User.countDocuments({ role: 'student' });
    } catch (userError) {
      console.log('User model not available or error:', userError.message);
    }
    res.json({ count });
  } catch (error) {
    console.error('Error fetching students count:', error);
    res.status(500).json({ message: 'Error fetching students count' });
  }
});

router.get('/alumni/count', authMiddleware, async (req, res) => {
  try {
    let count = 0;
    try {
      count = await User.countDocuments({ role: 'alumni' });
    } catch (userError) {
      console.log('User model not available or error:', userError.message);
    }
    res.json({ count });
  } catch (error) {
    console.error('Error fetching alumni count:', error);
    res.status(500).json({ message: 'Error fetching alumni count' });
  }
});

router.get('/opportunities/count', authMiddleware, async (req, res) => {
  try {
    let count = 0;
    try {
      count = await Opportunity.countDocuments();
    } catch (opportunityError) {
      console.log('Opportunity model not available or error:', opportunityError.message);
    }
    res.json({ count });
  } catch (error) {
    console.error('Error fetching opportunities count:', error);
    res.status(500).json({ message: 'Error fetching opportunities count' });
  }
});

router.get('/events/count', authMiddleware, async (req, res) => {
  try {
    let count = 0;
    try {
      count = await Event.countDocuments({ date: { $gte: new Date() } });
    } catch (eventError) {
      console.log('Event model not available or error:', eventError.message);
    }
    res.json({ count });
  } catch (error) {
    console.error('Error fetching events count:', error);
    res.status(500).json({ message: 'Error fetching events count' });
  }
});

// Get upcoming events
router.get('/events/upcoming', authMiddleware, async (req, res) => {
  try {
    let events = [];
    try {
      events = await Event.find({ 
        date: { $gte: new Date() } 
      })
      .sort({ date: 1 })
      .limit(10)
      .select('title date time location attendees');
    } catch (eventError) {
      console.log('Event model not available or error:', eventError.message);
      // Return empty array if Event model doesn't exist
    }

    res.json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get recent department activities
router.get('/activities/department', authMiddleware, async (req, res) => {
  try {
    const activities = [];

    // Recent mentorship requests - with error handling
    try {
      const recentMentorRequests = await MentorRequest.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('student', 'name')
        .populate('mentor', 'name');

      recentMentorRequests.forEach(request => {
        activities.push({
          _id: request._id,
          type: 'student',
          title: `${request.student?.name || 'Student'} requested mentorship`,
          time: formatTimeAgo(request.createdAt),
          createdAt: request.createdAt
        });
      });
    } catch (mentorError) {
      console.log('MentorRequest model not available or error:', mentorError.message);
    }

    // Recent opportunities - with error handling
    try {
      const recentOpportunities = await Opportunity.find()
        .sort({ createdAt: -1 })
        .limit(2)
        .select('title createdAt');

      recentOpportunities.forEach(opportunity => {
        activities.push({
          _id: opportunity._id,
          type: 'opportunity',
          title: `New opportunity: ${opportunity.title}`,
          time: formatTimeAgo(opportunity.createdAt),
          createdAt: opportunity.createdAt
        });
      });
    } catch (opportunityError) {
      console.log('Opportunity model not available or error:', opportunityError.message);
    }

    // Recent events - with error handling
    try {
      const recentEvents = await Event.find()
        .sort({ createdAt: -1 })
        .limit(2)
        .select('title createdAt');

      recentEvents.forEach(event => {
        activities.push({
          _id: event._id,
          type: 'event',
          title: `New event: ${event.title}`,
          time: formatTimeAgo(event.createdAt),
          createdAt: event.createdAt
        });
      });
    } catch (eventError) {
      console.log('Event model not available or error:', eventError.message);
    }

    // Recent news - with error handling
    try {
      const recentNews = await News.find()
        .sort({ createdAt: -1 })
        .limit(2)
        .select('title createdAt');

      recentNews.forEach(news => {
        activities.push({
          _id: news._id,
          type: 'news',
          title: `News published: ${news.title}`,
          time: formatTimeAgo(news.createdAt),
          createdAt: news.createdAt
        });
      });
    } catch (newsError) {
      console.log('News model not available or error:', newsError.message);
    }

    // If no activities found, add some sample activities
    if (activities.length === 0) {
      activities.push(
        {
          _id: 'sample1',
          type: 'student',
          title: 'Sample student activity',
          time: '2 hours ago',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          _id: 'sample2',
          type: 'event',
          title: 'Sample event created',
          time: '4 hours ago',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      );
    }

    // Sort by creation time and limit to 10
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const limitedActivities = activities.slice(0, 10);

    res.json(limitedActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return past.toLocaleDateString();
  }
}

module.exports = router
