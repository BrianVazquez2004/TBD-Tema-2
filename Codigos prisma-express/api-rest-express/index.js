   require("dotenv").config();
   const express = require("express");
   const { PrismaClient } = require("@prisma/client");

   const app = express();
   const prisma = new PrismaClient();

   app.use(express.json());

   app.get("/users", async (req, res) => {
     try {
       const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
       res.json(users);
     } catch (error) {
       res.status(500).json({ message: "Error al consultar los usuarios" });
     }
   });

   app.post("/users", async (req, res) => {
     try {
       const { name, email } = req.body;
       if (!name || !email) {
         return res.status(400).json({ message: "name y email son obligatorios" });
       }
       const existe = await prisma.user.findUnique({ where: { email } });
       if (existe) {
         return res.status(409).json({ message: "El email ya existe" });
       }
       const user = await prisma.user.create({ data: { name, email } });
       res.status(201).json(user);
     } catch (error) {
       res.status(500).json({ message: "Error al crear el usuario" });
     }
   });

   app.put("/users/:id", async (req, res) => {
     try {
       const id = Number(req.params.id);
       const { name, email } = req.body;
       const user = await prisma.user.update({ where: { id }, data: { name, email } });
       res.json(user);
     } catch (error) {
       if (error.code === "P2025") {
         return res.status(404).json({ message: "Usuario no encontrado" });
       }
       if (error.code === "P2002") {
         return res.status(409).json({ message: "El email ya existe" });
       }
       res.status(500).json({ message: "Error al actualizar el usuario" });
     }
   });

   app.delete("/users/:id", async (req, res) => {
     try {
       const id = Number(req.params.id);
       await prisma.user.delete({ where: { id } });
       res.json({ message: "Usuario eliminado" });
     } catch (error) {
       if (error.code === "P2025") {
         return res.status(404).json({ message: "Usuario no encontrado" });
       }
       res.status(500).json({ message: "Error al eliminar el usuario" });
     }
   });

   app.listen(3000, () => {
     console.log("API corriendo en http://localhost:3000");
   });