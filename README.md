# unitValue

## usage
```javascript
  import main, { unit } from 'unitValue';
  // register value type
  main
    .registerValueType([
      unit(unitName: 'kW', threshold? = 0, dec?, triggerThreshold? = threshold),
      unit('MW', 1000, 3, 10000),
      unit('GW', 1000000),
   ])
   .registerValueType([
      unit('元'),
      unit('万元', 10000, 2, 100000),
   ], 'money');
  
  // apply
  main(100000, '元'); // { value: 10, unit: '万元' }
```

## Definition
```typescript
  /**
   * dec -- Decimal precision: read seq: main's param || Unit's property || 6
   * useValueType: if is string, will try to find a ValueType named with it
   */
  function main(value: unknown, unitName?: string, dec?: number, useValueType?: string | ValueType): UnitValue
  
  function main.registerValueType(list: Unit[] = [], valueTypeName?: string): main
```

## TODO
 + [ ] a better project name
 + [ ] comprehensive test cover
