import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailUsers1752223509891 implements MigrationInterface {
  name = 'AddEmailUsers1752223509891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "email" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "email"
        `);
  }
}
