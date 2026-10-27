const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateRegister,
  validateLogin,
  validateTaskInput,
} = require('../src/utils/validate');

test('register trims and lowercases the email', () => {
  const result = validateRegister({ name: ' Asha ', email: ' ASHA@Example.com ', password: 'longenough' });
  assert.deepEqual(result, { name: 'Asha', email: 'asha@example.com', password: 'longenough' });
});

test('register rejects a short password', () => {
  assert.throws(() => validateRegister({ name: 'A', email: 'a@b.co', password: 'short' }), /at least 8/);
});

test('register rejects a non-string email (operator injection guard)', () => {
  assert.throws(
    () => validateRegister({ name: 'A', email: { $ne: null }, password: 'longenough' }),
    /Email must be text/
  );
});

test('login requires both fields', () => {
  assert.throws(() => validateLogin({ email: 'a@b.co' }), /required/);
});

test('task title is required on create', () => {
  assert.throws(() => validateTaskInput({ title: '   ' }), /Title is required/);
});

test('task update only returns the fields that were sent', () => {
  const data = validateTaskInput({ completed: true }, { partial: true });
  assert.deepEqual(data, { completed: true });
});

test('empty PATCH body is rejected', () => {
  assert.throws(() => validateTaskInput({}, { partial: true }), /Nothing to update/);
});

test('invalid due date is rejected', () => {
  assert.throws(() => validateTaskInput({ title: 'x', dueDate: 'not a date' }), /valid date/);
});
