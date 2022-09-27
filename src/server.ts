import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

const app = express()
app.use(cors())
app.use(express.json())
const prisma = new PrismaClient()
const port = 4000


app.get(`/property`, async (req,res)=>{
    try{
        const properties= await prisma.property.findMany({include:{images:true, users: true, reviews:true}})
res.send(properties)
    }
    catch(error){
        //@ts-ignore
res.status(400).send({error:error.message})
    }

})


app.listen(port, () => {
  console.log(`App running: http://localhost:${port}`)
})

