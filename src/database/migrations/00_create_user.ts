import Knex from "knex";
import { USERS_TABLE } from "../constantsDatabase";

export async function up(knex: Knex) {
  return knex.schema.createTable(USERS_TABLE.TABLE_NAME, (table) => {
    table.increments(USERS_TABLE.ID).primary();
    table.string(USERS_TABLE.NAME).notNullable();
    table.string(USERS_TABLE.AVATAR).notNullable();
    table.string(USERS_TABLE.WHATSAPP).notNullable();
    table.string(USERS_TABLE.BIO).notNullable();
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable(USERS_TABLE.TABLE_NAME);
}
