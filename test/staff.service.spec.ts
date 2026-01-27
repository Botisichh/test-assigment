import { StaffService } from '../src/staff/staff.service';

describe('StaffService', () => {
  let service: StaffService;

  beforeEach(() => {
    service = new StaffService();
    (service as any).staff = [
      { id: 1, name: 'SalesTop', type: 'Sales', joinedDate: new Date('2020-01-01'), baseSalary: 1000, supervisorId: null },
      { id: 2, name: 'ManagerMid', type: 'Manager', joinedDate: new Date('2020-01-01'), baseSalary: 1000, supervisorId: 1 },
      { id: 3, name: 'EmployeeLeaf', type: 'Employee', joinedDate: new Date('2020-01-01'), baseSalary: 1000, supervisorId: 2 },
      { id: 4, name: 'SalesLeaf', type: 'Sales', joinedDate: new Date('2020-01-01'), baseSalary: 1000, supervisorId: 2 },
    ];
  });

  it('returns 0 if date is before joinedDate', async () => {
    const salary = await service.getSalary(3, new Date('2019-12-31'));
    expect(salary).toBe(0);
  });

  it('throws BadRequestException for invalid date', async () => {
    // Invalid Date
    const bad = new Date('not-a-date');
    await expect(service.getSalary(1, bad)).rejects.toThrow('Invalid date');
  });

  it('Employee bonus is 3% per year capped at 30%', async () => {
    // 2050-01-01 vs 2020-01-01 => 30 full years => 90% but cap 30% => 1300
    const salary = await service.getSalary(3, new Date('2050-01-01'));
    expect(salary).toBe(1300);
  });

  it('Manager: gets 5% per year capped at 40% + 0.5% ONLY from direct subordinates full salaries', async () => {
    const at = new Date('2025-01-01'); // 5 full years from 2020-01-01

    // EmployeeLeaf: 5y => 15% => 1150
    const employee = await service.getSalary(3, at);
    expect(employee).toBe(1150);

    // SalesLeaf: 5y => 5% => 1050 (подчинённых нет)
    const salesLeaf = await service.getSalary(4, at);
    expect(salesLeaf).toBe(1050);

    // ManagerMid: base+experience: 1000*(1+25%)=1250
    // + 0.5% от direct subordinates: EmployeeLeaf + SalesLeaf
    // direct sum = 1150 + 1050 = 2200
    // bonus = 2200 * 0.005 = 11
    // total = 1261
    const manager = await service.getSalary(2, at);
    expect(manager).toBe(1261);
  });

  it('Sales: gets 1% per year capped at 35% + 0.3% from ALL-level subordinates full salaries', async () => {
    const at = new Date('2025-01-01'); // 5 full years from 2020-01-01


    const manager = await service.getSalary(2, at); // 1261
    const employee = await service.getSalary(3, at); // 1150
    const salesLeaf = await service.getSalary(4, at); // 1050
    const salesTop = await service.getSalary(1, at);
    expect(salesTop).toBe(1060.38);
  });

  it('getTotalSalary: sums salaries of all staff for the same date', async () => {
    const at = new Date('2025-01-01');

    const s1 = await service.getSalary(1, at);
    const s2 = await service.getSalary(2, at);
    const s3 = await service.getSalary(3, at);
    const s4 = await service.getSalary(4, at);

    const total = await service.getTotalSalary(at);
    const expected = +(s1 + s2 + s3 + s4).toFixed(2);

    expect(total).toBe(expected);
  });

  it('experience years boundary: before anniversary does not count a full year', async () => {
    const at = new Date('2020-12-31');
    const employee = await service.getSalary(3, at); 
    expect(employee).toBe(1000); 
  });
});
