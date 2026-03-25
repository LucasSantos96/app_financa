import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({ url: './dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10)

  const user = await prisma.user.upsert({
    where: { email: 'teste@email.com' },
    update: {},
    create: {
      email: 'teste@email.com',
      senha: hashedPassword,
      nome: 'Usuário Teste',
      reservas: {
        create: {
          valor: 0,
        }
      }
    },
  })

  console.log('Usuário criado:', user)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
