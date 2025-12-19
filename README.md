# react-mask-io

A lightweight and controllable library for applying input masks in React, with support for:

- controlled and uncontrolled inputs
- masks by string, RegExp[] or function
- initial value (defaultValue)
- safe synchronization with forms (RHF, Formik, etc.)
- no ref usage
- compatible with any UI library

### Installation

```bash
npm install react-mask-io
```

or

```bash
yarn add react-mask-io
```

or

```bash
pnpm add react-mask-io
```

### Concept

react-mask-io does not render its own input.

It receives a render function (children) and returns only:

- value
- onChange
- onBlur
- disabled

This ensures complete compatibility with any input component.

### Mask Types

#### String mask

- `9` → number (0–9)
- `a` → letter (A–Z, converted to uppercase)
- any other character → literal

Example:

```
"999.999.999-99"
"a-9999999-a"
```

#### Array of RegExp

```javascript
const mask = [
  /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/
];
```

#### Function

```javascript
const mask = (value: string) => value.replace(/\D/g, "").slice(0, 11);
```

### Basic usage (HTML input)

```jsx
import InputMask from "react-mask-io";

<InputMask mask="999.999.999-99">
  {({ value, onChange, onBlur }) => (
    <input
      value={value}
      onChange={onChange}
      onBlur={onBlur}
    />
  )}
</InputMask>
```

### Uncontrolled input (initial value)

```jsx
<InputMask
  mask="999.999.999-99"
  defaultValue="12345678900"
>
  {({ value, onChange }) => (
    <input value={value} onChange={onChange} />
  )}
</InputMask>
```

### Controlled input

```jsx
const [cpf, setCpf] = useState("");

<InputMask
  mask="999.999.999-99"
  value={cpf}
  onChange={(e) => setCpf(e.target.value)}
>
  {({ value, onChange }) => (
    <input value={value} onChange={onChange} />
  )}
</InputMask>
```

### alwaysShowMask

Shows the mask format even with an empty value.

```jsx
<InputMask
  mask="999.999.999-99"
  alwaysShowMask
>
  {({ value, onChange }) => (
    <input value={value} onChange={onChange} />
  )}
</InputMask>
```

### beforeMaskedValueChange

Intercepts the state before being applied.

Useful for:

- normalization
- custom rules
- blocking characters

```jsx
<InputMask
  mask="a-9999999-a"
  beforeMaskedValueChange={({ currentState, nextState }) => {
    if (!nextState.value.startsWith("X")) {
      return currentState;
    }

    return nextState;
  }}
>
  {({ value, onChange }) => (
    <input value={value} onChange={onChange} />
  )}
</InputMask>
```

### Integration with UI libraries

#### Material UI

```jsx
<InputMask mask="999.999.999-99">
  {({ value, onChange, onBlur }) => (
    <TextField
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      label="CPF"
    />
  )}
</InputMask>
```

#### Chakra UI

```jsx
<InputMask mask="999-99-9999">
  {({ value, onChange }) => (
    <Input value={value} onChange={onChange} />
  )}
</InputMask>
```

#### Ant Design

```jsx
<InputMask mask="99.999.999">
  {({ value, onChange }) => (
    <Input value={value} onChange={onChange} />
  )}
</InputMask>
```

#### React Hook Form

```jsx
<Controller
  name="cpf"
  control={control}
  render={({ field }) => (
    <InputMask mask="999.999.999-99" {...field}>
      {({ value, onChange }) => (
        <input value={value} onChange={onChange} />
      )}
    </InputMask>
  )}
/>
```

### Important behavior

- Invalid characters do not enter
- Excess characters are ignored
- onChange only fires when the actual value changes
- Does not generate form loops
- Does not use ref
- Does not control focus or cursor

### Props

| Prop | Type | Description |
|------|------|-------------|
| mask | string \| RegExp[] \| function | Defines the mask |
| value | string | Controlled mode |
| defaultValue | string | Initial value |
| alwaysShowMask | boolean | Display empty format |
| disabled | boolean | Disable input |
| beforeMaskedValueChange | function | Intercepts state |
| children | function | Render function |

### What is not the library's responsibility

- Semantic validation (valid CPF, valid NIE, etc.)
- Error messages
- Styling
- Form management

These responsibilities belong to the form or UI framework.

### Philosophy

- Mask normalizes input.
- Validation validates data.

react-mask-io does one thing — and does it well.