import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import joi from "joi"
import dayjs from "dayjs"
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'

import { db } from "../database/database.connection.js"
import { usuarioSchema } from "../schemas/auth.schemas.js"

export async function singUp (req,res) {

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
}



export async function singIn(req,res) {
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
}

