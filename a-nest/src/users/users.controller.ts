import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { localAuthGuard } from 'src/auth/local-auth.guard';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { NotLoggedInGuard } from 'src/auth/not-logged-in.guard';
import { User } from 'src/common/decorators/user.decorator';
import { UserDto } from 'src/common/dto/user.dto';
import { Users } from 'src/entities/Users';
import { JoinRequestDto } from './dto/join.request.dto';
import { UsersService } from './users.service';

@ApiTags('USERS')
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '내 정보 가져오기' })
  @Get()
  async getProfile(@User() user: Users) {
    return user || false;
  }

  @ApiOperation({ summary: '회원 가입' })
  @UseGuards(NotLoggedInGuard)
  @Post()
  async join(@Body() data: JoinRequestDto) {
    const user = this.usersService.findByEmail(data.email);
    if (!user) throw new NotFoundException();
    const result: any = await this.usersService.join(
      data.email,
      data.nickname,
      data.password,
    );
    if (result) return 'ok';
    else throw new ForbiddenException();
  }

  @ApiOperation({ summary: '로그인' })
  @UseGuards(localAuthGuard)
  @Post('login')
  async login(@User() user: Users) {
    return user;
  }

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '로그 아웃' })
  @UseGuards(LoggedInGuard)
  @Post('logout')
  async logOut(@Res() res) {
    res.clearCookie('connect.sid', { httpOnly: true });
    return res.send('ok');
  }
}
