import { Injectable, BadRequestException } from '@nestjs/common';

export type StaffType = 'Employee' | 'Manager' | 'Sales';

export interface StaffMember {
  id: number;
  name: string;
  type: StaffType;
  joinedDate: Date;
  baseSalary: number;
  supervisorId: number | null;
}

@Injectable()
export class StaffService {
  // Simple in-memory data
  private staff: StaffMember[] = [
    { id: 1, name: 'Jack Adams', type: 'Manager', joinedDate: new Date('2020-01-01'), baseSalary: 1000, supervisorId: null },
    { id: 2, name: 'Barbara Cook', type: 'Sales', joinedDate: new Date('2021-06-01'), baseSalary: 1000, supervisorId: 1 },
    { id: 3, name: 'Eva Fox', type: 'Employee', joinedDate: new Date('2022-01-15'), baseSalary: 1000, supervisorId: 2 },
  ];

  // Main function to get salary
  async getSalary(id: number, date: Date): Promise<number> {
    // Check if date is correct
    if (isNaN(date.getTime())) throw new BadRequestException('Invalid date');

    const person = this.staff.find(s => s.id === id);
    if (!person || date < person.joinedDate) return 0;

    // 1. Calculate years of service
    let years = date.getFullYear() - person.joinedDate.getFullYear();
    const anniversary = new Date(person.joinedDate);
    anniversary.setFullYear(date.getFullYear());
    if (date < anniversary) years--;
    if (years < 0) years = 0;

    // 2. Calculate base salary with seniority bonus
    let total = person.baseSalary;
    if (person.type === 'Employee') {
      total += person.baseSalary * Math.min(years * 0.03, 0.30);
    } else if (person.type === 'Manager') {
      total += person.baseSalary * Math.min(years * 0.05, 0.40);
      
      // Add 0.5% from each direct subordinate
      const directSubs = this.staff.filter(s => s.supervisorId === person.id);
      for (const sub of directSubs) {
        total += (await this.getSalary(sub.id, date)) * 0.005;
      }
    } else if (person.type === 'Sales') {
      total += person.baseSalary * Math.min(years * 0.01, 0.35);

      // Add 0.3% from all subordinates (any level)
      const allSubIds = this.findAllSubordinates(person.id);
      for (const subId of allSubIds) {
        total += (await this.getSalary(subId, date)) * 0.003;
      }
    }

    return parseFloat(total.toFixed(2));
  }

  // Simple loop to find all subordinates for Sales
  private findAllSubordinates(bossId: number): number[] {
    const ids: number[] = [];
    const list = [bossId];

    while (list.length > 0) {
      const currentId = list.shift()!;
      const children = this.staff.filter(s => s.supervisorId === currentId);
      for (const child of children) {
        ids.push(child.id);
        list.push(child.id);
      }
    }
    return ids;
  }

  // Sum of all salaries in the company
  async getTotalSalary(date: Date): Promise<number> {
    if (isNaN(date.getTime())) throw new BadRequestException('Invalid date');

    let sum = 0;
    for (const person of this.staff) {
      sum += await this.getSalary(person.id, date);
    }
    return parseFloat(sum.toFixed(2));
  }
}