import express from "express"
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"
import joi from "joi"
import dayjs from "dayjs"
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'



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
    senha:joi.string().min(3).required()
})

const transacaoSchema = joi.object({
    valor:joi.number().required(),
    descricao:joi.string().required(),
    tipo:joi.string().valid("entrada","saida").required()
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
        //achar usuario por email
        const usuario = await db.collection('usuarios').findOne({email})

       //validar email usuario
        if(!usuario) return res.status(404).send('Usuario Não Cadastrado')

       //validar senha usuario
        const senhaCerta = bcrypt.compareSync(senha, usuario.senha)
        if(!senhaCerta) return res.status(401).send('Senha Incorreta')

        //gerar token
        const token = uuid()

        //guardar token em sessoes
        await db.collection('sessoes').insertOne({token,idUsuario: usuario._id})

        //retornar o token
        res.status(200).send({token,usuario:usuario.nome})
    
    } catch (err) {
        res.status(500).send(err.message)
    }
})



//entrada e saida
app.post('/transacao' ,async (req,res)=>{
    //desestruturar body
    const {valor,descricao,tipo} =req.body
    //desestruturar token
    const {authorization} = req.headers

    const dia = dayjs().format("DD/MM")
    //retirar bearer do token
    // ? = optional chaining
    const token =authorization?.replace('Bearer ','')


    //verificar se o token é valido
    if(!token) return res.status(401).send('Desculpe, mas você não tem autorização')

    

    //validar Schema
    const validation = transacaoSchema.validate(req.body, {abortEarly: false })
    if(validation.error){
        const errors = validation.error.details.map((detail)=>detail.message);
        return res.status(422).send(errors)
    }



    try {
          
        const sessao =  await db.collection('sessoes').findOne({ token })

        if(!sessao) return res.sendStatus(401)

        await db.collection('transacoes').insertOne({...req.body,idUsuario:sessao.idUsuario,dia})
        res.sendStatus(201)

    } catch (err) {
        res.status(500).send(err.message)
    }
})



//get de transacoes
app.get('/transacao' ,async (req,res)=>{
    //desestruturar token
    const {authorization} = req.headers

    //retirar bearer do token
    // ? = optional chaining
    const token =authorization?.replace('Bearer ','')


    //verificar se o token é valido
    if(!token) return res.status(401).send('Desculpe, mas você não tem autorização')

    try {
        //valida existencia do token
        const sessao =  await db.collection('sessoes').findOne({token})
        if(!sessao) return res.sendStatus(401)

        //requisição get
        const tran = await db.collection('transacoes').find({idUsuario:sessao.idUsuario}).toArray()
        res.status(200).send(tran.reverse())

    } catch (err) {
        res.status(500).send(err.message)
        
    }

})



const PORT = 5000
app.listen(process.env.PORT, () => console.log(`Servidor rodando na porta ${process.env.PORT}`))
