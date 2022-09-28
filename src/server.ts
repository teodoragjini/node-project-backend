import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "dotenv";

const app = express();
app.use(cors());
app.use(express.json());
const prisma = new PrismaClient();
const port = 4000;

app.get(`/property`, async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: { images: true },
    });

    res.send(properties);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get(`/property/type/:type`, async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: { images: true },
      where: {
        //@ts-ignore
        type: req.params.type,
      },
    });

    res.send(properties);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get("/property/:id", async (req, res) => {
  const property = await prisma.property.findUnique({
    where: { id: Number(req.params.id) },
    include: { images: true, reviews: true },
  });

  if (property) {
    res.send(property);
  } else {
    res.status(404).send({ error: "Property not found" });
  }
});

app.post('/sign-up', async (req, res) => {
    try{
      const user= await prisma.user.create({data:{email:req.body.email, name:req.body.name,password:bcrypt.hashSync(req.body.password)}})
      res.send(user)
    }catch(error){
      //@ts-ignore
      res.status(400).send({error:error.message})
    }
})
app.post('/sign-in', async (req, res) => {
      //@ts-ignore
const user= await prisma.user.findUnique({where:{email:req.body.email}})
if(user&& bcrypt.compareSync(req.body.password, user.password)){
  res.send(user)
}else{
res.status(400).send({error:"Invalid combination paswword/email"})
}
})



app.listen(port, () => {
  console.log(`App running: http://localhost:${port}`);
});



// app.post('/property/:id/reserve', async (req, res) => {
//     await prisma.
// })

// app.get('/user/property' , async (req, res) => {
//     const user = await prisma.user.
// })
