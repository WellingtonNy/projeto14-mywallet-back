import { Router } from "express"
import { getTra, postTra } from "./controllers/user.controller.js"

const transacaoRota = Router()
//entrada e saida
transacaoRota.post('/transacao' ,postTra)


//get de transacoes
transacaoRota.get('/transacao' ,getTra)


export default transacaoRota