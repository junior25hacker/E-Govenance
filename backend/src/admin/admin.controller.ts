import { Controller, Get, Post, Delete, Body, Param, Put, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from '../auth/roles.guard';
import * as bcrypt from 'bcrypt';

@Controller('api/admin')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  // GET /api/admin/users - Get all admins
  @Get('users')
  async getAdmins() {
    const admins = await this.prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true, email: true, createdAt: true }
    });
    return admins;
  }

  // POST /api/admin/users - Create new admin
  @Post('users')
  async createAdmin(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    
    // Check if user already exists
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, message: 'Email already exists' };
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin
    const admin = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'admin'
      },
      select: { id: true, email: true, createdAt: true }
    });
    
    return { success: true, admin };
  }

  // DELETE /api/admin/users/:id - Delete admin
  @Delete('users/:id')
  async deleteAdmin(@Param('id') id: string) {
    // Prevent deleting super admin
    const user = await this.prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (user?.role === 'super_admin') {
      return { success: false, message: 'Cannot delete super admin' };
    }
    
    await this.prisma.user.delete({ where: { id: parseInt(id) } });
    return { success: true };
  }

  // GET /api/admin/requests - Get all requests with user info
  @Get('requests')
  async getAllRequests() {
    const requests = await this.prisma.request.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return requests;
  }

  // PUT /api/admin/requests/:id/status - Update request status
  @Put('requests/:id/status')
  async updateRequestStatus(
    @Param('id') id: string,
    @Body() body: { status: string; adminNote?: string },
  ) {
    const validStatuses = ['pending', 'processing', 'completed', 'rejected'];
    if (!validStatuses.includes(body.status)) {
      return { success: false, message: 'Invalid status' };
    }

    const request = await this.prisma.request.update({
      where: { id: parseInt(id) },
      data: {
        status: body.status,
        adminNote: body.adminNote,
      },
    });
    return { success: true, request };
  }
}