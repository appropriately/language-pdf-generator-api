import { Type } from "@fastify/type-provider-typebox";

const HeaderComponentSchema = Type.Object({
  type: Type.Literal("header"),
  text: Type.String(),
  align: Type.Optional(
    Type.Union([
      Type.Literal("left"),
      Type.Literal("center"),
      Type.Literal("right"),
    ])
  ),
  level: Type.Number({
    description: "The level of the header",
    minimum: 1,
    maximum: 6,
  }),
});

const TextComponentSchema = Type.Object({
  type: Type.Literal("text"),
  text: Type.String(),
});

const TableComponentSchema = Type.Object({
  type: Type.Literal("table"),
  headers: Type.Optional(
    Type.Array(
      Type.String({
        description: "The header of the table",
      })
    )
  ),
  rows: Type.Array(Type.Array(Type.String())),
});

const ComponentSchema = Type.Union([
  HeaderComponentSchema,
  TextComponentSchema,
  TableComponentSchema,
]);

export { ComponentSchema };
