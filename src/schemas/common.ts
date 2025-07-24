import { Type } from "@fastify/type-provider-typebox";

export const ErrorSchema = Type.Object({
  error: Type.String(),
});

export const UUIDSchema = Type.String({
  format: "uuid",
  description: "The unique ID of the resource",
});
