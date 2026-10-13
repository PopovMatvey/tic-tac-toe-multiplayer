import { Controller, Get } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('api/leaders')
export class LeadersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list() {
    return this.users.leaders();
  }
}
