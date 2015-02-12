# kola-hooks
Hooks for use in kola framework

# Installation
```shell
npm install kola-hooks --save
```

# Usage

```typescript
import hooks = require('kola-hooks');

function sayHello(payload: string, kontext: Kontext): void {
    console.log('Hello!');
}

function sayWorld(payload: string, kontext: Kontext): void {
    console.log('Hello!');
}

kontext.setSignal('signals.hello', hooks([sayHello, sayWorld]));
```
