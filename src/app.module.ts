import { Module } from '@nestjs/common';
import { StaffModule } from './staff/staff.module';

// Root application module
@Module({
  imports: [StaffModule],
})
export class AppModule {}
