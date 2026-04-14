const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Student = require('./models/Student');
const Alumni = require('./models/Alumni');
const Faculty = require('./models/Faculty');
const Admin = require('./models/Admin');
const Coordinator = require('./models/Coordinator');

async function fixPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumConnect');
    console.log('🔗 Connected to MongoDB\n');

    const userModels = [
      { name: 'students', Model: Student },
      { name: 'alumni', Model: Alumni },
      { name: 'faculty', Model: Faculty },
      { name: 'admins', Model: Admin },
      { name: 'coordinators', Model: Coordinator }
    ];

    let totalFixed = 0;

    for (const { name, Model } of userModels) {
      console.log(`🔍 Checking ${name} collection...`);
      
      // Find users with plain text passwords (not starting with $2)
      const plainTextUsers = await Model.find({ 
        password: { $not: /^\$2/ } 
      });

      if (plainTextUsers.length === 0) {
        console.log(`✅ All passwords in ${name} are already hashed`);
        continue;
      }

      console.log(`🔧 Found ${plainTextUsers.length} plain text passwords in ${name}`);

      for (const user of plainTextUsers) {
        try {
          // Hash the plain text password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(user.password, salt);

          // Update the user with hashed password
          await Model.findByIdAndUpdate(user._id, { password: hashedPassword });
          
          console.log(`  ✅ Fixed password for: ${user.email}`);
          totalFixed++;
        } catch (error) {
          console.error(`  ❌ Failed to fix password for ${user.email}:`, error.message);
        }
      }
    }

    console.log(`\n🎉 Password fixing complete! Total passwords hashed: ${totalFixed}`);

    // Verify the fix
    console.log('\n🔍 Verifying password fixes...');
    for (const { name, Model } of userModels) {
      const plainTextUsers = await Model.find({ 
        password: { $not: /^\$2/ } 
      });
      
      if (plainTextUsers.length === 0) {
        console.log(`✅ ${name}: All passwords are properly hashed`);
      } else {
        console.log(`❌ ${name}: Still has ${plainTextUsers.length} plain text passwords`);
      }
    }

  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixPasswords();
