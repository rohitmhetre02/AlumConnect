const mongoose = require('mongoose');
const Student = require('./models/Student');
const Alumni = require('./models/Alumni');

// Sample student data with profile images
const sampleStudents = [
  {
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul.sharma@apcoer.in',
    department: 'Computer Engineering',
    graduationYear: '2025',
    currentYear: 'Final Year',
    profileImage: 'https://picsum.photos/seed/rahul2025/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.patel@apcoer.in',
    department: 'Information Technology',
    graduationYear: '2024',
    currentYear: 'Final Year',
    profileImage: 'https://picsum.photos/seed/priya2024/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Amit',
    lastName: 'Kumar',
    email: 'amit.kumar@apcoer.in',
    department: 'Mechanical Engineering',
    graduationYear: '2026',
    currentYear: 'Third Year',
    profileImage: 'https://picsum.photos/seed/amit2026/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Sneha',
    lastName: 'Reddy',
    email: 'sneha.reddy@apcoer.in',
    department: 'Electronics Engineering',
    graduationYear: '2025',
    currentYear: 'Final Year',
    profileImage: 'https://picsum.photos/seed/sneha2025/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'vikram.singh@apcoer.in',
    department: 'Civil Engineering',
    graduationYear: '2024',
    currentYear: 'Final Year',
    profileImage: 'https://picsum.photos/seed/vikram2024/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Neha',
    lastName: 'Gupta',
    email: 'neha.gupta@apcoer.in',
    department: 'Computer Engineering',
    graduationYear: '2026',
    currentYear: 'Third Year',
    profileImage: 'https://picsum.photos/seed/neha2026/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Rohit',
    lastName: 'Verma',
    email: 'rohit.verma@apcoer.in',
    department: 'Information Technology',
    graduationYear: '2025',
    currentYear: 'Final Year',
    profileImage: 'https://picsum.photos/seed/rohit2025/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Anjali',
    lastName: 'Desai',
    email: 'anjali.desai@apcoer.in',
    department: 'Mechanical Engineering',
    graduationYear: '2027',
    currentYear: 'Second Year',
    profileImage: 'https://picsum.photos/seed/anjali2027/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Karan',
    lastName: 'Mehta',
    email: 'karan.mehta@apcoer.in',
    department: 'Electronics Engineering',
    graduationYear: '2024',
    currentYear: 'Final Year',
    profileImage: 'https://picsum.photos/seed/karan2024/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Pooja',
    lastName: 'Joshi',
    email: 'pooja.joshi@apcoer.in',
    department: 'Civil Engineering',
    graduationYear: '2026',
    currentYear: 'Third Year',
    profileImage: 'https://picsum.photos/seed/pooja2026/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Arjun',
    lastName: 'Nair',
    email: 'arjun.nair@apcoer.in',
    department: 'Computer Engineering',
    graduationYear: '2025',
    currentYear: 'Final Year',
    profileImage: 'https://picsum.photos/seed/arjun2025/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Kavita',
    lastName: 'Menon',
    email: 'kavita.menon@apcoer.in',
    department: 'Information Technology',
    graduationYear: '2027',
    currentYear: 'Second Year',
    profileImage: 'https://picsum.photos/seed/kavita2027/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  }
];

// Sample alumni data with profile images
const sampleAlumni = [
  {
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar2015@apcoer.in',
    department: 'Computer Engineering',
    graduationYear: '2015',
    position: 'Senior Software Engineer',
    currentCompany: 'Google',
    profileImage: 'https://picsum.photos/seed/rajesh2015/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Anita',
    lastName: 'Sharma',
    email: 'anita.sharma2016@apcoer.in',
    department: 'Information Technology',
    graduationYear: '2016',
    position: 'Product Manager',
    currentCompany: 'Microsoft',
    profileImage: 'https://picsum.photos/seed/anita2016/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Sanjay',
    lastName: 'Patel',
    email: 'sanjay.patel2017@apcoer.in',
    department: 'Mechanical Engineering',
    graduationYear: '2017',
    position: 'Design Engineer',
    currentCompany: 'Tata Motors',
    profileImage: 'https://picsum.photos/seed/sanjay2017/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Meera',
    lastName: 'Reddy',
    email: 'meera.reddy2018@apcoer.in',
    department: 'Electronics Engineering',
    graduationYear: '2018',
    position: 'Hardware Engineer',
    currentCompany: 'Intel',
    profileImage: 'https://picsum.photos/seed/meera2018/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Amit',
    lastName: 'Singh',
    email: 'amit.singh2019@apcoer.in',
    department: 'Civil Engineering',
    graduationYear: '2019',
    position: 'Project Manager',
    currentCompany: 'Larsen & Toubro',
    profileImage: 'https://picsum.photos/seed/amit2019/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Priya',
    lastName: 'Gupta',
    email: 'priya.gupta2020@apcoer.in',
    department: 'Computer Engineering',
    graduationYear: '2020',
    position: 'Data Scientist',
    currentCompany: 'Amazon',
    profileImage: 'https://picsum.photos/seed/priya2020/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Vikas',
    lastName: 'Desai',
    email: 'vikas.desai2021@apcoer.in',
    department: 'Information Technology',
    graduationYear: '2021',
    position: 'Software Developer',
    currentCompany: 'Infosys',
    profileImage: 'https://picsum.photos/seed/vikas2021/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Swati',
    lastName: 'Mehta',
    email: 'swati.mehta2022@apcoer.in',
    department: 'Mechanical Engineering',
    graduationYear: '2022',
    position: 'R&D Engineer',
    currentCompany: 'Bajaj Auto',
    profileImage: 'https://picsum.photos/seed/swati2022/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Rohit',
    lastName: 'Nair',
    email: 'rohit.nair2023@apcoer.in',
    department: 'Electronics Engineering',
    graduationYear: '2023',
    position: 'Embedded Systems Engineer',
    currentCompany: 'Texas Instruments',
    profileImage: 'https://picsum.photos/seed/rohit2023/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Kavita',
    lastName: 'Joshi',
    email: 'kavita.joshi2024@apcoer.in',
    department: 'Civil Engineering',
    graduationYear: '2024',
    position: 'Structural Engineer',
    currentCompany: 'Shapoorji Pallonji',
    profileImage: 'https://picsum.photos/seed/kavita2024/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Arjun',
    lastName: 'Verma',
    email: 'arjun.verma2020@apcoer.in',
    department: 'Computer Engineering',
    graduationYear: '2020',
    position: 'Tech Lead',
    currentCompany: 'Flipkart',
    profileImage: 'https://picsum.photos/seed/arjun2020/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  },
  {
    firstName: 'Neha',
    lastName: 'Menon',
    email: 'neha.menon2021@apcoer.in',
    department: 'Information Technology',
    graduationYear: '2021',
    position: 'Business Analyst',
    currentCompany: 'Deloitte',
    profileImage: 'https://picsum.photos/seed/neha2021/200/200.jpg',
    profileApprovalStatus: 'APPROVED',
    createdAt: new Date()
  }
];

async function seedDirectoryWithImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumconnect');
    console.log('Connected to MongoDB');

    // Clear existing students and alumni
    await Student.deleteMany({});
    await Alumni.deleteMany({});
    console.log('Cleared existing students and alumni');

    // Insert sample students
    const insertedStudents = await Student.insertMany(sampleStudents);
    console.log(`Inserted ${insertedStudents.length} students with profile images:`);
    
    insertedStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.firstName} ${student.lastName} - ${student.department} (${student.currentYear})`);
    });

    // Insert sample alumni
    const insertedAlumni = await Alumni.insertMany(sampleAlumni);
    console.log(`\nInserted ${insertedAlumni.length} alumni with profile images:`);
    
    insertedAlumni.forEach((alumnus, index) => {
      console.log(`${index + 1}. ${alumnus.firstName} ${alumnus.lastName} - ${alumnus.position} at ${alumnus.currentCompany}`);
    });

    console.log('\n✅ Directory data with profile images seeded successfully!');
  } catch (error) {
    console.error('Error seeding directory data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDirectoryWithImages();
