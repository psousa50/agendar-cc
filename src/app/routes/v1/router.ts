import { Response, Router } from "express"
import { pipe } from "fp-ts/lib/pipeable"
import { bimap, run } from "fp-ts/lib/ReaderTaskEither"
import { isNil } from "ramda"
import { Environment } from "../../../environment"
import { ErrorCodes, ServiceError } from "../../../utils/audit"
import { toDateString, toExistingDateString } from "../../../utils/dates"
import { logDebug } from "../../../utils/debug"
import {
  getCounties,
  getDistricts,
  getIrnPlaces,
  getIrnTableMatch,
  getIrnTables,
  getIrnTableScheduleHtml,
  GetIrnTablesParams,
  getServices,
} from "./domain"
import {
  transformGetCountiesParams,
  transformGetIrnTableMatchParams,
  transformGetIrnTableScheduleParams,
  transformGetIrnTablesParams,
} from "./transformers"

const errorHandler = (res: Response) => (error: ServiceError) => {
  res.sendStatus(error.dependencyError ? (error.errorCode === ErrorCodes.NOT_FOUND ? 404 : 502) : 400)
}

const okHandler = (res: Response) => (responseBody: any) => {
  res.contentType("application/json")
  res.status(200)
  res.json(responseBody)
}

export const router = (env: Environment) =>
  Router()
    .get("/irnServices", async (req, res) => {
      logDebug("GET irnServices=====>\n", req.query)
      await run(
        pipe(
          getServices(),
          bimap(errorHandler(res), okHandler(res)),
        ),
        env,
      )
    })
    .get("/districts", async (req, res) => {
      logDebug("GET districts=====>\n", req.query)
      await run(
        pipe(
          getDistricts(),
          bimap(errorHandler(res), okHandler(res)),
        ),
        env,
      )
    })
    .get("/counties/", async (req, res) => {
      logDebug("GET counties=====>\n", req.query)
      await run(
        pipe(
          getCounties(transformGetCountiesParams(req.query)),
          bimap(errorHandler(res), okHandler(res)),
        ),
        env,
      )
    })
    .get("/irnPlaces", async (req, res) => {
      logDebug("GET irnPlaces=====>\n", req.query)
      await run(
        pipe(
          getIrnPlaces(req.query),
          bimap(errorHandler(res), okHandler(res)),
        ),
        env,
      )
    })
    .get("/irnTables", async (req, res) => {
      logDebug("GET irnTables=====>\n", req.query)
      await run(
        pipe(
          getIrnTables(transformGetIrnTablesParams(req.query)),
          bimap(errorHandler(res), okHandler(res)),
        ),
        env,
      )
    })
    .get("/irnTableMatch", async (req, res) => {
      logDebug("GET irnTableMatch=====>\n", req.query)
      await run(
        pipe(
          getIrnTableMatch(transformGetIrnTableMatchParams(req.query)),
          bimap(errorHandler(res), okHandler(res)),
        ),
        env,
      )
    })
    .get("/irnTableScheduleHtml", async (req, res) => {
      logDebug("GET irnTableScheduleHtml=====>\n", req.query)
      await run(
        pipe(
          getIrnTableScheduleHtml(transformGetIrnTableScheduleParams(req.query)),
          bimap(errorHandler(res), okHandler(res)),
        ),
        env,
      )
    })
