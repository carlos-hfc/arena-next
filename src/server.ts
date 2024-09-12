import fastifyCors from "@fastify/cors"
import fastifyJwt from "@fastify/jwt"
import fastify from "fastify"
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod"

import { env } from "./env"
import { errroHandler } from "./error-handler"
import { log } from "./http/middlewares/log"
import { authenticate } from "./http/routes/auth/authenticate"
import { createBoost } from "./http/routes/boost/create-boost"
import { createCard } from "./http/routes/card/create-card"
import { createGoal } from "./http/routes/goals/create-goal"
import { createSession } from "./http/routes/session/create-session"
import { getSession } from "./http/routes/session/get-session"
import { getSessions } from "./http/routes/session/get-sessions"
import { launchSession } from "./http/routes/session/launch-session"
import { updateSession } from "./http/routes/session/update-session"
import { createTeam } from "./http/routes/team/create-team"
import { getTeam } from "./http/routes/team/get-team"
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

app.register(authenticate)

app.register(getSessions)
app.register(getSession)
app.register(createSession)
app.register(updateSession)
app.register(launchSession)

app.register(createGoal)

app.register(createBoost)

app.register(createCard)

app.register(getTeam)
app.register(createTeam)
app.register(registerStudent)

app.listen({ port: env.PORT }).then(() => console.log("HTTP Server running"))
