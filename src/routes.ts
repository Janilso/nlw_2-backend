import express from "express";
import ClassesControllers from "./controllers/ClassesControllers";
import ConnectionsControllers from "./controllers/ConnetionsControllers";

const routes = express.Router();

const classesControllers = new ClassesControllers();
const connectionsControllers = new ConnectionsControllers();

routes.get("/classes", classesControllers.index);
routes.get("/classes/all", classesControllers.all);
routes.post("/classes", classesControllers.create);

routes.get("/connections", connectionsControllers.index);
routes.post("/connections", connectionsControllers.create);

export default routes;
