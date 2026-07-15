-- AlterTable
ALTER TABLE `tipos_movimiento` ADD COLUMN `naturaleza` VARCHAR(10) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `ventas` ADD COLUMN `tipoMovimientoId` INTEGER NOT NULL DEFAULT 2;
