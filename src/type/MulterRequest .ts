import { Request } from "express";

export interface MulterRequest extends Request {
  file?: Express.Multer.File; // Pour `single()`
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] }; // Pour `array()` ou `fields()`
}
