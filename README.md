# Test Assignment

This solution calculates staff salaries based on:
- Staff type: Employee / Manager / Sales
- Seniority bonus (full years, capped)
- Hierarchy bonus:
  - Manager: +0.5% from direct subordinates' FULL salaries
  - Sales: +0.3% from all-level subordinates' FULL salaries

Storage is **transient (in-memory)** as allowed by the assignment. The solution is verified by Jest unit tests.

## Endpoints
- `GET /staff/:id/salary?date=YYYY-MM-DD`
- `GET /staff/total-salary?date=YYYY-MM-DD`

