import express from "express"
import cors from "cors"
import router from "./route/index.routes.js"


const app = express()

app.use(cors())
app.use(express.json())
app.use(router)
 

//conexao



const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
