import { google } from "googleapis"
import sql from "mssql"

import key from "./auth.json"
import config from "./config.json"

const SCOPES = "https://www.googleapis.com/auth/analytics.readonly"

const DATE_RANGE = {
  start: "7-21-2019",
  end: "7-23-2019"
}

const jwt = new google.auth.JWT(key.client_id, null, key.private_key, SCOPES)

process.env.GOOGLE_APPLICATION_CREDENTIALS = "./auth.json"

const get = async (start, end) => {
  await jwt.authorize()
  const result = await google.analytics("v3").data.ga.get({
    auth: jwt,
    ids: "ga:2712436",
    "start-date": start || "30daysAgo",
    "end-date": end || "today",
    metrics: "ga:sessions",
    dimensions: "ga:shoppingStage"
  })

  if (result.status === 200) return [...result.data.rows]
}

const getRanges = () => {
  const dateStart = new Date(DATE_RANGE.start)
  const dateEnd = new Date(DATE_RANGE.end)
  const BY_DAY = 1000 * 60 * 60 * 24
  const days = (dateEnd - dateStart) / BY_DAY

  const ranges = []

  let i = 0
  while (i < days) {
    const startDate = new Date(dateStart).addDays(i)
    const endDate = new Date(dateStart).addDays(i + 1)

    const startDaysAgo = Math.floor((new Date() - startDate) / BY_DAY)
    const endDaysAgo = Math.floor((new Date() - endDate) / BY_DAY)

    ranges.push({
      start: `${startDaysAgo}daysAgo`,
      end: `${endDaysAgo}daysAgo`,
      startDate,
      endDate
    })
    i++
  }

  return ranges
}

getRanges().map(async x => {
  const result = await get(x.start, x.end)
  const test = [
    ...result.map(y => {
      return {
        start: x.startDate,
        end: x.endDate,
        column: y[0],
        value: y[1]
      }
    })
  ]

  const test2 = [
    ...test.filter(z => {
      return z.column == "ADD_TO_CART"
    })
  ]
  console.log(test2)
})
