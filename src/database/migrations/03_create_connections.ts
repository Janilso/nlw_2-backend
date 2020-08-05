import Knex from "knex";
import { CONNECTIONS_TABLE, USERS_TABLE } from "../constantsDatabase";

export async function up(knex: Knex) {
  return knex.schema.createTable(CONNECTIONS_TABLE.TABLE_NAME, (table) => {
    table.increments(CONNECTIONS_TABLE.ID).primary();

    table
      .integer(CONNECTIONS_TABLE.USER_ID)
      .notNullable()
      .references(USERS_TABLE.ID)
      .inTable(USERS_TABLE.TABLE_NAME)
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    table
      .timestamp(CONNECTIONS_TABLE.CREATED_AT)
      .defaultTo("CURRENT_TIMESTAMP")
      .notNullable();
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable(CONNECTIONS_TABLE.TABLE_NAME);
}
