import { Request, Response } from "express";
import db from "../database/connection";
import convertHourToMinutes from "../utils/convert";
import {
  USERS_TABLE,
  CLASSES_TABLE,
  CLASSES_SCHEDULE_TABLE,
} from "../database/constantsDatabase";

interface ScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

export default class ClassesControllers {
  async index(request: Request, response: Response) {
    const filters = request.query;

    if (!filters.week_day || !filters.subject || !filters.time) {
      return response.status(400).json({
        error: "Missing filters to seach classs",
      });
    }

    try {
      const subject = filters.subject as string;
      const time = filters.time as string;
      const week_day = filters.week_day as string;

      const timeInMinutes = convertHourToMinutes(time);
      const classes = await db(CLASSES_TABLE.TABLE_NAME)
        .whereExists(function () {
          this.select(`${CLASSES_SCHEDULE_TABLE.TABLE_NAME}.*`)
            .from(CLASSES_SCHEDULE_TABLE.TABLE_NAME)
            .whereRaw(
              `\`${CLASSES_SCHEDULE_TABLE.TABLE_NAME}\`.\`${CLASSES_SCHEDULE_TABLE.CLASS_ID}\` = \`${CLASSES_TABLE.TABLE_NAME}\`.\`${CLASSES_TABLE.ID}\``
            )
            .whereRaw(
              `\`${CLASSES_SCHEDULE_TABLE.TABLE_NAME}\`.\`${CLASSES_SCHEDULE_TABLE.WEEK_DAY}\` = ??`,
              [Number(week_day)]
            )
            .whereRaw(
              `\`${CLASSES_SCHEDULE_TABLE.TABLE_NAME}\`.\`${CLASSES_SCHEDULE_TABLE.FROM}\` <= ??`,
              [timeInMinutes]
            )
            .whereRaw(
              `\`${CLASSES_SCHEDULE_TABLE.TABLE_NAME}\`.\`${CLASSES_SCHEDULE_TABLE.TO}\` > ??`,
              [timeInMinutes]
            );
        })
        .where(
          `${CLASSES_TABLE.TABLE_NAME}.${CLASSES_TABLE.SUBJECT}`,
          "=",
          subject
        )
        .join(
          USERS_TABLE.TABLE_NAME,
          `${CLASSES_TABLE.TABLE_NAME}.${CLASSES_TABLE.USER_ID}`,
          "=",
          `${USERS_TABLE.TABLE_NAME}.${USERS_TABLE.ID}`
        )
        .select([
          `${CLASSES_TABLE.TABLE_NAME}.*`,
          `${USERS_TABLE.TABLE_NAME}.*`,
        ]);

      return response.status(201).json(classes);
    } catch (error) {
      return response.status(400).json({
        mensage: "Unexpected error while get classes",
        error,
      });
    }
  }

  async all(request: Request, response: Response) {
    try {
      const classes = await db(CLASSES_TABLE.TABLE_NAME)
        // .select("*")
        // .from("classes");
        .select("*")
        .from("class_schedule");

      // .innerJoin("class_schedule", "class_schedule.class_id", "classes.id")
      // .groupBy("classes.user_id");
      // .where("classes.id", "=", "class_schedule.class_id");

      // .leftJoin("classes", "classes.id", "class_schedule.class_id");
      // .select([
      //   `${CLASSES_TABLE.TABLE_NAME}.*`,
      //   `${CLASSES_SCHEDULE_TABLE.TABLE_NAME}.*`,
      // ]);
      // .where(
      //   `${CLASSES_TABLE.TABLE_NAME}.${CLASSES_TABLE.USER_ID}`,
      //   "=",
      //   `${CLASSES_SCHEDULE_TABLE.TABLE_NAME}.${CLASSES_SCHEDULE_TABLE.ID}`
      // );

      return response.status(201).json(classes);
    } catch (error) {
      return response.status(400).json({
        mensage: "Unexpected error while get all classes",
        error,
      });
    }
  }

  async create(request: Request, response: Response) {
    const {
      name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule,
    } = request.body;

    const trx = await db.transaction();

    try {
      const insertedUsersIds = await trx(USERS_TABLE.TABLE_NAME).insert({
        name,
        avatar,
        whatsapp,
        bio,
      });

      const user_id = insertedUsersIds[0];

      const insertedClassesIds = await trx(CLASSES_TABLE.TABLE_NAME).insert({
        user_id,
        subject,
        cost,
      });

      const class_id = insertedClassesIds[0];

      const classShedule = schedule.map((item: ScheduleItem) => {
        return {
          class_id,
          week_day: item.week_day,
          from: convertHourToMinutes(item.from),
          to: convertHourToMinutes(item.to),
        };
      });

      await trx(CLASSES_SCHEDULE_TABLE.TABLE_NAME).insert(classShedule);
      await trx.commit();

      return response.status(201).json({
        mensage: "created",
      });
    } catch (error) {
      trx.rollback();
      return response.status(400).json({
        mensage: "Unexpected error while creating new class",
        error,
      });
    }
  }
}
