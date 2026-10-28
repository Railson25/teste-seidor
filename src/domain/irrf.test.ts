import { describe, expect, it } from 'vitest';
import { calculateIrrf } from './irrf';
import { isValidCpf, validateEmployee } from './employee';
import { parseMoney } from './format';

export const validInput = {
  name: 'Pessoa de teste',
  cpf: '52998224725',
  grossSalaryCents: 500_000,
  socialSecurityCents: 50_000,
  dependents: 2,
};

describe('IRRF conforme o enunciado', () => {
  it.each([
    [225919, 0, 0],
    [225920, 0, 0],
    [225921, 750, 0],
    [282664, 750, 4256],
    [282665, 750, 4256],
    [282666, 1500, 4256],
    [375104, 1500, 18122],
    [375105, 1500, 18122],
    [375106, 2250, 18122],
    [466467, 2250, 38678],
    [466468, 2250, 38678],
    [466469, 2750, 38679],
  ])('base %i: alíquota %i e imposto %i', (grossSalaryCents, rateBasisPoints, taxCents) => {
    expect(
      calculateIrrf({ ...validInput, grossSalaryCents, socialSecurityCents: 0, dependents: 0 }),
    ).toMatchObject({ rateBasisPoints, taxCents });
  });
  it('deduz previdência e dependentes antes de escolher a faixa', () => {
    expect(calculateIrrf(validInput)).toMatchObject({
      baseCents: 412082,
      taxCents: 26441,
      dependentDeductionCents: 37918,
    });
  });
  it('limita a base e o imposto a zero', () => {
    expect(
      calculateIrrf({ ...validInput, grossSalaryCents: 100, socialSecurityCents: 0 }),
    ).toMatchObject({ baseCents: 0, taxCents: 0 });
  });
  it('arredonda meio centavo para cima', () => {
    expect(
      calculateIrrf({
        ...validInput,
        grossSalaryCents: 300010,
        socialSecurityCents: 0,
        dependents: 0,
      }).taxCents,
    ).toBe(6858);
  });
  it('rejeita dados inválidos', () => {
    expect(() => calculateIrrf({ ...validInput, grossSalaryCents: NaN })).toThrow();
  });
});

describe('validação e conversão', () => {
  it.each(['11111111111', '52998224724', '', '<script>'])('rejeita CPF %s', (cpf) =>
    expect(isValidCpf(cpf)).toBe(false),
  );
  it('aceita CPF com verificadores válidos', () => expect(isValidCpf(validInput.cpf)).toBe(true));
  it('bloqueia duplicidade e permite editar o próprio registro', () => {
    const existing = [{ ...validInput, id: '1' }];
    expect(validateEmployee(validInput, existing).cpf).toBeDefined();
    expect(validateEmployee(validInput, existing, '1')).toEqual({});
  });
  it('rejeita nome vazio, previdência maior que salário e dependentes fracionados', () => {
    expect(
      validateEmployee({ ...validInput, name: ' ', socialSecurityCents: 600000, dependents: 1.2 }),
    ).toHaveProperty('name');
    expect(validateEmployee({ ...validInput, socialSecurityCents: 600000 })).toHaveProperty(
      'socialSecurityCents',
    );
    expect(validateEmployee({ ...validInput, dependents: -1 })).toHaveProperty('dependents');
  });
  it('converte decimais sem erro de ponto flutuante', () => {
    expect(parseMoney('0,29')).toBe(29);
    expect(parseMoney('1000.5')).toBe(100050);
    expect(parseMoney('1.000,50')).toBeNaN();
    expect(parseMoney('1,234')).toBeNaN();
  });
});
