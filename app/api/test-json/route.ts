import { NextRequest, NextResponse } from 'next/server'

// This is a test endpoint to verify JSON posting and fetching works correctly
export async function GET() {
  try {
    return NextResponse.json({
      status: 'success',
      message: 'API Test endpoint is working',
      timestamp: new Date().toISOString(),
      data: {
        server: 'Next.js 15.5.2 with Turbopack',
        environment: process.env.NODE_ENV,
        apiStatus: 'operational'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Test endpoint failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate JSON parsing worked
    if (!body) {
      return NextResponse.json({
        status: 'error',
        message: 'No JSON data received'
      }, { status: 400 })
    }

    // Test data processing
    const processedData = {
      receivedData: body,
      dataType: typeof body,
      hasProperties: Object.keys(body).length > 0,
      timestamp: new Date().toISOString(),
      processingResult: 'JSON parsing and processing successful'
    }

    return NextResponse.json({
      status: 'success',
      message: 'JSON data received and processed successfully',
      originalData: body,
      processedData: processedData,
      verification: {
        jsonParsingWorked: true,
        dataIntegrity: 'confirmed',
        apiResponse: 'operational'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'JSON processing failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      verification: {
        jsonParsingWorked: false,
        dataIntegrity: 'failed',
        apiResponse: 'error'
      }
    }, { status: 500 })
  }
}
