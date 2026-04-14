const mongoose = require('mongoose');
const Gallery = require('./models/Gallery');

mongoose.connect('mongodb://localhost:27017/alum-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    const galleryImages = await Gallery.find({}).limit(10);
    console.log('Total gallery images found:', galleryImages.length);
    
    galleryImages.forEach((img, index) => {
      console.log(`${index + 1}. ID: ${img._id}`);
      console.log(`   Type: ${img.type}`);
      console.log(`   URL: ${img.url}`);
      console.log(`   Title: ${img.title || 'No title'}`);
      console.log(`   Approval Status: ${img.approvalStatus || 'No status'}`);
      console.log('---');
    });
    
    if (galleryImages.length === 0) {
      console.log('No gallery images found in database.');
      console.log('Creating sample gallery images...');
      
      const sampleImages = [
        {
          type: 'image',
          url: 'https://picsum.photos/seed/college-festival-2024/400/300.jpg',
          title: 'College Festival 2024',
          description: 'Annual cultural festival celebrations with students showcasing their talents',
          approvalStatus: 'APPROVED'
        },
        {
          type: 'image',
          url: 'https://picsum.photos/seed/graduation-2023/400/300.jpg',
          title: 'Graduation Day 2023',
          description: 'Convocation ceremony celebrating the achievements of our graduating students',
          approvalStatus: 'APPROVED'
        },
        {
          type: 'image',
          url: 'https://picsum.photos/seed/sports-meet-2024/400/300.jpg',
          title: 'Annual Sports Meet',
          description: 'Inter-college sports competition promoting teamwork and healthy competition',
          approvalStatus: 'APPROVED'
        },
        {
          type: 'image',
          url: 'https://picsum.photos/seed/alumni-meetup-2024/400/300.jpg',
          title: 'Alumni Homecoming 2024',
          description: 'Alumni reunion event connecting graduates across different batches',
          approvalStatus: 'APPROVED'
        },
        {
          type: 'image',
          url: 'https://picsum.photos/seed/technical-workshop-2024/400/300.jpg',
          title: 'Technical Workshop',
          description: 'Hands-on technical workshop on emerging technologies and industry practices',
          approvalStatus: 'APPROVED'
        },
        {
          type: 'image',
          url: 'https://picsum.photos/seed/guest-lecture-2024/400/300.jpg',
          title: 'Guest Lecture Series',
          description: 'Industry experts sharing insights and experiences with students',
          approvalStatus: 'APPROVED'
        }
      ];
      
      await Gallery.insertMany(sampleImages);
      console.log('Sample gallery images created successfully!');
      
      // Verify the created images
      const newImages = await Gallery.find({});
      console.log('Total gallery images after creation:', newImages.length);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  mongoose.connection.close();
}).catch(console.error);
