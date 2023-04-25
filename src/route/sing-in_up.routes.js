import { Router } from "express"
import { singIn, singUp } from "./controllers/auth.controller.js"

const usuarioRota = Router()

//cadastrar
usuarioRota.post('/sing-up' ,singUp)


//logar
usuarioRota.post('/sing-in' ,singIn)


export default usuarioRota