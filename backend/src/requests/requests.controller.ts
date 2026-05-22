import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Controller('api/requests')
export class RequestsController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // GET /api/requests - Get current user's requests
  @Get()
  async getUserRequests(@Req() request: Request) {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return { success: false, message: 'No token provided' };
    }

    try {
      const decoded = this.jwtService.verify(token);
      
      const requests = await this.prisma.request.findMany({
        where: { userId: decoded.id },
        orderBy: { createdAt: 'desc' },
      });
      
      return requests;
    } catch (error) {
      return { success: false, message: 'Invalid or expired token' };
    }
  }

  // POST /api/requests - Create new request
  @Post()
  async createRequest(
    @Req() request: Request,
    @Body() body: { type: string; details: any },
  ) {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    // Validation 1: Check token exists
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    let decoded;
    try {
      decoded = this.jwtService.verify(token);
    } catch (error) {
      return { success: false, message: 'Invalid or expired token' };
    }

    const { type, details } = body;

    // Validation 2: Check request type is valid
    const validTypes = ['birth_certificate', 'education_certificate', 'problem', 'feature'];
    if (!type || !validTypes.includes(type)) {
      return { success: false, message: 'Invalid request type. Must be: birth_certificate, education_certificate, problem, or feature' };
    }

    // Validation 3: Check details exist
    if (!details || typeof details !== 'object' || Object.keys(details).length === 0) {
      return { success: false, message: 'Request details are required' };
    }

    // Validation 4: Type-specific validation
    const validationError = validateDetailsByType(type, details);
    if (validationError) {
      return { success: false, message: validationError };
    }

    try {
      // Save to database
      const newRequest = await this.prisma.request.create({
        data: {
          userId: decoded.id,
          type: type,
          details: details,
          status: 'pending',
        },
      });

      return { success: true, message: 'Request submitted successfully', request: newRequest };
    } catch (error) {
      console.error('Error saving request:', error);
      return { success: false, message: 'Database error. Please try again.' };
    }
  }
}

// Helper function for type-specific validation
function validateDetailsByType(type: string, details: any): string | null {
  switch (type) {
    case 'birth_certificate':
      if (!details.fullName || details.fullName.trim() === '') {
        return 'Full name is required';
      }
      if (!details.dateOfBirth) {
        return 'Date of birth is required';
      }
      if (!details.placeOfBirth || details.placeOfBirth.trim() === '') {
        return 'Place of birth is required';
      }
      if (!details.motherName || details.motherName.trim() === '') {
        return "Mother's name is required";
      }
      if (!details.fatherName || details.fatherName.trim() === '') {
        return "Father's name is required";
      }
      break;

    case 'education_certificate':
      if (!details.fullName || details.fullName.trim() === '') {
        return 'Full name is required';
      }
      if (!details.institution || details.institution.trim() === '') {
        return 'Institution name is required';
      }
      if (!details.yearGraduation) {
        return 'Year of graduation is required';
      }
      const year = parseInt(details.yearGraduation);
      if (isNaN(year) || year < 1900 || year > 2030) {
        return 'Year of graduation must be between 1900 and 2030';
      }
      break;

    case 'problem':
      if (!details.title || details.title.trim() === '') {
        return 'Problem title is required';
      }
      if (!details.description || details.description.trim() === '') {
        return 'Problem description is required';
      }
      break;

    case 'feature':
      if (!details.title || details.title.trim() === '') {
        return 'Feature title is required';
      }
      if (!details.description || details.description.trim() === '') {
        return 'Feature description is required';
      }
      if (!details.whyNeeded || details.whyNeeded.trim() === '') {
        return 'Please explain why this feature is needed';
      }
      break;

    default:
      return 'Unknown request type';
  }

  return null;
}