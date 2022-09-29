import express from "express";
import cors from "cors";
import {PrismaClient} from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const prisma = new PrismaClient();
const port = 4000;

const SECRET = process.env.SECRET!

function getToken (id: number) {
  return jwt.sign({ id: id }, SECRET, {
    expiresIn: '355 days'
  })
}

async function getCurrentUser (token: string) {
  const decodedData = jwt.verify(token, SECRET)
  const user = await prisma.user.findUnique({
    // @ts-ignore
    where: { id: decodedData.id },
    include: { properties: true }
  })
  return user
}

app.get(`/property`, async (req, res) => {
    try {
        const properties = await prisma.property.findMany({
            where: {
                available: true,
            },
            include: {images: true, users:true},
        });

        res.send(properties);
    } catch (error) {
        //@ts-ignore
        res.status(400).send({error: error.message});
    }
});

app.get(`/property/type/:type`, async (req, res) => {
    try {
        const properties = await prisma.property.findMany({
            include: {images: true},
            where: {
                //@ts-ignore
                type: req.params.type,
            },
        });

        res.send(properties);
    } catch (error) {
        //@ts-ignore
        res.status(400).send({error: error.message});
    }
});

app.get("/property/:id", async (req, res) => {
    const property = await prisma.property.findUnique({
        where: {id: Number(req.params.id)},
        include: {images: true, reviews: true, users:true},
    });

    if (property) {
        res.send(property);
    } else {
        res.status(404).send({error: "Property not found"});
    }
});


app.get(`/users`, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { properties: true },
    });
    res.send(users);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get("/user/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id)},
    include: { properties: true },
  });

  if (user) {
    res.send(user);
  } else {
    res.status(404).send({ error: "User not found" });
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

app.post("/property/:id/reserve", async (req, res) => {
    //@ts-ignore
    const user = await getCurrentUser(req.headers.authorization)

    await prisma.property.update({
        where: {id: Number(req.params.id)},
        data: {
            available: false,
            users: {
                connectOrCreate: {
                    //@ts-ignore
                    where: {userId: user.id},
                    //@ts-ignore
                    create: {userId: user.id}
                }
            }
        },
    })

    res.send()
})

app.post('/sign-up', async (req, res) => {
    try {
        const match = await prisma.user.findUnique({
            //@ts-ignore
            where: { email: req.body.email }
        })

        if (match) {
            res.status(400).send({ error: 'This account already exists.' })
        } else {
            const user = await prisma.user.create({
                //@ts-ignore
                data: {
                    email: req.body.email,
                    password: bcrypt.hashSync(req.body.password)
                },
                include: { properties: true }
            })

            res.send({ user: user, token: getToken(user.id) })
        }
    } catch (error) {
        // @ts-ignore
        res.status(400).send({ error: error.message })
    }
})

app.post('/sign-in', async (req, res) => {
    const user = await prisma.user.findUnique({
        //@ts-ignore
        where: { email: req.body.email },
    })
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
        res.send({ user: user, token: getToken(user.id) })
    } else {
        res.status(400).send({ error: 'Invalid email/password combination.' })
    }
})


app.listen(port, () => {
    console.log(`App running: http://localhost:${port}`);
})

