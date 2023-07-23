import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersTable1690069763031 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" 
      (
        "id" SERIAL NOT NULL, 
        "name" character varying NOT NULL, 
        "username" character varying NOT NULL, 
        "email" character varying NOT NULL, 
        "password" character varying NOT NULL, 
        CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("username"), 
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), 
        CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
