-- CreateTable
CREATE TABLE "Contacto" (
    "id" SERIAL NOT NULL,
    "clienteId" TEXT NOT NULL,
    "motoristaId" INTEGER NOT NULL,
    "pedidoId" INTEGER,
    "canal" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contacto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contacto_motoristaId_idx" ON "Contacto"("motoristaId");

-- CreateIndex
CREATE UNIQUE INDEX "Contacto_clienteId_motoristaId_key" ON "Contacto"("clienteId", "motoristaId");

-- AddForeignKey
ALTER TABLE "Contacto" ADD CONSTRAINT "Contacto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacto" ADD CONSTRAINT "Contacto_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "Motorista"("id") ON DELETE CASCADE ON UPDATE CASCADE;