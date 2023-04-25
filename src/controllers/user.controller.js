import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import joi from "joi"
import dayjs from "dayjs"
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import { db } from "../database/database.connection.js"
import { transacaoSchema } from "../schemas/user.schemas.js"


export async function  postTra(req,res){
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
}




export async function getTra(req,res){
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

}