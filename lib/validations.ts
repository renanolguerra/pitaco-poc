import { z } from "zod";

export const createRoadmapSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100),
});

export const createFeatureSchema = z.object({
  roadmapId: z.string().cuid(),
  titulo: z.string().min(1, "Título é obrigatório").max(200),
  descricao: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  status: z.enum(["PLANEJADO", "EM_ANDAMENTO", "CONCLUIDO"]).default("PLANEJADO"),
  comentario: z.string().optional(),
  ordem: z.number().default(0),
});

export const updateFeatureSchema = createFeatureSchema.partial().extend({
  id: z.string().cuid(),
});

export const createComentarioSchema = z.object({
  featureId: z.string().cuid(),
  texto: z.string().min(1).max(1000),
});

export const updateEmpresaSchema = z.object({
  nome: z.string().min(1).max(100),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, "Apenas letras minúsculas, números e _"),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});
