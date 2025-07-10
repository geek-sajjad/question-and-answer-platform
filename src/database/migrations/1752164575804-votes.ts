import { MigrationInterface, QueryRunner } from 'typeorm';

export class Votes1752164575804 implements MigrationInterface {
  name = 'Votes1752164575804';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."vote_votetype_enum" AS ENUM('UPVOTE', 'DOWNVOTE')
        `);
    await queryRunner.query(`
            CREATE TABLE "vote" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "voteType" "public"."vote_votetype_enum" NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "answerId" uuid,
                CONSTRAINT "PK_2d5932d46afe39c8176f9d4be72" PRIMARY KEY ("id")
            )
        `);
    // await queryRunner.query(`
    //         CREATE TABLE "users" (
    //             "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    //             "name" character varying NOT NULL,
    //             "createAt" TIMESTAMP NOT NULL DEFAULT now(),
    //             CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
    //         )
    //     `);
    await queryRunner.query(`
            ALTER TABLE "vote"
            ADD CONSTRAINT "FK_eaea7be3f5e66609590e40350a7" FOREIGN KEY ("answerId") REFERENCES "answer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "vote" DROP CONSTRAINT "FK_eaea7be3f5e66609590e40350a7"
        `);
    // await queryRunner.query(`
    //         DROP TABLE "users"
    //     `);
    await queryRunner.query(`
            DROP TABLE "vote"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."vote_votetype_enum"
        `);
  }
}
