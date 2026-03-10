const mongoose = require('mongoose');
const Student = require('./models/Student');
const Alumni = require('./models/Alumni');

// Sample student data
const sampleStudents = [
  {
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul.sharma@example.com',
    department: 'Computer Engineering',
    graduationYear: 2025,
    program: 'B.E. Computer Engineering',
    year: 'Final Year',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/rahul/200/200.jpg'
  },
  {
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.patel@example.com',
    department: 'Information Technology',
    graduationYear: 2024,
    program: 'B.E. Information Technology',
    year: 'Final Year',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/priya/200/200.jpg'
  },
  {
    firstName: 'Amit',
    lastName: 'Kumar',
    email: 'amit.kumar@example.com',
    department: 'Mechanical Engineering',
    graduationYear: 2025,
    program: 'B.E. Mechanical Engineering',
    year: 'Third Year',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/amit/200/200.jpg'
  },
  {
    firstName: 'Sneha',
    lastName: 'Reddy',
    email: 'sneha.reddy@example.com',
    department: 'Electronics Engineering',
    graduationYear: 2024,
    program: 'B.E. Electronics Engineering',
    year: 'Final Year',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/sneha/200/200.jpg'
  },
  {
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'vikram.singh@example.com',
    department: 'Civil Engineering',
    graduationYear: 2025,
    program: 'B.E. Civil Engineering',
    year: 'Second Year',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/vikram/200/200.jpg'
  },
  {
    firstName: 'Neha',
    lastName: 'Gupta',
    email: 'neha.gupta@example.com',
    department: 'Computer Engineering',
    graduationYear: 2023,
    program: 'B.E. Computer Engineering',
    year: 'Alumni',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/neha/200/200.jpg'
  },
  {
    firstName: 'Rohit',
    lastName: 'Verma',
    email: 'rohit.verma@example.com',
    department: 'Information Technology',
    graduationYear: 2024,
    program: 'B.E. Information Technology',
    year: 'Third Year',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/rohit/200/200.jpg'
  },
  {
    firstName: 'Anjali',
    lastName: 'Desai',
    email: 'anjali.desai@example.com',
    department: 'Mechanical Engineering',
    graduationYear: 2025,
    program: 'B.E. Mechanical Engineering',
    year: 'Second Year',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/anjali/200/200.jpg'
  },
  {
    firstName: 'Karan',
    lastName: 'Mehta',
    email: 'karan.mehta@example.com',
    department: 'Electronics Engineering',
    graduationYear: 2024,
    program: 'B.E. Electronics Engineering',
    year: 'Final Year',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/karan/200/200.jpg'
  },
  {
    firstName: 'Pooja',
    lastName: 'Shah',
    email: 'pooja.shah@example.com',
    department: 'Civil Engineering',
    graduationYear: 2023,
    program: 'B.E. Civil Engineering',
    year: 'Alumni',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/pooja/200/200.jpg'
  },
  {
    firstName: 'Arjun',
    lastName: 'Nair',
    email: 'arjun.nair@example.com',
    department: 'Computer Engineering',
    graduationYear: 2024,
    program: 'B.E. Computer Engineering',
    year: 'Third Year',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/arjun/200/200.jpg'
  },
  {
    firstName: 'Divya',
    lastName: 'Menon',
    email: 'divya.menon@example.com',
    department: 'Information Technology',
    graduationYear: 2025,
    program: 'B.E. Information Technology',
    year: 'First Year',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/divya/200/200.jpg'
  }
];

// Sample alumni data
const sampleAlumni = [
  {
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@example.com',
    department: 'Computer Engineering',
    graduationYear: 2020,
    position: 'Senior Software Engineer',
    currentCompany: 'Google',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/rajesh/200/200.jpg'
  },
  {
    firstName: 'Anita',
    lastName: 'Sharma',
    email: 'anita.sharma@example.com',
    department: 'Information Technology',
    graduationYear: 2019,
    position: 'Product Manager',
    currentCompany: 'Microsoft',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/anita/200/200.jpg'
  },
  {
    firstName: 'Vikas',
    lastName: 'Patel',
    email: 'vikas.patel@example.com',
    department: 'Mechanical Engineering',
    graduationYear: 2018,
    position: 'Design Engineer',
    currentCompany: 'Tata Motors',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/vikas/200/200.jpg'
  },
  {
    firstName: 'Sunita',
    lastName: 'Reddy',
    email: 'sunita.reddy@example.com',
    department: 'Electronics Engineering',
    graduationYear: 2021,
    position: 'Hardware Engineer',
    currentCompany: 'Intel',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/sunita/200/200.jpg'
  },
  {
    firstName: 'Amit',
    lastName: 'Singh',
    email: 'amit.singh@example.com',
    department: 'Civil Engineering',
    graduationYear: 2017,
    position: 'Project Manager',
    currentCompany: 'Larsen & Toubro',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/amitsingh/200/200.jpg'
  },
  {
    firstName: 'Priya',
    lastName: 'Gupta',
    email: 'priya.gupta@example.com',
    department: 'Computer Engineering',
    graduationYear: 2020,
    position: 'Data Scientist',
    currentCompany: 'Amazon',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/priyagupta/200/200.jpg'
  },
  {
    firstName: 'Rohit',
    lastName: 'Verma',
    email: 'rohit.verma@example.com',
    department: 'Information Technology',
    graduationYear: 2019,
    position: 'DevOps Engineer',
    currentCompany: 'Infosys',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/rohitverma/200/200.jpg'
  },
  {
    firstName: 'Neha',
    lastName: 'Desai',
    email: 'neha.desai@example.com',
    department: 'Mechanical Engineering',
    graduationYear: 2018,
    position: 'QA Engineer',
    currentCompany: 'Bosch',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/nehadesai/200/200.jpg'
  },
  {
    firstName: 'Karan',
    lastName: 'Shah',
    email: 'karan.shah@example.com',
    department: 'Electronics Engineering',
    graduationYear: 2021,
    position: 'Embedded Systems Engineer',
    currentCompany: 'Texas Instruments',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/karanshah/200/200.jpg'
  },
  {
    firstName: 'Pooja',
    lastName: 'Menon',
    email: 'pooja.menon@example.com',
    department: 'Civil Engineering',
    graduationYear: 2017,
    position: 'Structural Engineer',
    currentCompany: 'Shapoorji Pallonji',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/poojamenon/200/200.jpg'
  },
  {
    firstName: 'Arjun',
    lastName: 'Nair',
    email: 'arjun.nair@example.com',
    department: 'Computer Engineering',
    graduationYear: 2020,
    position: 'Full Stack Developer',
    currentCompany: 'Flipkart',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/arjunnair/200/200.jpg'
  },
  {
    firstName: 'Divya',
    lastName: 'Mehta',
    email: 'divya.mehta@example.com',
    department: 'Information Technology',
    graduationYear: 2019,
    position: 'Business Analyst',
    currentCompany: 'Accenture',
    profileApprovalStatus: 'APPROVED',
    profileImage: 'https://picsum.photos/seed/divyamehta/200/200.jpg'
  }
];

async function seedDirectories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumconnect', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🌱 Seeding directories...');

    // Clear existing approved students and alumni (optional)
    await Student.deleteMany({ profileApprovalStatus: 'APPROVED' });
    await Alumni.deleteMany({ profileApprovalStatus: 'APPROVED' });

    // Insert sample students
    const insertedStudents = await Student.insertMany(sampleStudents);
    console.log(`✅ Inserted ${insertedStudents.length} students`);

    // Insert sample alumni
    const insertedAlumni = await Alumni.insertMany(sampleAlumni);
    console.log(`✅ Inserted ${insertedAlumni.length} alumni`);

    console.log('🎉 Directory seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding directories:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seeding function
seedDirectories();
