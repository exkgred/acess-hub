import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AccessTokenPayload } from '../../application/interfaces/auth.interfaces';
import {
  LaunchAppUseCase,
  ListAccessLogsUseCase,
} from '../../application/use-cases/access/launch-app.use-case';
import { GetWorkspaceUseCase } from '../../application/use-cases/catalog/get-workspace.use-case';
import {
  ListUsersUseCase,
  UpdateUserPackageUseCase,
} from '../../application/use-cases/catalog/manage-users.use-case';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ListAuditQueryDto, UpdatePackageDto } from '../dto/auth.dto';
import { RolesGuard } from '../guards/roles.guard';

@ApiTags('Hub')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class HubController {
  constructor(
    private readonly getWorkspace: GetWorkspaceUseCase,
    private readonly launchApp: LaunchAppUseCase,
    private readonly listAccessLogs: ListAccessLogsUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly updateUserPackage: UpdateUserPackageUseCase,
  ) {}

  @Get('workspace')
  @ApiOperation({
    summary: 'Launchpad do usuário',
    description:
      'Devolve o pacote contratado e o catálogo com entitled true/false. Admin e recruiter veem todos os sistemas; member só os do pacote.',
  })
  workspace(@CurrentUser() user: AccessTokenPayload) {
    return this.getWorkspace.execute({ userId: user.sub });
  }

  @Post('apps/:slug/launch')
  @ApiOperation({
    summary: 'Abrir um sistema do pacote',
    description:
      'Registra auditoria e devolve URL + credenciais da demo. 403 se o módulo não estiver no pacote.',
  })
  launch(@CurrentUser() user: AccessTokenPayload, @Param('slug') slug: string) {
    return this.launchApp.execute({ userId: user.sub, appSlug: slug });
  }

  @Get('audit')
  @ApiOperation({
    summary: 'Auditoria de acessos',
    description:
      'Recruiter e admin veem todos os lançamentos. Member vê só os próprios.',
  })
  audit(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: ListAuditQueryDto,
  ) {
    return this.listAccessLogs.execute({
      actorId: user.sub,
      page: query.page,
      perPage: query.perPage,
    });
  }

  @Get('users')
  @ApiOperation({
    summary: 'Pessoas do hub',
    description: 'Lista usuários e pacotes. Bloqueado para MEMBER.',
  })
  users(@CurrentUser() user: AccessTokenPayload) {
    return this.listUsers.execute({ actorRole: user.role });
  }

  @Patch('users/:id/package')
  @ApiOperation({
    summary: 'Trocar pacote de um usuário',
    description: 'Somente ADMIN. Altera quais sistemas o member passa a ver.',
  })
  changePackage(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdatePackageDto,
  ) {
    return this.updateUserPackage.execute({
      actorRole: user.role,
      userId: id,
      packageSlug: dto.packageSlug,
    });
  }
}
