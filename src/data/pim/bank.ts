// src/data/pim/bank.ts
// Configuración de cuenta bancaria y generación de QR para Transferencias

export interface BankAccountConfig {
  bankName: string;
  accountType: string;
  accountNumber: string;
  holderName: string;
  holderRut: string;
  email: string;
  customInstructions: string;
  active: boolean;
}

export const defaultBankAccount: BankAccountConfig = {
  bankName: 'BancoEstado / Banco de Chile',
  accountType: 'Cuenta Corriente',
  accountNumber: '1234567890',
  holderName: 'FIVE Mascotas SpA',
  holderRut: '77.892.340-K',
  email: 'pagos@fivemascotas.cl',
  customInstructions: 'Por favor incluye el código de tu pedido (ej: FIVE-TRK-XXXX) en el asunto o comentario de la transferencia.',
  active: true,
};

export const BANK_STORAGE_KEY = 'five_bank_account_v1';

/**
 * Genera el string formateado que al escanearse con la cámara del celular muestra/copia los datos
 */
export function formatBankTransferPayload(bank: BankAccountConfig, orderCode = '', amount = 0): string {
  const lines = [
    `=== DATOS DE TRANSFERENCIA FIVE MASCOTAS ===`,
    `Banco: ${bank.bankName}`,
    `Tipo de Cuenta: ${bank.accountType}`,
    `Número de Cuenta: ${bank.accountNumber}`,
    `RUT: ${bank.holderRut}`,
    `Titular: ${bank.holderName}`,
    `Correo: ${bank.email}`,
  ];
  if (amount > 0) {
    lines.push(`Monto a Transferir: $${amount.toLocaleString('es-CL')}`);
  }
  if (orderCode) {
    lines.push(`Asunto / Referencia: ${orderCode}`);
  }
  return lines.join('\n');
}
