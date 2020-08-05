import Knex from "knex";
import { CLASSES_TABLE, USERS_TABLE } from "../constantsDatabase";

export async function up(knex: Knex) {
  return knex.schema.createTable(CLASSES_TABLE.TABLE_NAME, (table) => {
    table.increments(CLASSES_TABLE.ID).primary();
    table.string(CLASSES_TABLE.SUBJECT).notNullable();
    table.string(CLASSES_TABLE.COST).notNullable();
    table
      .integer(CLASSES_TABLE.USER_ID)
      .notNullable()
      .references(USERS_TABLE.ID)
      .inTable(USERS_TABLE.TABLE_NAME)
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable(CLASSES_TABLE.TABLE_NAME);
}
