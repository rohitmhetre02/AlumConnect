const { createNotification } = require('../controllers/notificationController');

// Application Status Notifications
const notifyApplicationStatusChange = async (applicantId, status, applicationData, companyId = null) => {
  const messages = {
    'In Review': `Your application at ${applicationData.company || 'Company'} is now "In Review"`,
    'Accepted': `Congratulations! Your application at ${applicationData.company || 'Company'} has been "Accepted"`,
    'Rejected': `Your application at ${applicationData.company || 'Company'} has been "Rejected"`,
    'Shortlisted': `Your application at ${applicationData.company || 'Company'} has been "Shortlisted"`
  };

  const message = messages[status] || `Your application status has been updated to "${status}"`;

  return await createNotification(
    applicantId,
    message,
    'application',
    { status, applicationId: applicationData._id, company: applicationData.company },
    companyId
  );
};

// Mentorship Request Notifications
const notifyMentorshipStatusChange = async (menteeId, status, mentorshipData, mentorId = null) => {
  const messages = {
    'Accepted': `Your mentorship request has been accepted!`,
    'Rejected': `Your mentorship request has been rejected`,
    'Completed': `Your mentorship session has been completed`,
    'Confirmed': `Your mentorship session has been confirmed`
  };

  const message = messages[status] || `Your mentorship request status has been updated to "${status}"`;

  return await createNotification(
    menteeId,
    message,
    'mentorship',
    { status, mentorshipId: mentorshipData._id, mentorId },
    mentorId
  );
};

// Connection Request Notifications
const notifyConnectionRequest = async (recipientId, senderData) => {
  const senderName = senderData.firstName && senderData.lastName 
    ? `${senderData.firstName} ${senderData.lastName}`
    : senderData.name || 'Someone';

  const message = `New connection request from ${senderName}`;

  return await createNotification(
    recipientId,
    message,
    'connection',
    { senderId: senderData._id, senderName },
    senderData._id
  );
};

// Content Approval Notifications (for Alumni)
const notifyContentApproval = async (alumniId, contentType, contentTitle) => {
  const messages = {
    'opportunity': `Your opportunity "${contentTitle}" has been approved`,
    'event': `Your event "${contentTitle}" has been approved`,
    'campaign': `Your campaign "${contentTitle}" has been approved`
  };

  const message = messages[contentType] || `Your ${contentType} "${contentTitle}" has been approved`;

  return await createNotification(
    alumniId,
    message,
    'content_approval',
    { contentType, contentTitle },
    null
  );
};

// Event Notifications
const notifyEventUpdate = async (userId, eventType, eventData) => {
  const messages = {
    'new_event': `New event: ${eventData.title}`,
    'event_reminder': `Reminder: ${eventData.title} is starting soon`,
    'event_cancelled': `Event cancelled: ${eventData.title}`,
    'event_updated': `Event updated: ${eventData.title}`
  };

  const message = messages[eventType] || `Event update: ${eventData.title}`;

  return await createNotification(
    userId,
    message,
    'event',
    { eventId: eventData._id, eventType },
    null
  );
};

// Opportunity Notifications
const notifyOpportunityUpdate = async (userId, opportunityType, opportunityData) => {
  const messages = {
    'new_opportunity': `New opportunity: ${opportunityData.title}`,
    'opportunity_closing': `Opportunity closing soon: ${opportunityData.title}`,
    'opportunity_updated': `Opportunity updated: ${opportunityData.title}`
  };

  const message = messages[opportunityType] || `Opportunity update: ${opportunityData.title}`;

  return await createNotification(
    userId,
    message,
    'opportunity',
    { opportunityId: opportunityData._id, opportunityType },
    null
  );
};

// Campaign Notifications
const notifyCampaignUpdate = async (userId, campaignType, campaignData) => {
  const messages = {
    'new_campaign': `New campaign: ${campaignData.title}`,
    'campaign_goal_reached': `Campaign goal reached: ${campaignData.title}`,
    'campaign_ending': `Campaign ending soon: ${campaignData.title}`
  };

  const message = messages[campaignType] || `Campaign update: ${campaignData.title}`;

  return await createNotification(
    userId,
    message,
    'campaign',
    { campaignId: campaignData._id, campaignType },
    null
  );
};

// General Notification
const notifyUser = async (userId, message, type = 'general', data = {}) => {
  return await createNotification(
    userId,
    message,
    type,
    data,
    null
  );
};

module.exports = {
  notifyApplicationStatusChange,
  notifyMentorshipStatusChange,
  notifyConnectionRequest,
  notifyContentApproval,
  notifyEventUpdate,
  notifyOpportunityUpdate,
  notifyCampaignUpdate,
  notifyUser
};
