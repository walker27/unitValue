import main, { unit, constraintValue, ValueType } from "../src/index";

main
  .registerValueType([
    unit('kW', 0, 2),
    unit('MW', 1000, 10000),
    unit('GW', 1000 * 1000),
  ])
  .registerValueType([
    unit('元'),
    unit('万元', 10000, 2, 100000),
  ])
  .registerValueType([
    unit('元'),
    unit('美元', 1000, 2),
  ], 'usa');


// test("version is 0.0.1?", () => {
//   const res = main(0.1, '元');
//   expect(res.value).toBe(0.1);
//   expect(res.unit).toBe('元');
// });

// test('test function constraintValue', () => {
//   expect(constraintValue(null)).toBe(null);
//   expect(constraintValue(1)).toBe(1);
//   expect(constraintValue('1')).toBe(1);
//   expect(constraintValue({})).toBe(null);
//   expect(constraintValue([])).toBe(null);
//   expect(constraintValue(NaN)).toBe(null);
// });

test('basic usage', () => {
  const res = main(0.1, '元');
  expect(res.value).toBe(0.1);
  expect(res.unit).toBe('元');

  const res2 = main(1000, '元');
  expect(res2.value).toBe(1000);
  expect(res2.unit).toBe('元');

  const res3 = main(10000, '元');
  expect(res3.value).toBe(10000);
  expect(res3.unit).toBe('元');

  const res4 = main(100000, '元');
  expect(res4.value).toBe(10);
  expect(res4.unit).toBe('万元');

  const res5 = main(1, '万元');
  expect(res5.value).toBe(10000);
  expect(res5.unit).toBe('元');
});

test('test useValueType', () => {
  const res = main(1000, '元');
  expect(res.value).toBe(1000);
  expect(res.unit).toBe('元');

  const res2 = main(1000, '元', 2, 'usa');
  expect(res2.value).toBe(1);
  expect(res2.unit).toBe('美元');

  const res3 = main(1000, '元', undefined, new ValueType([unit('元'), unit('元元', 10)]));
  expect(res3.value).toBe(100);
  expect(res3.unit).toBe('元元');
});

// todo dec-test, UnitValue.to-test