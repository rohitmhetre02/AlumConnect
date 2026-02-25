const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Campaign = require('../models/Campaign');

const router = express.Router();

/**
 * Create Stripe Checkout Session
 * POST /api/create-checkout-session
 * 
 * Request Body:
 * {
 *   "amount": 500,
 *   "campaignId": "64f8a9b8c9d1e2f3a4b5c6d7",
 *   "donorName": "John Doe",
 *   "donorEmail": "john@example.com",
 *   "message": "Keep up the good work!",
 *   "anonymous": false
 * }
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, campaignId, donorName, donorEmail, message, anonymous } = req.body;

    // Input validation
    if (!amount || !campaignId || !donorName || !donorEmail) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: amount, campaignId, donorName, donorEmail' 
      });
    }

    // Validate amount
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Amount must be a positive number' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(donorEmail)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    // Check if campaign exists
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ 
        success: false,
        error: 'Campaign not found' 
      });
    }

    console.log(`Creating Stripe session for campaign: ${campaign.title}, amount: ₹${numericAmount}`);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: campaign.title,
              description: `Donation to ${campaign.title}${anonymous ? ' (Anonymous)' : ''}`,
              images: campaign.coverImage && campaign.coverImage.startsWith('http') ? [campaign.coverImage] : [],
            },
            unit_amount: Math.round(numericAmount * 100), // Convert to paise (INR * 100)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/dashboard/campaigns/${campaignId}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/dashboard/campaigns/${campaignId}`,
      customer_email: donorEmail,
      metadata: {
        campaignId: campaignId,
        donorName: donorName,
        donorEmail: donorEmail,
        message: message || '',
        anonymous: anonymous?.toString() || 'false',
      },
      // For Indian regulations - collect customer information
      customer_creation: 'always',
      billing_address_collection: 'required',
    });

    // Add donation to campaign (pending status)
    const donation = {
      donorName: anonymous === 'true' ? 'Anonymous' : donorName,
      donorEmail: donorEmail,
      amount: numericAmount,
      message: message || '',
      anonymous: anonymous === 'true',
      paymentIntentId: session.payment_intent,
      sessionId: session.id,
      status: 'pending',
      createdAt: new Date(),
    };

    campaign.donations = campaign.donations || [];
    campaign.donations.push(donation);
    campaign.raisedAmount = (campaign.raisedAmount || 0) + numericAmount;
    campaign.donorCount = (campaign.donorCount || 0) + 1;
    
    await campaign.save();

    console.log(`✅ Stripe session created: ${session.id} for ₹${numericAmount}`);

    res.json({ 
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('❌ Stripe session creation error:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid request to Stripe: ' + error.message 
      });
    }
    
    if (error.type === 'StripeAuthenticationError') {
      return res.status(401).json({ 
        success: false,
        error: 'Stripe authentication failed. Check your API keys.' 
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Failed to create checkout session: ' + error.message 
    });
  }
});

/**
 * Handle successful payment (webhook alternative)
 * POST /api/payment-success
 */
router.post('/payment-success', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ 
        success: false,
        error: 'Session ID is required' 
      });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      const { campaignId, donorName, donorEmail, message, anonymous } = session.metadata;
      
      // Update donation status to completed
      const campaign = await Campaign.findById(campaignId);
      if (campaign) {
        const donation = campaign.donations.find(d => d.sessionId === sessionId);
        if (donation) {
          donation.status = 'completed';
          donation.completedAt = new Date();
          donation.paymentIntentId = session.payment_intent;
          await campaign.save();
          
          console.log(`✅ Payment completed: ₹${donation.amount} for campaign ${campaign.title}`);
        }
      }
    }

    res.json({ 
      success: true,
      paymentStatus: session.payment_status 
    });

  } catch (error) {
    console.error('❌ Payment success handling error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process payment success' 
    });
  }
});

/**
 * Test endpoint to verify Stripe integration
 * GET /api/stripe-test
 */
router.get('/stripe-test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Stripe routes working',
    stripeMode: 'test',
    currency: 'INR',
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
