const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleDrafts() {
  console.log('📝 Creating sample drafts for current user...\n');

  const userId = '68bfde21e6e8aa0983eb2a46'; // Current logged-in user

  try {
    // Sample draft 1
    const draft1 = await prisma.post.create({
      data: {
        title: "React Performance Optimization: Advanced Techniques and Best Practices",
        content: `# React Performance Optimization: Advanced Techniques and Best Practices

Performance optimization is crucial for modern React applications. In this comprehensive guide, we'll explore advanced techniques to make your React apps faster and more efficient.

## Key Performance Bottlenecks

1. **Unnecessary Re-renders**: Components re-rendering when they don't need to
2. **Large Bundle Sizes**: Too much JavaScript being loaded
3. **Memory Leaks**: Improper cleanup of subscriptions and listeners
4. **Inefficient State Management**: Poor state structure causing cascading updates

## Advanced Optimization Techniques

### 1. Memoization Strategies
Using React.memo, useMemo, and useCallback effectively can prevent unnecessary computations and re-renders.

### 2. Code Splitting and Lazy Loading
Implement dynamic imports and React.lazy for better initial load times.

### 3. Virtual Scrolling
For large lists, virtual scrolling can dramatically improve performance.

This guide will help you identify and fix performance issues in your React applications.`,
        status: "draft",
        writingPhase: "Needs Editing",
        excerpt: "Performance optimization is crucial for modern React applications. Learn advanced techniques to make your React apps faster...",
        authorId: userId,
        wordCount: 156,
      },
    });

    // Sample draft 2
    const draft2 = await prisma.post.create({
      data: {
        title: "Building Scalable APIs with Node.js and Express: A Complete Guide",
        content: `# Building Scalable APIs with Node.js and Express

Creating robust, scalable APIs is essential for modern web applications. This guide covers best practices for building production-ready APIs.

## Architecture Principles

1. **RESTful Design**: Following REST conventions
2. **Error Handling**: Comprehensive error management
3. **Authentication & Authorization**: Secure access control
4. **Rate Limiting**: Protecting against abuse
5. **Caching**: Improving response times

## Implementation Details

We'll build a complete API from scratch, covering:
- Database integration with MongoDB
- JWT authentication
- Input validation
- API documentation
- Testing strategies

This comprehensive approach ensures your API can handle real-world traffic and requirements.`,
        status: "draft",
        writingPhase: "Ready to Publish",
        excerpt: "Creating robust, scalable APIs is essential for modern web applications. Learn best practices for building production-ready APIs...",
        authorId: userId,
        wordCount: 124,
      },
    });

    // Sample draft 3
    const draft3 = await prisma.post.create({
      data: {
        title: "Modern JavaScript ES2024 Features Every Developer Should Know",
        content: `# Modern JavaScript ES2024 Features

JavaScript continues to evolve with new features that improve developer productivity and code quality.

## New Features Overview

1. **Temporal API**: Better date/time handling
2. **Pattern Matching**: Cleaner conditional logic
3. **Records and Tuples**: Immutable data structures

This is still a work in progress as I research the latest specifications and browser support.`,
        status: "draft",
        writingPhase: "Incomplete",
        excerpt: "JavaScript continues to evolve with new features that improve developer productivity...",
        authorId: userId,
        wordCount: 45,
      },
    });

    console.log('✅ Sample drafts created successfully:');
    console.log(`   1. "${draft1.title}" - ${draft1.writingPhase}`);
    console.log(`   2. "${draft2.title}" - ${draft2.writingPhase}`);
    console.log(`   3. "${draft3.title}" - ${draft3.writingPhase}`);
    
    console.log('\n🎉 User now has 4 total drafts (1 existing + 3 new)');

  } catch (error) {
    console.error('❌ Error creating sample drafts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleDrafts();
