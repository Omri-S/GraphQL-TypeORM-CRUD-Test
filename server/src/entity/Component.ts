import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Component extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.components)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  index: number;

  @Column()
  type: string;

  @Column()
  text: string;
}
