fully implementation of JSON parse and stringify

```javascript
var o = new Parse(`{"a":[{"b":[{}, "b", 2]}]}`);
o.toString(); // get stringified json;
o.valueOf(); // get the json
```
