# Sling

sling inspired by https://github.com/dghubble/sling

## Install

```
npm i @redmunroe/sling
```

## Import

```
import sling from '@redmunroe/sling';
```

## Usage

### successful request 2XX

```ts
type success = {
    field : string
}
const s = new sling({
  host: "api.somedomain.com",
  headers: {
    "Content-Type": "application/json"
  };
})
const response = await s.path("/some/resource").get().successJSON<success>();
if (!response) {
    throw new Error("some error occurred");
}
console.log(response);
```

### failure anything not 2XX

```ts
type failure = {
    field : string
}
const s = new sling({
  host: "api.somedomain.com",
  headers: {
    "Content-Type": "application/json"
  };
})
const response = await s.path("/some/resource").get().failureJSON<failure>();
if (!response) {
    throw new Error("some error occurred");
}
console.log(response);
```

### get either success or failure at the same time.

```ts
type success = {
    field: string
}

type failure = {
    field : string
}
const s = new sling({
  host: "api.somedomain.com",
  headers: {
    "Content-Type": "application/json"
  };
})
const response = await s.path("/some/resource").get().request<success, failure>();

console.log(response.success);
console.log(response.failure);
```
