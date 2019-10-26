import { google } from "googleapis"
import key from "./config.json"

const scopes = "https://www.googleapis.com/auth/analytics.readonly"
const jwt = new google.auth.JWT(key.client_email, null, key.private_key, scopes)

process.env.GOOGLE_APPLICATION_CREDENTIALS = "./config.json"

const getData = async () => {
  const response = await jwt.authorize()
  const result = await google.analytics("v3").data.ga.get({
    auth: jwt
  })
  console.log(response)
}

getData()
