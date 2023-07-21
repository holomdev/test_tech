import { Comment } from '../../comments/entities/comment.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post, { onDelete: 'CASCADE' })
  comments: Comment[];
}
