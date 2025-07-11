import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRelationship1752224670971 implements MigrationInterface {
  name = 'AddUserRelationship1752224670971';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "question"
            ADD "userId" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "answer"
            ADD "userId" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "vote"
            ADD "userId" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "question"
            ADD CONSTRAINT "FK_80f29cc01d0bd1644e389cc13be" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "answer"
            ADD CONSTRAINT "FK_5a26907efcd78a856c8af5829e6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "vote"
            ADD CONSTRAINT "FK_f5de237a438d298031d11a57c3b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "vote" DROP CONSTRAINT "FK_f5de237a438d298031d11a57c3b"
        `);
    await queryRunner.query(`
            ALTER TABLE "answer" DROP CONSTRAINT "FK_5a26907efcd78a856c8af5829e6"
        `);
    await queryRunner.query(`
            ALTER TABLE "question" DROP CONSTRAINT "FK_80f29cc01d0bd1644e389cc13be"
        `);
    await queryRunner.query(`
            ALTER TABLE "vote" DROP COLUMN "userId"
        `);
    await queryRunner.query(`
            ALTER TABLE "answer" DROP COLUMN "userId"
        `);
    await queryRunner.query(`
            ALTER TABLE "question" DROP COLUMN "userId"
        `);
  }
}
