import express from "express"
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"
import joi from "joi"
import dayjs from "dayjs"
import bcrypt from 'bcrypt'



const app = express()

app.use(cors())
app.use(express.json())
dotenv.config()


const mongoClient = new MongoClient(process.env.DATABASE_URL)
try {
    await mongoClient.connect()
    console.log('Conectado DBmongo')
} catch (err) {
    console.log(err.message)
}
const db = mongoClient.db()


//cadastrar
app.post('/sing-up' ,async (req,res)=> {
    const {nome,email,senha}=req.body

   const hash = bcrypt.hashSync(senha, 10)

    try {
        await db.collection('usuarios').insertOne({nome,email,senha:hash})
        res.sendStatus(201)
        
    } catch (err) {
        res.status(500).send(err.message)
    }
})



//logar
app.post('/sing-in' ,async (req,res)=>{
    const {email,senha} =req.body

    try {
        const usuario = await db.collection('usuarios').findOne({email})

        if(!usuario) return res.status(401).send('Usuario Não Cadastrado')

        const senhaCerta = bcrypt.compareSync(senha, usuario.senha)
        if(!senhaCerta) return res.status(401).send('Senha Incorreta')

        res.sendStatus(200)
    
    } catch (err) {
        res.status(500).send(err.message)
    }
})








const PORT = 5000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
