import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueToVotes1752229201226 implements MigrationInterface {
  name = 'AddUniqueToVotes1752229201226';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE INDEX "IDX_f5de237a438d298031d11a57c3" ON "vote" ("userId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_eaea7be3f5e66609590e40350a" ON "vote" ("answerId")
        `);
    await queryRunner.query(`
            ALTER TABLE "vote"
            ADD CONSTRAINT "UQ_a1700b4b3ec0ee820611b314fcf" UNIQUE ("userId", "answerId")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "vote" DROP CONSTRAINT "UQ_a1700b4b3ec0ee820611b314fcf"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_eaea7be3f5e66609590e40350a"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_f5de237a438d298031d11a57c3"
        `);
  }
}
