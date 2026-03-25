import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

export const dynamic = 'force-dynamic'

export async function GET() {
  const swaggerDocument = {
    openapi: "3.0.0",
    info: {
      title: "App Finanças API",
      version: "1.0.0",
      description: "API para gestão financeira pessoal",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desenvolvimento",
      },
    ],
    paths: {
      "/api/auth/callback/credentials": {
        post: {
          summary: "Login de usuário",
          tags: ["Autenticação"],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Login bem-sucedido",
            },
            "401": {
              description: "Credenciais inválidas",
            },
          },
        },
      },
      "/api/contas": {
        get: {
          summary: "Listar contas",
          tags: ["Contas"],
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Lista de contas",
            },
          },
        },
        post: {
          summary: "Criar conta",
          tags: ["Contas"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    nome: { type: "string" },
                    valor: { type: "number" },
                    dataVencimento: { type: "number" },
                    mes: { type: "number" },
                    ano: { type: "number" },
                    tipo: { type: "string" },
                    fixa: { type: "boolean" },
                    parcelada: { type: "boolean" },
                    parcelaAtual: { type: "number" },
                    totalParcelas: { type: "number" },
                    observacoes: { type: "string" },
                  },
                  required: ["nome", "valor", "dataVencimento", "mes", "ano"],
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Conta criada",
            },
          },
        },
      },
      "/api/contas/{id}": {
        patch: {
          summary: "Atualizar conta",
          tags: ["Contas"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", enum: ["PENDENTE", "PAGA", "ATRASADA"] },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Conta atualizada",
            },
          },
        },
        delete: {
          summary: "Excluir conta",
          tags: ["Contas"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Conta excluída",
            },
          },
        },
      },
      "/api/movimentacoes/entrada": {
        post: {
          summary: "Criar entrada",
          tags: ["Movimentações"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    descricao: { type: "string" },
                    valor: { type: "number" },
                    categoria: { type: "string" },
                    data: { type: "string", format: "date" },
                  },
                  required: ["descricao", "valor", "categoria"],
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Entrada criada",
            },
          },
        },
      },
      "/api/movimentacoes/saida": {
        post: {
          summary: "Criar saída",
          tags: ["Movimentações"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    descricao: { type: "string" },
                    valor: { type: "number" },
                    categoria: { type: "string" },
                    data: { type: "string", format: "date" },
                  },
                  required: ["descricao", "valor", "categoria"],
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Saída criada",
            },
          },
        },
      },
      "/api/movimentacoes/{tipo}/{id}": {
        delete: {
          summary: "Excluir movimentação",
          tags: ["Movimentações"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "tipo",
              in: "path",
              required: true,
              schema: { type: "string", enum: ["entrada", "saida"] },
            },
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Movimentação excluída",
            },
          },
        },
      },
      "/api/reserva": {
        post: {
          summary: "Depositar ou sacar da reserva",
          tags: ["Reserva de Emergência"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tipo: { type: "string", enum: ["DEPOSITO", "SAQUE"] },
                    valor: { type: "number" },
                    reservaId: { type: "string" },
                    userId: { type: "string" },
                  },
                  required: ["tipo", "valor", "userId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Transação processada",
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  }

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <title>App Finanças API - Swagger</title>
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
      <style>
        body { margin: 0; padding: 0; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            spec: ${JSON.stringify(swaggerDocument)},
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIBundle.SwaggerUIStandalonePreset
            ],
            layout: "StandaloneLayout"
          });
        };
      </script>
    </body>
    </html>
  `

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  })
}
