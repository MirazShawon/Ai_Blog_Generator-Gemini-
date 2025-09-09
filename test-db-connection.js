// test-db-connection.js
const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test querying users
    const userCount = await prisma.user.count()
    console.log(`📊 Current user count: ${userCount}`)
    
    // Test creating a user (this will help identify if bcrypt is working)
    const bcrypt = require('bcrypt')
    const hashedPassword = await bcrypt.hash('testpassword123', 10)
    console.log('✅ Password hashing works')
    
    console.log('🎉 All database tests passed!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
