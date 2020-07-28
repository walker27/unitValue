
class UnitValue {
  public value: number | null
  public unit?: string | null
  constructor(
    public originValue: number | null,
    public originUnit?: string | null,
    public valType?: ValueType,
    public dec?: number,
  ) {
    if (originValue === null) {
      this.value = this.originValue;
      this.unit = this.originUnit;
      return;
    }
    if (!originUnit || !valType) {
      this.value = +(originValue.toFixed(resolveDec(dec)));
      this.unit = originUnit;
      return;
    }

    const res = valType.convert(this.originValue, this.originUnit, dec);
    this.value = res.value;
    this.unit = res.unit;
  }
  // toString() {
  //   return `${this.originValue || ''} ${this.originUnit || ''}`;
  // }
  to(unitName: string) {
    const vT = this.valType;
    if (!vT) return { value: this.value, unit: this.unit };
    return vT.convert(this.originValue, this.originUnit, this.dec, unitName);
  }
}

interface Unit {
  /** 单位名称 */
  name: string
  /** 阈值 */
  threshold: number
  /** 触发阈值 */
  triggerThreshold: number
  /** 精度 */
  dec?: number
}

/**
 * 生成单位
 * @param name 单位名称 
 * @param threshold 阈值
 * @param triggerThreshold 触发阈值
 */
export function unit(name: Unit['name'], threshold = 0, dec?: Unit['dec'], triggerThreshold = threshold): Unit {
  return { name, threshold, triggerThreshold, dec };
}

export class ValueType {
  private unitMap: { [unit: string]: Unit } = {}
  constructor(
    public unitList: Unit[],
    public name?: string
  ) {
    // maybe need a sort
    unitList.forEach((unit) => {
      this.unitMap[unit.name] = unit;
    });
  }
  convert(value: number, unitName: string, dec?: number, targetUnitName?: string) {
    const unitList = this.unitList;
    const bess = value < 0;··
    const fixedValue = Math.abs(value);
    // todo: if unit is undefined
    const unit = this.unitMap[unitName];

    const baseVal = fixedValue * (unit.threshold || 1);

    let targetUnit: Unit;
    if (!targetUnitName) {
      for (let index = unitList.length - 1; index > -1; index--) {
        const iUnit = unitList[index];
        if (baseVal >= iUnit.triggerThreshold) {
          targetUnit = iUnit;
          break;
          // return { value: `${bess}${fixNumber(baseValue, dec, Math.max(threshold, 1))}`, unit: iUnit, threshold: Math.max(threshold, 1) };
        }
      }
    } else {
      targetUnit = this.unitMap[targetUnitName];
    }
    // todo: if targetUnit is undefined
    const finalDec = resolveDec(dec, targetUnit.dec);
    return {
      value: (bess ? -1 : 1) * (+(baseVal / (targetUnit.threshold || 1)).toFixed(finalDec)),
      unit: targetUnit.name,
      threshold: targetUnit.threshold,
      dec: finalDec,
    }
  }
}

class ValueTypeHub {
  public unitMap: { [unit: string]: ValueType } = {}
  public namedValueTypeMap: { [name: string]: ValueType } = {}
  add(v: ValueType): void {
    const ctx = this;
    v.unitList.forEach(u => {
      if (ctx.unitMap[u.name]) return;
      ctx.unitMap[u.name] = v;
    });
    if (v.name && !ctx.namedValueTypeMap[v.name]) {
      ctx.namedValueTypeMap[v.name] = v;
    }
  }
  match(unit: string): null | ValueType {
    const ctx = this;
    const v = ctx.unitMap[unit];
    return v || null;
  }
  use(name: string): null | ValueType {
    const ctx = this;
    const v = ctx.namedValueTypeMap[name];
    return v || null;
  }
}

/**
 * usage:
 * 
 * + dec采用顺序：func入参 > unit属性 > UnitValue内置精度(6位)
 * 
 * func
 *  .registerValueType([
 *    unit(unitName: 'kW', threshold? = 0, triggerThreshold? = threshold),
 *    unit('MW', 1000, 10000),
 *    unit('GW', 1000 * 1000),
 *  ])
 *  .registerValueType([
 *    unit('元'),
 *    unit('万元', 10000, 100000),
 *  ], valueTypeName: 'money');
 * func(value, unit?, dec? = 2)
 */

function main(value: unknown, unit?: string, dec?: number, useValueType?: string | ValueType): UnitValue {
  // 1. value: unknown  => number | null
  const fixedValue = constraintValue(value);
  if (!unit) return new UnitValue(fixedValue);
  const hub = main._valueTypeHub;
  const vT: null | ValueType = (() => {
    if (useValueType) {
      return useValueType instanceof ValueType ? useValueType : hub.use(useValueType);
    }
    return hub.match(unit);
  })();
  if (!vT) return new UnitValue(fixedValue, unit);

  const uv = new UnitValue(value as number, unit, vT, dec);

  return uv;
}


main.registerValueType = (list: Unit[] = [], name?: string) => {
  // 添加到valueType队列中
  const vType = new ValueType(list, name);
  main._valueTypeHub.add(vType);
  return main;
}
main._valueTypeHub = new ValueTypeHub();


export default main;


export function constraintValue(v: unknown): number | null {
  const typeV = typeof v;
  // NaN or null or undefined
  if (v !== v || v === null || v === undefined) return null;
  // is number or is null
  if (typeV === 'number') return v as number;

  if (typeV !== 'string') {
    console.warn(`receive a unexpect value: ${v} type: ${typeV}`);
    return null;
  }
  // todo: covert number string to number
  if (isNaN(+v)) return null;
  return +v;
}

const isNil = v => v === null || v === undefined;

const resolveDec = (...args: Array<number | null | undefined>) => {
  const dec = args.find(v => !isNil(v));

  return isNil(dec) ? 6 : dec;
} 