import { resolve } from "node:path"

import fastifyCors from "@fastify/cors"
import fastifyJwt from "@fastify/jwt"
import fastifyMultipart from "@fastify/multipart"
import fastifyStatic from "@fastify/static"
import fastifyWebsocket from "@fastify/websocket"
import fastify from "fastify"
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod"

import { env } from "./env"
import { errroHandler } from "./error-handler"
import { log } from "./http/middlewares/log"
import { createBoost } from "./http/routes/boost/create-boost"
import { createCard } from "./http/routes/card/create-card"
import { createGoal } from "./http/routes/goals/create-goal"
import { sendGoal } from "./http/routes/goals/send-goal"
import { getPanel } from "./http/routes/panel/get-panel"
import { createSession } from "./http/routes/session/create-session"
import { getReleasedSessions } from "./http/routes/session/get-released-sessions"
import { getSession } from "./http/routes/session/get-session"
import { getSessions } from "./http/routes/session/get-sessions"
import { releaseSession } from "./http/routes/session/release-session"
import { updateSession } from "./http/routes/session/update-session"
import { getTeam } from "./http/routes/team/get-team"
import { listTeams } from "./http/routes/team/list-teams"
import { registerStudent } from "./http/routes/team/register-student"

const app = fastify()

app.register(log)

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errroHandler)

app.register(fastifyCors)
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})
app.register(fastifyWebsocket)
app.register(fastifyMultipart)
app.register(fastifyStatic, {
  root: resolve(__dirname, "..", "uploads"),
  prefix: "/uploads",
})

app.register(getSessions)
app.register(getReleasedSessions)
app.register(getSession)
app.register(createSession)
app.register(updateSession)
app.register(releaseSession)

app.register(createGoal)
app.register(sendGoal)

app.register(createBoost)

app.register(createCard)

app.register(listTeams)
app.register(getTeam)
app.register(registerStudent)

app.register(getPanel)
// app.register(createPanel)

app.listen({ port: env.PORT }).then(() => console.log("HTTP Server running"))
