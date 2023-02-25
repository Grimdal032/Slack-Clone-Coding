import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Channels } from 'src/entities/Channels';
import { Users } from 'src/entities/Users';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { Workspaces } from 'src/entities/Workspaces';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspaces)
    private readonly workspacesRepository: Repository<Workspaces>,
    @InjectRepository(Channels)
    private readonly channelsRepository: Repository<Channels>,
    @InjectRepository(WorkspaceMembers)
    private readonly workspaceMembersRepository: Repository<WorkspaceMembers>,
    @InjectRepository(ChannelMembers)
    private readonly channelMembersRepository: Repository<ChannelMembers>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private dataSource: DataSource,
  ) {}
  async findById(id: number) {
    return this.workspacesRepository.findOne({ where: { id } });
  }

  async findMyWorkspaces(myId: number) {
    return this.workspacesRepository.find({
      where: {
        WorkspaceMembers: [{ UserId: myId }],
      },
    });
  }

  async createWorkspace(name: string, url: string, myId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const workspace = await queryRunner.manager
        .getRepository(Workspaces)
        .create({
          name,
          url,
          OwnerId: myId,
        });
      const returned = await queryRunner.manager
        .getRepository(Workspaces)
        .save(workspace); // 1

      const workspaceMember = await queryRunner.manager
        .getRepository(WorkspaceMembers)
        .create({
          UserId: myId,
          WorkspaceId: returned.id,
        });
      const channel = await queryRunner.manager.getRepository(Channels).create({
        name: '일반',
        WorkspaceId: returned.id,
      });
      const [, channelReturned] = await Promise.all([
        // 2
        await queryRunner.manager
          .getRepository(WorkspaceMembers)
          .save(workspaceMember),
        await queryRunner.manager.getRepository(Channels).save(channel),
      ]);

      const channelMember = await queryRunner.manager
        .getRepository(ChannelMembers)
        .create({
          UserId: myId,
          ChannelId: channelReturned.id,
        });
      await queryRunner.manager
        .getRepository(ChannelMembers)
        .save(channelMember); // 3

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getWorkspaceMembers(url: string) {
    return this.usersRepository
      .createQueryBuilder('u')
      .innerJoin('u.WorkspaceMembers', 'm')
      .innerJoin('u.Workspace', 'w', 'w.url = :url', { url })
      .getMany();
  }

  async createWorkspaceMembers(url, email) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const workspace = await this.workspacesRepository.findOne({
        where: { url },
        // relations: ['Channels']
        join: {
          alias: 'workspace',
          innerJoinAndSelect: {
            channels: 'workspace.Channels',
          },
        },
        // this.workspacesRepository.createQueryBuilder('workspace')
        //  .innerJoinAndSelect('workspace.Channels', 'channels')
        //  .getOne();
      });

      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) {
        return null;
      }
      const workspaceMember = new WorkspaceMembers();
      workspaceMember.WorkspaceId = workspace.id;
      workspaceMember.UserId = user.id;
      await queryRunner.manager
        .getRepository(WorkspaceMembers)
        .save(workspaceMember);
      const channelMember = new ChannelMembers();
      channelMember.ChannelId = workspace.Channels.find(
        (v) => v.name === '일반',
      ).id;
      channelMember.UserId = user.id;
      await queryRunner.manager
        .getRepository(ChannelMembers)
        .save(channelMember);

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getWorkspaceMember(url: string, id: number) {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .innerJoin('user.Workspaces', 'workspaces', 'workspaces.url = :url', {
        url,
      })
      .getOne();
  }
}
