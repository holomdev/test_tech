import { MigrationInterface, QueryRunner } from 'typeorm';

export class CommentsTable1690080787995 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "comment" 
      (
        "id" SERIAL NOT NULL, "name" character varying NOT NULL, 
        "email" character varying NOT NULL, 
        "body" text NOT NULL, 
        "postId" integer, 
        CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id")
        )`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_2d6b6b6a6e4e4b3b8e4e4a4b5d9" 
      FOREIGN KEY ("postId") REFERENCES "post"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_2d6b6b6a6e4e4b3b8e4e4a4b5d9"`,
    );
    await queryRunner.query(`DROP TABLE "comment"`);
  }
}
