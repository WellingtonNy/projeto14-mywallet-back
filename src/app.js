import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import joi from "joi"
import dayjs from "dayjs"
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import { singIn, singUp } from "./controllers/auth.controller.js"
import { getTra, postTra } from "./controllers/user.controller.js"
import usuarioRota from "./route/sing-in_up.routes.js"
import transacaoRota from "./route/transacao.routes.js"
import router from "./route/index.routes.js"


const app = express()

app.use(cors())
app.use(express.json())
app.use(router)
 

//conexao



const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
