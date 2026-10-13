import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PublicUser } from './public-user';

const NAME = /^[A-Za-z]{2,20}$/;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async register(name: string): Promise<PublicUser> {
    const trimmed = name.trim();
    if (!NAME.test(trimmed)) {
      throw new BadRequestException('Имя: латиница, от 2 до 20 символов');
    }
    try {
      const user = await this.prisma.user.create({
        data: {
          name: trimmed,
          nameKey: trimmed.toLowerCase(),
        },
      });
      return toPublic(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Имя уже занято');
      }
      throw error;
    }
  }

  async findById(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Игрок не найден');
    }
    return toPublic(user);
  }

  async leaders(): Promise<PublicUser[]> {
    const users = await this.prisma.user.findMany({
      orderBy: [{ wins: 'desc' }, { name: 'asc' }],
    });
    return users.map(toPublic);
  }
}

function toPublic(user: { id: string; name: string; wins: number }): PublicUser {
  return { id: user.id, name: user.name, wins: user.wins };
}
