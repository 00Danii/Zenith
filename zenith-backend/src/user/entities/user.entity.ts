import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: 'user';

  @Column({ nullable: true })
  profileImageUrl: string;

  @Column({ nullable: true })
  coverImageUrl: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
