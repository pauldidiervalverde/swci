-- AddForeignKey
ALTER TABLE `ingresos` ADD CONSTRAINT `ingresos_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
