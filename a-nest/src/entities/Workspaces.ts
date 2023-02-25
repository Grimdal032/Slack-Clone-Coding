import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Channels } from './Channels';
import { DMs } from './DMs';
import { Mentions } from './Mentions';
import { WorkspaceMembers } from './WorkspaceMembers';
import { Users } from './Users';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

@Index('name', ['name'], { unique: true })
@Index('url', ['url'], { unique: true })
@Index('OwnerId', ['OwnerId'], {})
@Entity({ schema: 'sleact', name: 'workspaces' })
export class Workspaces {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '슬리액트',
    description: '워크스페이스명',
  })
  @Column('varchar', { name: 'name', unique: true, length: 30 })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'sleact',
    description: 'url 주소',
  })
  @Column('varchar', { name: 'url', unique: true, length: 30 })
  url: string;

  //@Column('datetime', { name: 'createdAt', default: () => 'CURRENT_TIMESTAMP'})
  @CreateDateColumn()
  createdAt: Date;

  //@Column('datetime', { name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP'})
  @UpdateDateColumn()
  updatedAt: Date;

  //@Column('datetime', { name: 'deletedAt', nullable: true })
  @DeleteDateColumn()
  deletedAt: Date | null;

  @Column('int', { name: 'OwnerId', nullable: true })
  OwnerId: number | null;

  @OneToMany(() => Channels, (channels) => channels.Workspace)
  Channels: Channels[];

  @OneToMany(() => DMs, (dms) => dms.Workspace)
  DMs: DMs[];

  @OneToMany(() => Mentions, (mentions) => mentions.Workspace)
  Mentions: Mentions[];

  @OneToMany(
    () => WorkspaceMembers,
    (workspacemembers) => workspacemembers.Workspace,
    { cascade: ['insert'] },
  )
  WorkspaceMembers: WorkspaceMembers[];

  @ManyToOne(() => Users, (users) => users.Workspaces, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'OwnerId', referencedColumnName: 'id' }])
  Owner: Users;

  @ManyToMany(() => Users, (users) => users.Workspaces)
  Members: Users[];
}
