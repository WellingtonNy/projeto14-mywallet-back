import { Router } from "express";
import usuarioRota from "./sing-in_up.routes.js";
import transacaoRota from "./transacao.routes.js";

const router = Router()
router.use(usuarioRota)
router.use(transacaoRota)

export default router