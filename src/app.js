import express from "express"
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"
import joi, { required } from "joi"
import dayjs from "dayjs"
import bcrypt from 'bcrypt'



const app = express()

app.use(cors())
app.use(express.json())
dotenv.config()

//conexao
const mongoClient = new MongoClient(process.env.DATABASE_URL)
try {
    await mongoClient.connect()
    console.log('Conectado DBmongo')
} catch (err) {
    console.log(err.message)
}
const db = mongoClient.db()


//Schenas
const usuarioSchema = joi.object({
    nome:joi.string().required(),
    email:joi.string().email().required(),
    senha:joi.string().required().min(6)
})



//cadastrar
app.post('/sing-up' ,async (req,res)=> {

    //desestruturar
    const {nome,email,senha}=req.body

    //validar com schemas
    const validation = usuarioSchema.validate(req.body, {abortEarly: false })
    if(validation.error){
        const errors = validation.error.details.map((detail)=>detail.message);
        return res.status(422).send(errors)
    }

   

    try {
       //verificar se o usuario já foi cadastrado
       const usuario = await db.collection('usuarios').findOne({email})
       if(usuario) return res.status(409).send('E-mail Já Cadastrado') 

       //criptografar senha
       const hash = bcrypt.hashSync(senha, 10)

       //inserir no banco de dados
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
