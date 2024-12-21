## Kernel.IsFakeNative(func: Function): boolean

Checks if a function is a fake native function.

**Parameters**

- `func` (Function): The function to check.

**Returns**

- `boolean`: `true` if the function is a fake native, `false` otherwise.

**Example**

```javascript
const isFake = Kernel.IsFakeNative(someFunction);
```

## Kernel.SetFakeNative(constructor: Function): void

Marks a constructor as a fake native function.

**Parameters**

- `constructor` (Function): The constructor to mark as fake native.

**Example**

```javascript
Kernel.SetFakeNative(SomeConstructor);
```

## Kernel['globalThis::Proxy']

Provides a reference to the global Proxy object.

**Example**

```javascript
const proxy = Kernel['globalThis::Proxy'];
```

## Kernel['Array::static']

Provides a reference to the static methods of the global Array object.

**Example**

```javascript
const arrayStatic = Kernel['Array::static'];
```

## Kernel['Map::constructor']

Provides a reference to the global Map constructor.

**Example**

```javascript
const mapConstructor = Kernel['Map::constructor'];
```

## Kernel['Map::prototype']

Provides a reference to the prototype of the global Map object.

**Example**

```javascript
const mapPrototype = Kernel['Map::prototype'];
```

## Kernel['Array::constructor']

Provides a reference to the global Array constructor.

**Example**

```javascript
const arrayConstructor = Kernel['Array::constructor'];
```

## Kernel['Array::prototype']

Provides a reference to the prototype of the global Array object.

**Example**

```javascript
const arrayPrototype = Kernel['Array::prototype'];
```

## Kernel.\_\_call

Provides a reference to the Function.prototype.call method.

**Example**

```javascript
const callMethod = Kernel.__call;
```

## Kernel.call

Provides a bound reference to the Function.prototype.call method.

**Example**

```javascript
const boundCall = Kernel.call;
```

## Kernel.\_\_setPrototypeOf

Provides a reference to the Object.setPrototypeOf method.

**Example**

```javascript
const setPrototypeOf = Kernel.__setPrototypeOf;
```

## Kernel.construct

Provides a method to clone the prototypes of all `globalThis` objects to ensure that if the original prototype is modified, it uses the clone from the original prototypes.

**Example**

```javascript
Kernel.construct();
```

## Usage Scenarios

### Prototype Pollution Prevention

The Kernel class can prevent prototype pollution by isolating and protecting core functionalities. For example, if the global `Array.prototype.push` method is deleted, the Kernel class ensures that its own reference to the push method remains intact.

**Example**

```javascript
// Deleting global Array.prototype.push
delete Array.prototype.push;

// Kernel still has a reference to the original push method
const pushMethod = Kernel['Array::prototype'].push;
```

### Secure Function Execution

The Kernel class provides a secure environment for executing functions, ensuring that core functionalities are not tampered with.

**Example**

```javascript
const secureFunction = Kernel.call(someFunction, thisArg, ...args);
```

### Prototype Cloning

The Kernel class can clone the prototypes of all `globalThis` objects to ensure that if the original prototype is modified, it uses the clone from the original prototypes.

**Example**

```javascript
// Cloning prototypes
Kernel.construct();

// Modifying the original prototype
Array.prototype.push = function () {
   console.log('Modified push method');
};

// Using the cloned prototype
const array = [];
Kernel['Array::prototype'].push.call(array, 1);
console.log(array); // Output: [1]
```

## Conclusion

The Kernel class provides a robust and secure way to interact with global objects and functions, protecting against prototype pollution and ensuring consistent behavior. It is particularly useful in security-critical applications, sandbox environments, and API compatibility layers.

## Written by ChatGPT 4o
