import { MigrationInterface, QueryRunner } from 'typeorm';

export class PostsTable1690075468424 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "post" 
        (
            "id" SERIAL NOT NULL, 
            "title" character varying NOT NULL, 
            "body" text NOT NULL, 
            "userId" integer, 
            CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id")
        )`,
    );
    await queryRunner.query(
      `ALTER TABLE "post" 
      ADD CONSTRAINT "FK_3d5b8b8c0a8e4b3b8e4e4a4b5d9" FOREIGN KEY ("userId") REFERENCES "user"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post" DROP CONSTRAINT "FK_3d5b8b8c0a8e4b3b8e4e4a4b5d9"`,
    );
    await queryRunner.query(`DROP TABLE "post"`);
  }
}
