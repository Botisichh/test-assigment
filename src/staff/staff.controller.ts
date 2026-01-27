import { Controller, Get, Param, Query, BadRequestException } from '@nestjs/common';
import { StaffService } from './staff.service';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // Returns salary for one staff member at the given date.
  @Get(':id/salary')
  async getOne(@Param('id') id: string, @Query('date') dateStr?: string) {
    const staffId = Number(id);
    if (!Number.isFinite(staffId)) throw new BadRequestException('Invalid id');

    const date = dateStr ? new Date(dateStr) : new Date();
    if (Number.isNaN(date.getTime())) throw new BadRequestException('Invalid date');

    const salary = await this.staffService.getSalary(staffId, date);
    return { id: staffId, salary, date: date.toISOString().split('T')[0] };
  }

  // Returns the sum of salaries for all staff members at the given date.
  @Get('total-salary')
  async getTotal(@Query('date') dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    if (Number.isNaN(date.getTime())) throw new BadRequestException('Invalid date');

    const total = await this.staffService.getTotalSalary(date);
    return { total, date: date.toISOString().split('T')[0] };
  }
}
