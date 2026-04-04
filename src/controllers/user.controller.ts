import { Request, Response } from "express";
import { User } from "../models/user.model";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const users = await User.find();
  res.json(users);
};

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = await User.create(req.body);
  res.status(201).json(user);
};
