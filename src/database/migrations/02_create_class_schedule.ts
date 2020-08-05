import Knex from "knex";
import { CLASSES_SCHEDULE_TABLE, CLASSES_TABLE } from "../constantsDatabase";

export async function up(knex: Knex) {
  return knex.schema.createTable(CLASSES_SCHEDULE_TABLE.TABLE_NAME, (table) => {
    table.increments(CLASSES_SCHEDULE_TABLE.ID).primary();
    table.integer(CLASSES_SCHEDULE_TABLE.WEEK_DAY).notNullable();
    table.integer(CLASSES_SCHEDULE_TABLE.TO).notNullable();
    table.integer(CLASSES_SCHEDULE_TABLE.FROM).notNullable();
    table
      .integer(CLASSES_SCHEDULE_TABLE.CLASS_ID)
      .notNullable()
      .references(CLASSES_TABLE.ID)
      .inTable(CLASSES_TABLE.TABLE_NAME)
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable(CLASSES_SCHEDULE_TABLE.TABLE_NAME);
}
