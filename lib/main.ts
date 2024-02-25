// Jannchie <jannchie@gmail.com>, modified from cycle.js.
/*
    cycle.js
    2021-05-31

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    This code should be minified before deployment.
    See https://www.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

// The file uses the WeakMap feature of ES6.

/* jslint eval */

/* property
    $ref, decycle, forEach, get, indexOf, isArray, keys, length, push,
    retrocycle, set, stringify, test
*/

export function decycle(object: any, replacer?: (value: any) => any) {
  'use strict'

  // Make a deep copy of an object or array, assuring that there is at most
  // one instance of each object or array in the resulting structure. The
  // duplicate references (which might be forming cycles) are replaced with
  // an object of the form

  //      {"$ref": PATH}

  // where the PATH is a JSONPath string that locates the first occurance.

  // So,

  //      var a = [];
  //      a[0] = a;
  //      return JSON.stringify(JSON.decycle(a));

  // produces the string '[{"$ref":"$"}]'.

  // If a replacer function is provided, then it will be called for each value.
  // A replacer function receives a value and returns a replacement value.

  // JSONPath is used to locate the unique object. $ indicates the top level of
  // the object or array. [NUMBER] or [STRING] indicates a child element or
  // property.

  const objects = new WeakMap() // object to path mappings

  return (function derez(value, path) {
    // The derez function recurses through the object, producing the deep copy.

    let old_path // The path of an earlier occurance of value
    let nu: any // The new object or array

    // If a replacer function was provided, then call it to get a replacement value.

    if (replacer !== undefined) {
      value = replacer(value)
    }

    // 获取原型
    if (Array.isArray(value)) {
      for (const v of value) {
        v.$type = v.constructor.name
      }
    }
    if (typeof value === 'object' && value !== null && value.constructor !== Object) {
      value.$type = value.constructor.name
    }

    // 处理函数
    if (
      typeof value === 'function'
    ) {
      if (value.length < 8 || value.substring(0, 8) !== 'function') { // this is ES6 Arrow Function
        return `_NuFrRa_${value}`
      }
    }

    // typeof null === "object", so go on if this value is really an object but not
    // one of the weird builtin objects.

    if (
      typeof value === 'object'
      && value !== null
      && !(value instanceof Boolean)
      && !(value instanceof Date)
      && !(value instanceof Number)
      && !(value instanceof RegExp)
      && !(value instanceof String)
    ) {
      // If the value is an object or array, look to see if we have already
      // encountered it. If so, return a {"$ref":PATH} object. This uses an
      // ES6 WeakMap.
      old_path = objects.get(value)
      if (old_path !== undefined) {
        return { $ref: old_path }
      }

      // Otherwise, accumulate the unique value and its path.

      objects.set(value, path)

      // If it is an array, replicate the array.

      if (Array.isArray(value)) {
        nu = []
        value.forEach((element, i) => {
          nu[i] = derez(element, `${path}[${i}]`)
        })
      }
      else {
        // If it is an object, replicate the object.

        nu = {}
        Object.keys(value).forEach((name) => {
          nu[name] = derez(
            value[name],
              `${path}[${JSON.stringify(name)}]`,
          )
        })
      }
      return nu
    }
    return value
  }(object, '$'))
}

export function retrocycle($: any) {
  'use strict'

  // Restore an object that was reduced by decycle. Members whose values are
  // objects of the form
  //      {$ref: PATH}
  // are replaced with references to the value found by the PATH. This will
  // restore cycles. The object will be mutated.

  // The eval function is used to locate the values described by a PATH. The
  // root object is kept in a $ variable. A regular expression is used to
  // assure that the PATH is extremely well formed. The regexp contains nested
  // quantifiers. That has been known to have extremely bad performance
  // problems on some browsers for very long strings. A PATH is expected to be
  // reasonably short. A PATH is allowed to belong to a very restricted subset of
  // Goessner's JSONPath.

  // So,
  //      var s = '[{"$ref":"$"}]';
  //      return JSON.retrocycle(JSON.parse(s));
  // produces an array containing a single element which is the array itself.

  // eslint-disable-next-line no-control-regex
  const px = /^\$(?:\[(?:\d+|"(?:[^\\"\u0000-\u001F]|\\(?:[\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*")\])*$/;

  (function rez(value) {
    // The rez function walks recursively through the object looking for $ref
    // properties. When it finds one that has a value that is a path, then it
    // replaces the $ref object with a reference to the value that is found by
    // the path.

    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        value.forEach((element, i) => {
          if (typeof element === 'object' && element !== null) {
            const path = element.$ref
            if (typeof path === 'string' && px.test(path)) {
              // eslint-disable-next-line no-eval
              value[i] = eval(`this.${path}`)
            }
            else {
              rez(element)
            }
          }
        })
      }
      else {
        Object.keys(value).forEach((name) => {
          const item = value[name]
          if (typeof item === 'object' && item !== null) {
            const path = item.$ref
            if (typeof path === 'string' && px.test(path)) {
              // eslint-disable-next-line no-eval
              value[name] = eval(`this.${path}`)
            }
            else {
              rez(item)
            }
          }
        })
      }
    }
  }($))
  return $
}

export function stringify(obj: any) {
  return JSON.stringify(decycle(obj))
}

export function parse<T = any>(str: string, typeMap: Map<string, any> = new Map<string, any>([])) {
  const obj = retrocycle(JSON.parse(str))
  // 遍历 g2，根据 $type 设置原型。
  function visit(obj: any, visited = new Set<any>()) {
    if (visited.has(obj)) {
      return
    }
    visited.add(obj)
    if (Array.isArray(obj)) {
      obj.forEach((v) => {
        visit(v, visited)
      })
    }
    else if (typeof obj === 'object' && obj !== null) {
      if (obj.$type) {
        const type = typeMap.get(obj.$type)
        if (!type) {
          throw new Error(`Need type for ${obj.$type}, you should provide it in typeMap. (e.g. parse(str, new Map([['${obj.$type}', ${obj.$type}]]))`)
        }
        Object.setPrototypeOf(obj, type.prototype)
        delete obj.$type
      }
      // 还需要遍历每个字段，判断是否是函数，此时函数会被序列化成字符串
      // 有两种可能，一种是 function 开头的普通函数字符串，一种是 _NuFrRa_ 开头的箭头函数字符串
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          if (obj[key].substring(0, 8) === '_NuFrRa_') {
            // eslint-disable-next-line no-eval
            obj[key] = eval(obj[key].slice(8))
          }
          else if (obj[key].substring(0, 8) === 'function') {
            // eslint-disable-next-line no-eval
            obj[key] = eval(obj[key])
          }
        }
      }
      Object.values(obj).forEach((v) => {
        visit(v, visited)
      })
    }
    return obj
  }
  const res = visit(obj)
  return res as T
}
