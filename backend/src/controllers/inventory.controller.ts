import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { parseIdParam } from "../middleware/validate";

export async function list(_req: Request, res: Response) {
  const items = await prisma.inventoryItem.findMany({
    orderBy: [{ categoria: "asc" }, { nombre: "asc" }],
  });
  res.json(items);
}

export async function getById(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) throw ApiError.notFound("Producto del inventario no encontrado");
  res.json(item);
}

export async function create(req: Request, res: Response) {
  const item = await prisma.inventoryItem.create({ data: req.body });
  res.status(201).json(item);
}

export async function update(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const item = await prisma.inventoryItem.update({ where: { id }, data: req.body });
  res.json(item);
}

export async function remove(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  await prisma.inventoryItem.delete({ where: { id } });
  res.status(204).send();
}
