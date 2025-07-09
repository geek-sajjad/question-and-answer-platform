// @Entity()
// export class Notification {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column('text')
//   message: string;

//   @Column({ default: false })
//   isRead: boolean;

//   @ManyToOne(() => User, (user) => user.notifications)
//   user: User;

//   @Column({ nullable: true })
//   questionId: string;

//   @Column({ nullable: true })
//   answerId: string;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;
// }
