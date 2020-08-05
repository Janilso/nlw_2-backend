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

    const subject = filters.subject as string;
    const time = filters.time as string;
    const week_day = filters.week_day as string;

    const timeInMinutes = convertHourToMinutes(time);
    const classes = await db("classes")
      .whereExists(function () {
        this.select("class_schedule.*")
          .from("class_schedule")
          .whereRaw("`class_schedule`.`class_id` = `classes`.`id` ")
          .whereRaw("`class_schedule`.`week_day` =  ?? ", [Number(week_day)])
          .whereRaw("`class_schedule`.`from` <=  ?? ", [timeInMinutes])
          .whereRaw("`class_schedule`.`to` >  ?? ", [timeInMinutes]);
      })
      .where("classes.subject", "=", subject)
      .join("users", "classes.user_id", "=", "users.id")
      .select(["classes.*", "users.*"]);

    return response.json(classes);
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
