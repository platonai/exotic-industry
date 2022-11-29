;
let __pulsar_CONFIGS = {"propertyNames":["font-size, color, background-color"],"viewPortWidth":1920,"viewPortHeight":1080,"META_INFORMATION_ID":"PulsarMetaInformation","SCRIPT_SECTION_ID":"PulsarScriptSection","ATTR_HIDDEN":"_h","ATTR_OVERFLOW_HIDDEN":"_oh","ATTR_OVERFLOW_VISIBLE":"_visible","ATTR_ELEMENT_NODE_VI":"vi","ATTR_TEXT_NODE_VI":"tv"};




(({ _utilsFns, _mainFunction, _args }) => {
        // Add this point we cannot use our utililty functions as they're just strings, we need to materialize them first
        const utils = Object.fromEntries(
          Object.entries(_utilsFns).map(([key, value]) => [key, eval(value)]) // eslint-disable-line no-eval
        )
        utils.init()
        return eval(_mainFunction)(utils, ..._args) // eslint-disable-line no-eval
      })({"_utilsFns":{"init":"() => {\n  utils.preloadCache()\n}","stripProxyFromErrors":"(handler = {}) => {\n  const newHandler = {\n    setPrototypeOf: function (target, proto) {\n      if (proto === null)\n        throw new TypeError('Cannot convert object to primitive value')\n      if (Object.getPrototypeOf(target) === Object.getPrototypeOf(proto)) {\n        throw new TypeError('Cyclic __proto__ value')\n      }\n      return Reflect.setPrototypeOf(target, proto)\n    }\n  }\n  // We wrap each trap in the handler in a try/catch and modify the error stack if they throw\n  const traps = Object.getOwnPropertyNames(handler)\n  traps.forEach(trap => {\n    newHandler[trap] = function () {\n      try {\n        // Forward the call to the defined proxy handler\n        return handler[trap].apply(this, arguments || [])\n      } catch (err) {\n        // Stack traces differ per browser, we only support chromium based ones currently\n        if (!err || !err.stack || !err.stack.includes(`at `)) {\n          throw err\n        }\n\n        // When something throws within one of our traps the Proxy will show up in error stacks\n        // An earlier implementation of this code would simply strip lines with a blacklist,\n        // but it makes sense to be more surgical here and only remove lines related to our Proxy.\n        // We try to use a known \"anchor\" line for that and strip it with everything above it.\n        // If the anchor line cannot be found for some reason we fall back to our blacklist approach.\n\n        const stripWithBlacklist = (stack, stripFirstLine = true) => {\n          const blacklist = [\n            `at Reflect.${trap} `, // e.g. Reflect.get or Reflect.apply\n            `at Object.${trap} `, // e.g. Object.get or Object.apply\n            `at Object.newHandler.<computed> [as ${trap}] ` // caused by this very wrapper :-)\n          ]\n          return (\n            err.stack\n              .split('\\n')\n              // Always remove the first (file) line in the stack (guaranteed to be our proxy)\n              .filter((line, index) => !(index === 1 && stripFirstLine))\n              // Check if the line starts with one of our blacklisted strings\n              .filter(line => !blacklist.some(bl => line.trim().startsWith(bl)))\n              .join('\\n')\n          )\n        }\n\n        const stripWithAnchor = (stack, anchor) => {\n          const stackArr = stack.split('\\n')\n          anchor = anchor || `at Object.newHandler.<computed> [as ${trap}] ` // Known first Proxy line in chromium\n          const anchorIndex = stackArr.findIndex(line =>\n            line.trim().startsWith(anchor)\n          )\n          if (anchorIndex === -1) {\n            return false // 404, anchor not found\n          }\n          // Strip everything from the top until we reach the anchor line\n          // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n          stackArr.splice(1, anchorIndex)\n          return stackArr.join('\\n')\n        }\n\n        // Special cases due to our nested toString proxies\n        err.stack = err.stack.replace(\n          'at Object.toString (',\n          'at Function.toString ('\n        )\n        if ((err.stack || '').includes('at Function.toString (')) {\n          err.stack = stripWithBlacklist(err.stack, false)\n          throw err\n        }\n\n        // Try using the anchor method, fallback to blacklist if necessary\n        err.stack = stripWithAnchor(err.stack) || stripWithBlacklist(err.stack)\n\n        throw err // Re-throw our now sanitized error\n      }\n    }\n  })\n  return newHandler\n}","stripErrorWithAnchor":"(err, anchor) => {\n  const stackArr = err.stack.split('\\n')\n  const anchorIndex = stackArr.findIndex(line => line.trim().startsWith(anchor))\n  if (anchorIndex === -1) {\n    return err // 404, anchor not found\n  }\n  // Strip everything from the top until we reach the anchor line (remove anchor line as well)\n  // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n  stackArr.splice(1, anchorIndex)\n  err.stack = stackArr.join('\\n')\n  return err\n}","replaceProperty":"(obj, propName, descriptorOverrides = {}) => {\n  return Object.defineProperty(obj, propName, {\n    // Copy over the existing descriptors (writable, enumerable, configurable, etc)\n    ...(Object.getOwnPropertyDescriptor(obj, propName) || {}),\n    // Add our overrides (e.g. value, get())\n    ...descriptorOverrides\n  })\n}","preloadCache":"() => {\n  if (utils.cache) {\n    return\n  }\n  utils.cache = {\n    // Used in our proxies\n    Reflect: {\n      get: Reflect.get.bind(Reflect),\n      apply: Reflect.apply.bind(Reflect)\n    },\n    // Used in `makeNativeString`\n    nativeToStringStr: Function.toString + '' // => `function toString() { [native code] }`\n  }\n}","makeNativeString":"(name = '') => {\n  return utils.cache.nativeToStringStr.replace('toString', name || '')\n}","patchToString":"(obj, str = '') => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n      // `toString` targeted at our proxied Object detected\n      if (ctx === obj) {\n        // We either return the optional string verbatim or derive the most desired result automatically\n        return str || utils.makeNativeString(obj.name)\n      }\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","patchToStringNested":"(obj = {}) => {\n  return utils.execRecursively(obj, ['function'], utils.patchToString)\n}","redirectToString":"(proxyObj, originalObj) => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n\n      // `toString` targeted at our proxied Object detected\n      if (ctx === proxyObj) {\n        const fallback = () =>\n          originalObj && originalObj.name\n            ? utils.makeNativeString(originalObj.name)\n            : utils.makeNativeString(proxyObj.name)\n\n        // Return the toString representation of our original object if possible\n        return originalObj + '' || fallback()\n      }\n\n      if (typeof ctx === 'undefined' || ctx === null) {\n        return target.call(ctx)\n      }\n\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","replaceWithProxy":"(obj, propName, handler) => {\n  const originalObj = obj[propName]\n  const proxyObj = new Proxy(obj[propName], utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.redirectToString(proxyObj, originalObj)\n\n  return true\n}","replaceGetterWithProxy":"(obj, propName, handler) => {\n  const fn = Object.getOwnPropertyDescriptor(obj, propName).get\n  const fnStr = fn.toString() // special getter function string\n  const proxyObj = new Proxy(fn, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { get: proxyObj })\n  utils.patchToString(proxyObj, fnStr)\n\n  return true\n}","mockWithProxy":"(obj, propName, pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.patchToString(proxyObj)\n\n  return true\n}","createProxy":"(pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n  utils.patchToString(proxyObj)\n\n  return proxyObj\n}","splitObjPath":"objPath => ({\n  // Remove last dot entry (property) ==> `HTMLMediaElement.prototype`\n  objName: objPath.split('.').slice(0, -1).join('.'),\n  // Extract last dot entry ==> `canPlayType`\n  propName: objPath.split('.').slice(-1)[0]\n})","replaceObjPathWithProxy":"(objPath, handler) => {\n  const { objName, propName } = utils.splitObjPath(objPath)\n  const obj = eval(objName) // eslint-disable-line no-eval\n  return utils.replaceWithProxy(obj, propName, handler)\n}","execRecursively":"(obj = {}, typeFilter = [], fn) => {\n  function recurse(obj) {\n    for (const key in obj) {\n      if (obj[key] === undefined) {\n        continue\n      }\n      if (obj[key] && typeof obj[key] === 'object') {\n        recurse(obj[key])\n      } else {\n        if (obj[key] && typeFilter.includes(typeof obj[key])) {\n          fn.call(this, obj[key])\n        }\n      }\n    }\n  }\n  recurse(obj)\n  return obj\n}","stringifyFns":"(fnObj = { hello: () => 'world' }) => {\n  // Object.fromEntries() ponyfill (in 6 lines) - supported only in Node v12+, modern browsers are fine\n  // https://github.com/feross/fromentries\n  function fromEntries(iterable) {\n    return [...iterable].reduce((obj, [key, val]) => {\n      obj[key] = val\n      return obj\n    }, {})\n  }\n  return (Object.fromEntries || fromEntries)(\n    Object.entries(fnObj)\n      .filter(([key, value]) => typeof value === 'function')\n      .map(([key, value]) => [key, value.toString()]) // eslint-disable-line no-eval\n  )\n}","materializeFns":"(fnStrObj = { hello: \"() => 'world'\" }) => {\n  return Object.fromEntries(\n    Object.entries(fnStrObj).map(([key, value]) => {\n      if (value.startsWith('function')) {\n        // some trickery is needed to make oldschool functions work :-)\n        return [key, eval(`() => ${value}`)()] // eslint-disable-line no-eval\n      } else {\n        // arrow functions just work\n        return [key, eval(value)] // eslint-disable-line no-eval\n      }\n    })\n  )\n}","makeHandler":"() => ({\n  // Used by simple `navigator` getter evasions\n  getterValue: value => ({\n    apply(target, ctx, args) {\n      // Let's fetch the value first, to trigger and escalate potential errors\n      // Illegal invocations like `navigator.__proto__.vendor` will throw here\n      utils.cache.Reflect.apply(...arguments)\n      return value\n    }\n  })\n})"},"_mainFunction":"utils => {\n      if (!window.chrome) {\n        // Use the exact property descriptor found in headful Chrome\n        // fetch it via `Object.getOwnPropertyDescriptor(window, 'chrome')`\n        Object.defineProperty(window, 'chrome', {\n          writable: true,\n          enumerable: true,\n          configurable: false, // note!\n          value: {} // We'll extend that later\n        })\n      }\n\n      // That means we're running headful and don't need to mock anything\n      if ('app' in window.chrome) {\n        return // Nothing to do here\n      }\n\n      const makeError = {\n        ErrorInInvocation: fn => {\n          const err = new TypeError(`Error in invocation of app.${fn}()`)\n          return utils.stripErrorWithAnchor(\n            err,\n            `at ${fn} (eval at <anonymous>`\n          )\n        }\n      }\n\n      // There's a some static data in that property which doesn't seem to change,\n      // we should periodically check for updates: `JSON.stringify(window.app, null, 2)`\n      const STATIC_DATA = JSON.parse(\n        `\n{\n  \"isInstalled\": false,\n  \"InstallState\": {\n    \"DISABLED\": \"disabled\",\n    \"INSTALLED\": \"installed\",\n    \"NOT_INSTALLED\": \"not_installed\"\n  },\n  \"RunningState\": {\n    \"CANNOT_RUN\": \"cannot_run\",\n    \"READY_TO_RUN\": \"ready_to_run\",\n    \"RUNNING\": \"running\"\n  }\n}\n        `.trim()\n      )\n\n      window.chrome.app = {\n        ...STATIC_DATA,\n\n        get isInstalled() {\n          return false\n        },\n\n        getDetails: function getDetails() {\n          if (arguments.length) {\n            throw makeError.ErrorInInvocation(`getDetails`)\n          }\n          return null\n        },\n        getIsInstalled: function getDetails() {\n          if (arguments.length) {\n            throw makeError.ErrorInInvocation(`getIsInstalled`)\n          }\n          return false\n        },\n        runningState: function getDetails() {\n          if (arguments.length) {\n            throw makeError.ErrorInInvocation(`runningState`)\n          }\n          return 'cannot_run'\n        }\n      }\n      utils.patchToStringNested(window.chrome.app)\n    }","_args":[]});
(({ _utilsFns, _mainFunction, _args }) => {
        // Add this point we cannot use our utililty functions as they're just strings, we need to materialize them first
        const utils = Object.fromEntries(
          Object.entries(_utilsFns).map(([key, value]) => [key, eval(value)]) // eslint-disable-line no-eval
        )
        utils.init()
        return eval(_mainFunction)(utils, ..._args) // eslint-disable-line no-eval
      })({"_utilsFns":{"init":"() => {\n  utils.preloadCache()\n}","stripProxyFromErrors":"(handler = {}) => {\n  const newHandler = {\n    setPrototypeOf: function (target, proto) {\n      if (proto === null)\n        throw new TypeError('Cannot convert object to primitive value')\n      if (Object.getPrototypeOf(target) === Object.getPrototypeOf(proto)) {\n        throw new TypeError('Cyclic __proto__ value')\n      }\n      return Reflect.setPrototypeOf(target, proto)\n    }\n  }\n  // We wrap each trap in the handler in a try/catch and modify the error stack if they throw\n  const traps = Object.getOwnPropertyNames(handler)\n  traps.forEach(trap => {\n    newHandler[trap] = function () {\n      try {\n        // Forward the call to the defined proxy handler\n        return handler[trap].apply(this, arguments || [])\n      } catch (err) {\n        // Stack traces differ per browser, we only support chromium based ones currently\n        if (!err || !err.stack || !err.stack.includes(`at `)) {\n          throw err\n        }\n\n        // When something throws within one of our traps the Proxy will show up in error stacks\n        // An earlier implementation of this code would simply strip lines with a blacklist,\n        // but it makes sense to be more surgical here and only remove lines related to our Proxy.\n        // We try to use a known \"anchor\" line for that and strip it with everything above it.\n        // If the anchor line cannot be found for some reason we fall back to our blacklist approach.\n\n        const stripWithBlacklist = (stack, stripFirstLine = true) => {\n          const blacklist = [\n            `at Reflect.${trap} `, // e.g. Reflect.get or Reflect.apply\n            `at Object.${trap} `, // e.g. Object.get or Object.apply\n            `at Object.newHandler.<computed> [as ${trap}] ` // caused by this very wrapper :-)\n          ]\n          return (\n            err.stack\n              .split('\\n')\n              // Always remove the first (file) line in the stack (guaranteed to be our proxy)\n              .filter((line, index) => !(index === 1 && stripFirstLine))\n              // Check if the line starts with one of our blacklisted strings\n              .filter(line => !blacklist.some(bl => line.trim().startsWith(bl)))\n              .join('\\n')\n          )\n        }\n\n        const stripWithAnchor = (stack, anchor) => {\n          const stackArr = stack.split('\\n')\n          anchor = anchor || `at Object.newHandler.<computed> [as ${trap}] ` // Known first Proxy line in chromium\n          const anchorIndex = stackArr.findIndex(line =>\n            line.trim().startsWith(anchor)\n          )\n          if (anchorIndex === -1) {\n            return false // 404, anchor not found\n          }\n          // Strip everything from the top until we reach the anchor line\n          // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n          stackArr.splice(1, anchorIndex)\n          return stackArr.join('\\n')\n        }\n\n        // Special cases due to our nested toString proxies\n        err.stack = err.stack.replace(\n          'at Object.toString (',\n          'at Function.toString ('\n        )\n        if ((err.stack || '').includes('at Function.toString (')) {\n          err.stack = stripWithBlacklist(err.stack, false)\n          throw err\n        }\n\n        // Try using the anchor method, fallback to blacklist if necessary\n        err.stack = stripWithAnchor(err.stack) || stripWithBlacklist(err.stack)\n\n        throw err // Re-throw our now sanitized error\n      }\n    }\n  })\n  return newHandler\n}","stripErrorWithAnchor":"(err, anchor) => {\n  const stackArr = err.stack.split('\\n')\n  const anchorIndex = stackArr.findIndex(line => line.trim().startsWith(anchor))\n  if (anchorIndex === -1) {\n    return err // 404, anchor not found\n  }\n  // Strip everything from the top until we reach the anchor line (remove anchor line as well)\n  // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n  stackArr.splice(1, anchorIndex)\n  err.stack = stackArr.join('\\n')\n  return err\n}","replaceProperty":"(obj, propName, descriptorOverrides = {}) => {\n  return Object.defineProperty(obj, propName, {\n    // Copy over the existing descriptors (writable, enumerable, configurable, etc)\n    ...(Object.getOwnPropertyDescriptor(obj, propName) || {}),\n    // Add our overrides (e.g. value, get())\n    ...descriptorOverrides\n  })\n}","preloadCache":"() => {\n  if (utils.cache) {\n    return\n  }\n  utils.cache = {\n    // Used in our proxies\n    Reflect: {\n      get: Reflect.get.bind(Reflect),\n      apply: Reflect.apply.bind(Reflect)\n    },\n    // Used in `makeNativeString`\n    nativeToStringStr: Function.toString + '' // => `function toString() { [native code] }`\n  }\n}","makeNativeString":"(name = '') => {\n  return utils.cache.nativeToStringStr.replace('toString', name || '')\n}","patchToString":"(obj, str = '') => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n      // `toString` targeted at our proxied Object detected\n      if (ctx === obj) {\n        // We either return the optional string verbatim or derive the most desired result automatically\n        return str || utils.makeNativeString(obj.name)\n      }\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","patchToStringNested":"(obj = {}) => {\n  return utils.execRecursively(obj, ['function'], utils.patchToString)\n}","redirectToString":"(proxyObj, originalObj) => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n\n      // `toString` targeted at our proxied Object detected\n      if (ctx === proxyObj) {\n        const fallback = () =>\n          originalObj && originalObj.name\n            ? utils.makeNativeString(originalObj.name)\n            : utils.makeNativeString(proxyObj.name)\n\n        // Return the toString representation of our original object if possible\n        return originalObj + '' || fallback()\n      }\n\n      if (typeof ctx === 'undefined' || ctx === null) {\n        return target.call(ctx)\n      }\n\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","replaceWithProxy":"(obj, propName, handler) => {\n  const originalObj = obj[propName]\n  const proxyObj = new Proxy(obj[propName], utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.redirectToString(proxyObj, originalObj)\n\n  return true\n}","replaceGetterWithProxy":"(obj, propName, handler) => {\n  const fn = Object.getOwnPropertyDescriptor(obj, propName).get\n  const fnStr = fn.toString() // special getter function string\n  const proxyObj = new Proxy(fn, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { get: proxyObj })\n  utils.patchToString(proxyObj, fnStr)\n\n  return true\n}","mockWithProxy":"(obj, propName, pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.patchToString(proxyObj)\n\n  return true\n}","createProxy":"(pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n  utils.patchToString(proxyObj)\n\n  return proxyObj\n}","splitObjPath":"objPath => ({\n  // Remove last dot entry (property) ==> `HTMLMediaElement.prototype`\n  objName: objPath.split('.').slice(0, -1).join('.'),\n  // Extract last dot entry ==> `canPlayType`\n  propName: objPath.split('.').slice(-1)[0]\n})","replaceObjPathWithProxy":"(objPath, handler) => {\n  const { objName, propName } = utils.splitObjPath(objPath)\n  const obj = eval(objName) // eslint-disable-line no-eval\n  return utils.replaceWithProxy(obj, propName, handler)\n}","execRecursively":"(obj = {}, typeFilter = [], fn) => {\n  function recurse(obj) {\n    for (const key in obj) {\n      if (obj[key] === undefined) {\n        continue\n      }\n      if (obj[key] && typeof obj[key] === 'object') {\n        recurse(obj[key])\n      } else {\n        if (obj[key] && typeFilter.includes(typeof obj[key])) {\n          fn.call(this, obj[key])\n        }\n      }\n    }\n  }\n  recurse(obj)\n  return obj\n}","stringifyFns":"(fnObj = { hello: () => 'world' }) => {\n  // Object.fromEntries() ponyfill (in 6 lines) - supported only in Node v12+, modern browsers are fine\n  // https://github.com/feross/fromentries\n  function fromEntries(iterable) {\n    return [...iterable].reduce((obj, [key, val]) => {\n      obj[key] = val\n      return obj\n    }, {})\n  }\n  return (Object.fromEntries || fromEntries)(\n    Object.entries(fnObj)\n      .filter(([key, value]) => typeof value === 'function')\n      .map(([key, value]) => [key, value.toString()]) // eslint-disable-line no-eval\n  )\n}","materializeFns":"(fnStrObj = { hello: \"() => 'world'\" }) => {\n  return Object.fromEntries(\n    Object.entries(fnStrObj).map(([key, value]) => {\n      if (value.startsWith('function')) {\n        // some trickery is needed to make oldschool functions work :-)\n        return [key, eval(`() => ${value}`)()] // eslint-disable-line no-eval\n      } else {\n        // arrow functions just work\n        return [key, eval(value)] // eslint-disable-line no-eval\n      }\n    })\n  )\n}","makeHandler":"() => ({\n  // Used by simple `navigator` getter evasions\n  getterValue: value => ({\n    apply(target, ctx, args) {\n      // Let's fetch the value first, to trigger and escalate potential errors\n      // Illegal invocations like `navigator.__proto__.vendor` will throw here\n      utils.cache.Reflect.apply(...arguments)\n      return value\n    }\n  })\n})"},"_mainFunction":"utils => {\n      if (!window.chrome) {\n        // Use the exact property descriptor found in headful Chrome\n        // fetch it via `Object.getOwnPropertyDescriptor(window, 'chrome')`\n        Object.defineProperty(window, 'chrome', {\n          writable: true,\n          enumerable: true,\n          configurable: false, // note!\n          value: {} // We'll extend that later\n        })\n      }\n\n      // That means we're running headful and don't need to mock anything\n      if ('csi' in window.chrome) {\n        return // Nothing to do here\n      }\n\n      // Check that the Navigation Timing API v1 is available, we need that\n      if (!window.performance || !window.performance.timing) {\n        return\n      }\n\n      const { timing } = window.performance\n\n      window.chrome.csi = function() {\n        return {\n          onloadT: timing.domContentLoadedEventEnd,\n          startE: timing.navigationStart,\n          pageT: Date.now() - timing.navigationStart,\n          tran: 15 // Transition type or something\n        }\n      }\n      utils.patchToString(window.chrome.csi)\n    }","_args":[]});
(({ _utilsFns, _mainFunction, _args }) => {
        // Add this point we cannot use our utililty functions as they're just strings, we need to materialize them first
        const utils = Object.fromEntries(
          Object.entries(_utilsFns).map(([key, value]) => [key, eval(value)]) // eslint-disable-line no-eval
        )
        utils.init()
        return eval(_mainFunction)(utils, ..._args) // eslint-disable-line no-eval
      })({"_utilsFns":{"init":"() => {\n  utils.preloadCache()\n}","stripProxyFromErrors":"(handler = {}) => {\n  const newHandler = {\n    setPrototypeOf: function (target, proto) {\n      if (proto === null)\n        throw new TypeError('Cannot convert object to primitive value')\n      if (Object.getPrototypeOf(target) === Object.getPrototypeOf(proto)) {\n        throw new TypeError('Cyclic __proto__ value')\n      }\n      return Reflect.setPrototypeOf(target, proto)\n    }\n  }\n  // We wrap each trap in the handler in a try/catch and modify the error stack if they throw\n  const traps = Object.getOwnPropertyNames(handler)\n  traps.forEach(trap => {\n    newHandler[trap] = function () {\n      try {\n        // Forward the call to the defined proxy handler\n        return handler[trap].apply(this, arguments || [])\n      } catch (err) {\n        // Stack traces differ per browser, we only support chromium based ones currently\n        if (!err || !err.stack || !err.stack.includes(`at `)) {\n          throw err\n        }\n\n        // When something throws within one of our traps the Proxy will show up in error stacks\n        // An earlier implementation of this code would simply strip lines with a blacklist,\n        // but it makes sense to be more surgical here and only remove lines related to our Proxy.\n        // We try to use a known \"anchor\" line for that and strip it with everything above it.\n        // If the anchor line cannot be found for some reason we fall back to our blacklist approach.\n\n        const stripWithBlacklist = (stack, stripFirstLine = true) => {\n          const blacklist = [\n            `at Reflect.${trap} `, // e.g. Reflect.get or Reflect.apply\n            `at Object.${trap} `, // e.g. Object.get or Object.apply\n            `at Object.newHandler.<computed> [as ${trap}] ` // caused by this very wrapper :-)\n          ]\n          return (\n            err.stack\n              .split('\\n')\n              // Always remove the first (file) line in the stack (guaranteed to be our proxy)\n              .filter((line, index) => !(index === 1 && stripFirstLine))\n              // Check if the line starts with one of our blacklisted strings\n              .filter(line => !blacklist.some(bl => line.trim().startsWith(bl)))\n              .join('\\n')\n          )\n        }\n\n        const stripWithAnchor = (stack, anchor) => {\n          const stackArr = stack.split('\\n')\n          anchor = anchor || `at Object.newHandler.<computed> [as ${trap}] ` // Known first Proxy line in chromium\n          const anchorIndex = stackArr.findIndex(line =>\n            line.trim().startsWith(anchor)\n          )\n          if (anchorIndex === -1) {\n            return false // 404, anchor not found\n          }\n          // Strip everything from the top until we reach the anchor line\n          // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n          stackArr.splice(1, anchorIndex)\n          return stackArr.join('\\n')\n        }\n\n        // Special cases due to our nested toString proxies\n        err.stack = err.stack.replace(\n          'at Object.toString (',\n          'at Function.toString ('\n        )\n        if ((err.stack || '').includes('at Function.toString (')) {\n          err.stack = stripWithBlacklist(err.stack, false)\n          throw err\n        }\n\n        // Try using the anchor method, fallback to blacklist if necessary\n        err.stack = stripWithAnchor(err.stack) || stripWithBlacklist(err.stack)\n\n        throw err // Re-throw our now sanitized error\n      }\n    }\n  })\n  return newHandler\n}","stripErrorWithAnchor":"(err, anchor) => {\n  const stackArr = err.stack.split('\\n')\n  const anchorIndex = stackArr.findIndex(line => line.trim().startsWith(anchor))\n  if (anchorIndex === -1) {\n    return err // 404, anchor not found\n  }\n  // Strip everything from the top until we reach the anchor line (remove anchor line as well)\n  // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n  stackArr.splice(1, anchorIndex)\n  err.stack = stackArr.join('\\n')\n  return err\n}","replaceProperty":"(obj, propName, descriptorOverrides = {}) => {\n  return Object.defineProperty(obj, propName, {\n    // Copy over the existing descriptors (writable, enumerable, configurable, etc)\n    ...(Object.getOwnPropertyDescriptor(obj, propName) || {}),\n    // Add our overrides (e.g. value, get())\n    ...descriptorOverrides\n  })\n}","preloadCache":"() => {\n  if (utils.cache) {\n    return\n  }\n  utils.cache = {\n    // Used in our proxies\n    Reflect: {\n      get: Reflect.get.bind(Reflect),\n      apply: Reflect.apply.bind(Reflect)\n    },\n    // Used in `makeNativeString`\n    nativeToStringStr: Function.toString + '' // => `function toString() { [native code] }`\n  }\n}","makeNativeString":"(name = '') => {\n  return utils.cache.nativeToStringStr.replace('toString', name || '')\n}","patchToString":"(obj, str = '') => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n      // `toString` targeted at our proxied Object detected\n      if (ctx === obj) {\n        // We either return the optional string verbatim or derive the most desired result automatically\n        return str || utils.makeNativeString(obj.name)\n      }\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","patchToStringNested":"(obj = {}) => {\n  return utils.execRecursively(obj, ['function'], utils.patchToString)\n}","redirectToString":"(proxyObj, originalObj) => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n\n      // `toString` targeted at our proxied Object detected\n      if (ctx === proxyObj) {\n        const fallback = () =>\n          originalObj && originalObj.name\n            ? utils.makeNativeString(originalObj.name)\n            : utils.makeNativeString(proxyObj.name)\n\n        // Return the toString representation of our original object if possible\n        return originalObj + '' || fallback()\n      }\n\n      if (typeof ctx === 'undefined' || ctx === null) {\n        return target.call(ctx)\n      }\n\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","replaceWithProxy":"(obj, propName, handler) => {\n  const originalObj = obj[propName]\n  const proxyObj = new Proxy(obj[propName], utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.redirectToString(proxyObj, originalObj)\n\n  return true\n}","replaceGetterWithProxy":"(obj, propName, handler) => {\n  const fn = Object.getOwnPropertyDescriptor(obj, propName).get\n  const fnStr = fn.toString() // special getter function string\n  const proxyObj = new Proxy(fn, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { get: proxyObj })\n  utils.patchToString(proxyObj, fnStr)\n\n  return true\n}","mockWithProxy":"(obj, propName, pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.patchToString(proxyObj)\n\n  return true\n}","createProxy":"(pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n  utils.patchToString(proxyObj)\n\n  return proxyObj\n}","splitObjPath":"objPath => ({\n  // Remove last dot entry (property) ==> `HTMLMediaElement.prototype`\n  objName: objPath.split('.').slice(0, -1).join('.'),\n  // Extract last dot entry ==> `canPlayType`\n  propName: objPath.split('.').slice(-1)[0]\n})","replaceObjPathWithProxy":"(objPath, handler) => {\n  const { objName, propName } = utils.splitObjPath(objPath)\n  const obj = eval(objName) // eslint-disable-line no-eval\n  return utils.replaceWithProxy(obj, propName, handler)\n}","execRecursively":"(obj = {}, typeFilter = [], fn) => {\n  function recurse(obj) {\n    for (const key in obj) {\n      if (obj[key] === undefined) {\n        continue\n      }\n      if (obj[key] && typeof obj[key] === 'object') {\n        recurse(obj[key])\n      } else {\n        if (obj[key] && typeFilter.includes(typeof obj[key])) {\n          fn.call(this, obj[key])\n        }\n      }\n    }\n  }\n  recurse(obj)\n  return obj\n}","stringifyFns":"(fnObj = { hello: () => 'world' }) => {\n  // Object.fromEntries() ponyfill (in 6 lines) - supported only in Node v12+, modern browsers are fine\n  // https://github.com/feross/fromentries\n  function fromEntries(iterable) {\n    return [...iterable].reduce((obj, [key, val]) => {\n      obj[key] = val\n      return obj\n    }, {})\n  }\n  return (Object.fromEntries || fromEntries)(\n    Object.entries(fnObj)\n      .filter(([key, value]) => typeof value === 'function')\n      .map(([key, value]) => [key, value.toString()]) // eslint-disable-line no-eval\n  )\n}","materializeFns":"(fnStrObj = { hello: \"() => 'world'\" }) => {\n  return Object.fromEntries(\n    Object.entries(fnStrObj).map(([key, value]) => {\n      if (value.startsWith('function')) {\n        // some trickery is needed to make oldschool functions work :-)\n        return [key, eval(`() => ${value}`)()] // eslint-disable-line no-eval\n      } else {\n        // arrow functions just work\n        return [key, eval(value)] // eslint-disable-line no-eval\n      }\n    })\n  )\n}","makeHandler":"() => ({\n  // Used by simple `navigator` getter evasions\n  getterValue: value => ({\n    apply(target, ctx, args) {\n      // Let's fetch the value first, to trigger and escalate potential errors\n      // Illegal invocations like `navigator.__proto__.vendor` will throw here\n      utils.cache.Reflect.apply(...arguments)\n      return value\n    }\n  })\n})"},"_mainFunction":"(utils, { opts }) => {\n        if (!window.chrome) {\n          // Use the exact property descriptor found in headful Chrome\n          // fetch it via `Object.getOwnPropertyDescriptor(window, 'chrome')`\n          Object.defineProperty(window, 'chrome', {\n            writable: true,\n            enumerable: true,\n            configurable: false, // note!\n            value: {} // We'll extend that later\n          })\n        }\n\n        // That means we're running headful and don't need to mock anything\n        if ('loadTimes' in window.chrome) {\n          return // Nothing to do here\n        }\n\n        // Check that the Navigation Timing API v1 + v2 is available, we need that\n        if (\n          !window.performance ||\n          !window.performance.timing ||\n          !window.PerformancePaintTiming\n        ) {\n          return\n        }\n\n        const { performance } = window\n\n        // Some stuff is not available on about:blank as it requires a navigation to occur,\n        // let's harden the code to not fail then:\n        const ntEntryFallback = {\n          nextHopProtocol: 'h2',\n          type: 'other'\n        }\n\n        // The API exposes some funky info regarding the connection\n        const protocolInfo = {\n          get connectionInfo() {\n            const ntEntry =\n              performance.getEntriesByType('navigation')[0] || ntEntryFallback\n            return ntEntry.nextHopProtocol\n          },\n          get npnNegotiatedProtocol() {\n            // NPN is deprecated in favor of ALPN, but this implementation returns the\n            // HTTP/2 or HTTP2+QUIC/39 requests negotiated via ALPN.\n            const ntEntry =\n              performance.getEntriesByType('navigation')[0] || ntEntryFallback\n            return ['h2', 'hq'].includes(ntEntry.nextHopProtocol)\n              ? ntEntry.nextHopProtocol\n              : 'unknown'\n          },\n          get navigationType() {\n            const ntEntry =\n              performance.getEntriesByType('navigation')[0] || ntEntryFallback\n            return ntEntry.type\n          },\n          get wasAlternateProtocolAvailable() {\n            // The Alternate-Protocol header is deprecated in favor of Alt-Svc\n            // (https://www.mnot.net/blog/2016/03/09/alt-svc), so technically this\n            // should always return false.\n            return false\n          },\n          get wasFetchedViaSpdy() {\n            // SPDY is deprecated in favor of HTTP/2, but this implementation returns\n            // true for HTTP/2 or HTTP2+QUIC/39 as well.\n            const ntEntry =\n              performance.getEntriesByType('navigation')[0] || ntEntryFallback\n            return ['h2', 'hq'].includes(ntEntry.nextHopProtocol)\n          },\n          get wasNpnNegotiated() {\n            // NPN is deprecated in favor of ALPN, but this implementation returns true\n            // for HTTP/2 or HTTP2+QUIC/39 requests negotiated via ALPN.\n            const ntEntry =\n              performance.getEntriesByType('navigation')[0] || ntEntryFallback\n            return ['h2', 'hq'].includes(ntEntry.nextHopProtocol)\n          }\n        }\n\n        const { timing } = window.performance\n\n        // Truncate number to specific number of decimals, most of the `loadTimes` stuff has 3\n        function toFixed(num, fixed) {\n          var re = new RegExp('^-?\\\\d+(?:.\\\\d{0,' + (fixed || -1) + '})?')\n          return num.toString().match(re)[0]\n        }\n\n        const timingInfo = {\n          get firstPaintAfterLoadTime() {\n            // This was never actually implemented and always returns 0.\n            return 0\n          },\n          get requestTime() {\n            return timing.navigationStart / 1000\n          },\n          get startLoadTime() {\n            return timing.navigationStart / 1000\n          },\n          get commitLoadTime() {\n            return timing.responseStart / 1000\n          },\n          get finishDocumentLoadTime() {\n            return timing.domContentLoadedEventEnd / 1000\n          },\n          get finishLoadTime() {\n            return timing.loadEventEnd / 1000\n          },\n          get firstPaintTime() {\n            const fpEntry = performance.getEntriesByType('paint')[0] || {\n              startTime: timing.loadEventEnd / 1000 // Fallback if no navigation occured (`about:blank`)\n            }\n            return toFixed(\n              (fpEntry.startTime + performance.timeOrigin) / 1000,\n              3\n            )\n          }\n        }\n\n        window.chrome.loadTimes = function() {\n          return {\n            ...protocolInfo,\n            ...timingInfo\n          }\n        }\n        utils.patchToString(window.chrome.loadTimes)\n      }","_args":[{"opts":{}}]});
(({ _utilsFns, _mainFunction, _args }) => {
        // Add this point we cannot use our utililty functions as they're just strings, we need to materialize them first
        const utils = Object.fromEntries(
          Object.entries(_utilsFns).map(([key, value]) => [key, eval(value)]) // eslint-disable-line no-eval
        )
        utils.init()
        return eval(_mainFunction)(utils, ..._args) // eslint-disable-line no-eval
      })({"_utilsFns":{"init":"() => {\n  utils.preloadCache()\n}","stripProxyFromErrors":"(handler = {}) => {\n  const newHandler = {\n    setPrototypeOf: function (target, proto) {\n      if (proto === null)\n        throw new TypeError('Cannot convert object to primitive value')\n      if (Object.getPrototypeOf(target) === Object.getPrototypeOf(proto)) {\n        throw new TypeError('Cyclic __proto__ value')\n      }\n      return Reflect.setPrototypeOf(target, proto)\n    }\n  }\n  // We wrap each trap in the handler in a try/catch and modify the error stack if they throw\n  const traps = Object.getOwnPropertyNames(handler)\n  traps.forEach(trap => {\n    newHandler[trap] = function () {\n      try {\n        // Forward the call to the defined proxy handler\n        return handler[trap].apply(this, arguments || [])\n      } catch (err) {\n        // Stack traces differ per browser, we only support chromium based ones currently\n        if (!err || !err.stack || !err.stack.includes(`at `)) {\n          throw err\n        }\n\n        // When something throws within one of our traps the Proxy will show up in error stacks\n        // An earlier implementation of this code would simply strip lines with a blacklist,\n        // but it makes sense to be more surgical here and only remove lines related to our Proxy.\n        // We try to use a known \"anchor\" line for that and strip it with everything above it.\n        // If the anchor line cannot be found for some reason we fall back to our blacklist approach.\n\n        const stripWithBlacklist = (stack, stripFirstLine = true) => {\n          const blacklist = [\n            `at Reflect.${trap} `, // e.g. Reflect.get or Reflect.apply\n            `at Object.${trap} `, // e.g. Object.get or Object.apply\n            `at Object.newHandler.<computed> [as ${trap}] ` // caused by this very wrapper :-)\n          ]\n          return (\n            err.stack\n              .split('\\n')\n              // Always remove the first (file) line in the stack (guaranteed to be our proxy)\n              .filter((line, index) => !(index === 1 && stripFirstLine))\n              // Check if the line starts with one of our blacklisted strings\n              .filter(line => !blacklist.some(bl => line.trim().startsWith(bl)))\n              .join('\\n')\n          )\n        }\n\n        const stripWithAnchor = (stack, anchor) => {\n          const stackArr = stack.split('\\n')\n          anchor = anchor || `at Object.newHandler.<computed> [as ${trap}] ` // Known first Proxy line in chromium\n          const anchorIndex = stackArr.findIndex(line =>\n            line.trim().startsWith(anchor)\n          )\n          if (anchorIndex === -1) {\n            return false // 404, anchor not found\n          }\n          // Strip everything from the top until we reach the anchor line\n          // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n          stackArr.splice(1, anchorIndex)\n          return stackArr.join('\\n')\n        }\n\n        // Special cases due to our nested toString proxies\n        err.stack = err.stack.replace(\n          'at Object.toString (',\n          'at Function.toString ('\n        )\n        if ((err.stack || '').includes('at Function.toString (')) {\n          err.stack = stripWithBlacklist(err.stack, false)\n          throw err\n        }\n\n        // Try using the anchor method, fallback to blacklist if necessary\n        err.stack = stripWithAnchor(err.stack) || stripWithBlacklist(err.stack)\n\n        throw err // Re-throw our now sanitized error\n      }\n    }\n  })\n  return newHandler\n}","stripErrorWithAnchor":"(err, anchor) => {\n  const stackArr = err.stack.split('\\n')\n  const anchorIndex = stackArr.findIndex(line => line.trim().startsWith(anchor))\n  if (anchorIndex === -1) {\n    return err // 404, anchor not found\n  }\n  // Strip everything from the top until we reach the anchor line (remove anchor line as well)\n  // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n  stackArr.splice(1, anchorIndex)\n  err.stack = stackArr.join('\\n')\n  return err\n}","replaceProperty":"(obj, propName, descriptorOverrides = {}) => {\n  return Object.defineProperty(obj, propName, {\n    // Copy over the existing descriptors (writable, enumerable, configurable, etc)\n    ...(Object.getOwnPropertyDescriptor(obj, propName) || {}),\n    // Add our overrides (e.g. value, get())\n    ...descriptorOverrides\n  })\n}","preloadCache":"() => {\n  if (utils.cache) {\n    return\n  }\n  utils.cache = {\n    // Used in our proxies\n    Reflect: {\n      get: Reflect.get.bind(Reflect),\n      apply: Reflect.apply.bind(Reflect)\n    },\n    // Used in `makeNativeString`\n    nativeToStringStr: Function.toString + '' // => `function toString() { [native code] }`\n  }\n}","makeNativeString":"(name = '') => {\n  return utils.cache.nativeToStringStr.replace('toString', name || '')\n}","patchToString":"(obj, str = '') => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n      // `toString` targeted at our proxied Object detected\n      if (ctx === obj) {\n        // We either return the optional string verbatim or derive the most desired result automatically\n        return str || utils.makeNativeString(obj.name)\n      }\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","patchToStringNested":"(obj = {}) => {\n  return utils.execRecursively(obj, ['function'], utils.patchToString)\n}","redirectToString":"(proxyObj, originalObj) => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n\n      // `toString` targeted at our proxied Object detected\n      if (ctx === proxyObj) {\n        const fallback = () =>\n          originalObj && originalObj.name\n            ? utils.makeNativeString(originalObj.name)\n            : utils.makeNativeString(proxyObj.name)\n\n        // Return the toString representation of our original object if possible\n        return originalObj + '' || fallback()\n      }\n\n      if (typeof ctx === 'undefined' || ctx === null) {\n        return target.call(ctx)\n      }\n\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","replaceWithProxy":"(obj, propName, handler) => {\n  const originalObj = obj[propName]\n  const proxyObj = new Proxy(obj[propName], utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.redirectToString(proxyObj, originalObj)\n\n  return true\n}","replaceGetterWithProxy":"(obj, propName, handler) => {\n  const fn = Object.getOwnPropertyDescriptor(obj, propName).get\n  const fnStr = fn.toString() // special getter function string\n  const proxyObj = new Proxy(fn, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { get: proxyObj })\n  utils.patchToString(proxyObj, fnStr)\n\n  return true\n}","mockWithProxy":"(obj, propName, pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.patchToString(proxyObj)\n\n  return true\n}","createProxy":"(pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n  utils.patchToString(proxyObj)\n\n  return proxyObj\n}","splitObjPath":"objPath => ({\n  // Remove last dot entry (property) ==> `HTMLMediaElement.prototype`\n  objName: objPath.split('.').slice(0, -1).join('.'),\n  // Extract last dot entry ==> `canPlayType`\n  propName: objPath.split('.').slice(-1)[0]\n})","replaceObjPathWithProxy":"(objPath, handler) => {\n  const { objName, propName } = utils.splitObjPath(objPath)\n  const obj = eval(objName) // eslint-disable-line no-eval\n  return utils.replaceWithProxy(obj, propName, handler)\n}","execRecursively":"(obj = {}, typeFilter = [], fn) => {\n  function recurse(obj) {\n    for (const key in obj) {\n      if (obj[key] === undefined) {\n        continue\n      }\n      if (obj[key] && typeof obj[key] === 'object') {\n        recurse(obj[key])\n      } else {\n        if (obj[key] && typeFilter.includes(typeof obj[key])) {\n          fn.call(this, obj[key])\n        }\n      }\n    }\n  }\n  recurse(obj)\n  return obj\n}","stringifyFns":"(fnObj = { hello: () => 'world' }) => {\n  // Object.fromEntries() ponyfill (in 6 lines) - supported only in Node v12+, modern browsers are fine\n  // https://github.com/feross/fromentries\n  function fromEntries(iterable) {\n    return [...iterable].reduce((obj, [key, val]) => {\n      obj[key] = val\n      return obj\n    }, {})\n  }\n  return (Object.fromEntries || fromEntries)(\n    Object.entries(fnObj)\n      .filter(([key, value]) => typeof value === 'function')\n      .map(([key, value]) => [key, value.toString()]) // eslint-disable-line no-eval\n  )\n}","materializeFns":"(fnStrObj = { hello: \"() => 'world'\" }) => {\n  return Object.fromEntries(\n    Object.entries(fnStrObj).map(([key, value]) => {\n      if (value.startsWith('function')) {\n        // some trickery is needed to make oldschool functions work :-)\n        return [key, eval(`() => ${value}`)()] // eslint-disable-line no-eval\n      } else {\n        // arrow functions just work\n        return [key, eval(value)] // eslint-disable-line no-eval\n      }\n    })\n  )\n}","makeHandler":"() => ({\n  // Used by simple `navigator` getter evasions\n  getterValue: value => ({\n    apply(target, ctx, args) {\n      // Let's fetch the value first, to trigger and escalate potential errors\n      // Illegal invocations like `navigator.__proto__.vendor` will throw here\n      utils.cache.Reflect.apply(...arguments)\n      return value\n    }\n  })\n})"},"_mainFunction":"(utils, { opts, STATIC_DATA }) => {\n        if (!window.chrome) {\n          // Use the exact property descriptor found in headful Chrome\n          // fetch it via `Object.getOwnPropertyDescriptor(window, 'chrome')`\n          Object.defineProperty(window, 'chrome', {\n            writable: true,\n            enumerable: true,\n            configurable: false, // note!\n            value: {} // We'll extend that later\n          })\n        }\n\n        // That means we're running headful and don't need to mock anything\n        const existsAlready = 'runtime' in window.chrome\n        // `chrome.runtime` is only exposed on secure origins\n        const isNotSecure = !window.location.protocol.startsWith('https')\n        if (existsAlready || (isNotSecure && !opts.runOnInsecureOrigins)) {\n          return // Nothing to do here\n        }\n\n        window.chrome.runtime = {\n          // There's a bunch of static data in that property which doesn't seem to change,\n          // we should periodically check for updates: `JSON.stringify(window.chrome.runtime, null, 2)`\n          ...STATIC_DATA,\n          // `chrome.runtime.id` is extension related and returns undefined in Chrome\n          get id() {\n            return undefined\n          },\n          // These two require more sophisticated mocks\n          connect: null,\n          sendMessage: null\n        }\n\n        const makeCustomRuntimeErrors = (preamble, method, extensionId) => ({\n          NoMatchingSignature: new TypeError(\n            preamble + `No matching signature.`\n          ),\n          MustSpecifyExtensionID: new TypeError(\n            preamble +\n              `${method} called from a webpage must specify an Extension ID (string) for its first argument.`\n          ),\n          InvalidExtensionID: new TypeError(\n            preamble + `Invalid extension id: '${extensionId}'`\n          )\n        })\n\n        // Valid Extension IDs are 32 characters in length and use the letter `a` to `p`:\n        // https://source.chromium.org/chromium/chromium/src/+/master:components/crx_file/id_util.cc;drc=14a055ccb17e8c8d5d437fe080faba4c6f07beac;l=90\n        const isValidExtensionID = str =>\n          str.length === 32 && str.toLowerCase().match(/^[a-p]+$/)\n\n        /** Mock `chrome.runtime.sendMessage` */\n        const sendMessageHandler = {\n          apply: function(target, ctx, args) {\n            const [extensionId, options, responseCallback] = args || []\n\n            // Define custom errors\n            const errorPreamble = `Error in invocation of runtime.sendMessage(optional string extensionId, any message, optional object options, optional function responseCallback): `\n            const Errors = makeCustomRuntimeErrors(\n              errorPreamble,\n              `chrome.runtime.sendMessage()`,\n              extensionId\n            )\n\n            // Check if the call signature looks ok\n            const noArguments = args.length === 0\n            const tooManyArguments = args.length > 4\n            const incorrectOptions = options && typeof options !== 'object'\n            const incorrectResponseCallback =\n              responseCallback && typeof responseCallback !== 'function'\n            if (\n              noArguments ||\n              tooManyArguments ||\n              incorrectOptions ||\n              incorrectResponseCallback\n            ) {\n              throw Errors.NoMatchingSignature\n            }\n\n            // At least 2 arguments are required before we even validate the extension ID\n            if (args.length < 2) {\n              throw Errors.MustSpecifyExtensionID\n            }\n\n            // Now let's make sure we got a string as extension ID\n            if (typeof extensionId !== 'string') {\n              throw Errors.NoMatchingSignature\n            }\n\n            if (!isValidExtensionID(extensionId)) {\n              throw Errors.InvalidExtensionID\n            }\n\n            return undefined // Normal behavior\n          }\n        }\n        utils.mockWithProxy(\n          window.chrome.runtime,\n          'sendMessage',\n          function sendMessage() {},\n          sendMessageHandler\n        )\n\n        /**\n         * Mock `chrome.runtime.connect`\n         *\n         * @see https://developer.chrome.com/apps/runtime#method-connect\n         */\n        const connectHandler = {\n          apply: function(target, ctx, args) {\n            const [extensionId, connectInfo] = args || []\n\n            // Define custom errors\n            const errorPreamble = `Error in invocation of runtime.connect(optional string extensionId, optional object connectInfo): `\n            const Errors = makeCustomRuntimeErrors(\n              errorPreamble,\n              `chrome.runtime.connect()`,\n              extensionId\n            )\n\n            // Behavior differs a bit from sendMessage:\n            const noArguments = args.length === 0\n            const emptyStringArgument = args.length === 1 && extensionId === ''\n            if (noArguments || emptyStringArgument) {\n              throw Errors.MustSpecifyExtensionID\n            }\n\n            const tooManyArguments = args.length > 2\n            const incorrectConnectInfoType =\n              connectInfo && typeof connectInfo !== 'object'\n\n            if (tooManyArguments || incorrectConnectInfoType) {\n              throw Errors.NoMatchingSignature\n            }\n\n            const extensionIdIsString = typeof extensionId === 'string'\n            if (extensionIdIsString && extensionId === '') {\n              throw Errors.MustSpecifyExtensionID\n            }\n            if (extensionIdIsString && !isValidExtensionID(extensionId)) {\n              throw Errors.InvalidExtensionID\n            }\n\n            // There's another edge-case here: extensionId is optional so we might find a connectInfo object as first param, which we need to validate\n            const validateConnectInfo = ci => {\n              // More than a first param connectInfo as been provided\n              if (args.length > 1) {\n                throw Errors.NoMatchingSignature\n              }\n              // An empty connectInfo has been provided\n              if (Object.keys(ci).length === 0) {\n                throw Errors.MustSpecifyExtensionID\n              }\n              // Loop over all connectInfo props an check them\n              Object.entries(ci).forEach(([k, v]) => {\n                const isExpected = ['name', 'includeTlsChannelId'].includes(k)\n                if (!isExpected) {\n                  throw new TypeError(\n                    errorPreamble + `Unexpected property: '${k}'.`\n                  )\n                }\n                const MismatchError = (propName, expected, found) =>\n                  TypeError(\n                    errorPreamble +\n                      `Error at property '${propName}': Invalid type: expected ${expected}, found ${found}.`\n                  )\n                if (k === 'name' && typeof v !== 'string') {\n                  throw MismatchError(k, 'string', typeof v)\n                }\n                if (k === 'includeTlsChannelId' && typeof v !== 'boolean') {\n                  throw MismatchError(k, 'boolean', typeof v)\n                }\n              })\n            }\n            if (typeof extensionId === 'object') {\n              validateConnectInfo(extensionId)\n              throw Errors.MustSpecifyExtensionID\n            }\n\n            // Unfortunately even when the connect fails Chrome will return an object with methods we need to mock as well\n            return utils.patchToStringNested(makeConnectResponse())\n          }\n        }\n        utils.mockWithProxy(\n          window.chrome.runtime,\n          'connect',\n          function connect() {},\n          connectHandler\n        )\n\n        function makeConnectResponse() {\n          const onSomething = () => ({\n            addListener: function addListener() {},\n            dispatch: function dispatch() {},\n            hasListener: function hasListener() {},\n            hasListeners: function hasListeners() {\n              return false\n            },\n            removeListener: function removeListener() {}\n          })\n\n          const response = {\n            name: '',\n            sender: undefined,\n            disconnect: function disconnect() {},\n            onDisconnect: onSomething(),\n            onMessage: onSomething(),\n            postMessage: function postMessage() {\n              if (!arguments.length) {\n                throw new TypeError(`Insufficient number of arguments.`)\n              }\n              throw new Error(`Attempting to use a disconnected port object`)\n            }\n          }\n          return response\n        }\n      }","_args":[{"opts":{"runOnInsecureOrigins":false},"STATIC_DATA":{"OnInstalledReason":{"CHROME_UPDATE":"chrome_update","INSTALL":"install","SHARED_MODULE_UPDATE":"shared_module_update","UPDATE":"update"},"OnRestartRequiredReason":{"APP_UPDATE":"app_update","OS_UPDATE":"os_update","PERIODIC":"periodic"},"PlatformArch":{"ARM":"arm","ARM64":"arm64","MIPS":"mips","MIPS64":"mips64","X86_32":"x86-32","X86_64":"x86-64"},"PlatformNaclArch":{"ARM":"arm","MIPS":"mips","MIPS64":"mips64","X86_32":"x86-32","X86_64":"x86-64"},"PlatformOs":{"ANDROID":"android","CROS":"cros","LINUX":"linux","MAC":"mac","OPENBSD":"openbsd","WIN":"win"},"RequestUpdateCheckStatus":{"NO_UPDATE":"no_update","THROTTLED":"throttled","UPDATE_AVAILABLE":"update_available"}}}]});
(({ _utilsFns, _mainFunction, _args }) => {
        // Add this point we cannot use our utililty functions as they're just strings, we need to materialize them first
        const utils = Object.fromEntries(
          Object.entries(_utilsFns).map(([key, value]) => [key, eval(value)]) // eslint-disable-line no-eval
        )
        utils.init()
        return eval(_mainFunction)(utils, ..._args) // eslint-disable-line no-eval
      })({"_utilsFns":{"init":"() => {\n  utils.preloadCache()\n}","stripProxyFromErrors":"(handler = {}) => {\n  const newHandler = {\n    setPrototypeOf: function (target, proto) {\n      if (proto === null)\n        throw new TypeError('Cannot convert object to primitive value')\n      if (Object.getPrototypeOf(target) === Object.getPrototypeOf(proto)) {\n        throw new TypeError('Cyclic __proto__ value')\n      }\n      return Reflect.setPrototypeOf(target, proto)\n    }\n  }\n  // We wrap each trap in the handler in a try/catch and modify the error stack if they throw\n  const traps = Object.getOwnPropertyNames(handler)\n  traps.forEach(trap => {\n    newHandler[trap] = function () {\n      try {\n        // Forward the call to the defined proxy handler\n        return handler[trap].apply(this, arguments || [])\n      } catch (err) {\n        // Stack traces differ per browser, we only support chromium based ones currently\n        if (!err || !err.stack || !err.stack.includes(`at `)) {\n          throw err\n        }\n\n        // When something throws within one of our traps the Proxy will show up in error stacks\n        // An earlier implementation of this code would simply strip lines with a blacklist,\n        // but it makes sense to be more surgical here and only remove lines related to our Proxy.\n        // We try to use a known \"anchor\" line for that and strip it with everything above it.\n        // If the anchor line cannot be found for some reason we fall back to our blacklist approach.\n\n        const stripWithBlacklist = (stack, stripFirstLine = true) => {\n          const blacklist = [\n            `at Reflect.${trap} `, // e.g. Reflect.get or Reflect.apply\n            `at Object.${trap} `, // e.g. Object.get or Object.apply\n            `at Object.newHandler.<computed> [as ${trap}] ` // caused by this very wrapper :-)\n          ]\n          return (\n            err.stack\n              .split('\\n')\n              // Always remove the first (file) line in the stack (guaranteed to be our proxy)\n              .filter((line, index) => !(index === 1 && stripFirstLine))\n              // Check if the line starts with one of our blacklisted strings\n              .filter(line => !blacklist.some(bl => line.trim().startsWith(bl)))\n              .join('\\n')\n          )\n        }\n\n        const stripWithAnchor = (stack, anchor) => {\n          const stackArr = stack.split('\\n')\n          anchor = anchor || `at Object.newHandler.<computed> [as ${trap}] ` // Known first Proxy line in chromium\n          const anchorIndex = stackArr.findIndex(line =>\n            line.trim().startsWith(anchor)\n          )\n          if (anchorIndex === -1) {\n            return false // 404, anchor not found\n          }\n          // Strip everything from the top until we reach the anchor line\n          // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n          stackArr.splice(1, anchorIndex)\n          return stackArr.join('\\n')\n        }\n\n        // Special cases due to our nested toString proxies\n        err.stack = err.stack.replace(\n          'at Object.toString (',\n          'at Function.toString ('\n        )\n        if ((err.stack || '').includes('at Function.toString (')) {\n          err.stack = stripWithBlacklist(err.stack, false)\n          throw err\n        }\n\n        // Try using the anchor method, fallback to blacklist if necessary\n        err.stack = stripWithAnchor(err.stack) || stripWithBlacklist(err.stack)\n\n        throw err // Re-throw our now sanitized error\n      }\n    }\n  })\n  return newHandler\n}","stripErrorWithAnchor":"(err, anchor) => {\n  const stackArr = err.stack.split('\\n')\n  const anchorIndex = stackArr.findIndex(line => line.trim().startsWith(anchor))\n  if (anchorIndex === -1) {\n    return err // 404, anchor not found\n  }\n  // Strip everything from the top until we reach the anchor line (remove anchor line as well)\n  // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n  stackArr.splice(1, anchorIndex)\n  err.stack = stackArr.join('\\n')\n  return err\n}","replaceProperty":"(obj, propName, descriptorOverrides = {}) => {\n  return Object.defineProperty(obj, propName, {\n    // Copy over the existing descriptors (writable, enumerable, configurable, etc)\n    ...(Object.getOwnPropertyDescriptor(obj, propName) || {}),\n    // Add our overrides (e.g. value, get())\n    ...descriptorOverrides\n  })\n}","preloadCache":"() => {\n  if (utils.cache) {\n    return\n  }\n  utils.cache = {\n    // Used in our proxies\n    Reflect: {\n      get: Reflect.get.bind(Reflect),\n      apply: Reflect.apply.bind(Reflect)\n    },\n    // Used in `makeNativeString`\n    nativeToStringStr: Function.toString + '' // => `function toString() { [native code] }`\n  }\n}","makeNativeString":"(name = '') => {\n  return utils.cache.nativeToStringStr.replace('toString', name || '')\n}","patchToString":"(obj, str = '') => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n      // `toString` targeted at our proxied Object detected\n      if (ctx === obj) {\n        // We either return the optional string verbatim or derive the most desired result automatically\n        return str || utils.makeNativeString(obj.name)\n      }\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","patchToStringNested":"(obj = {}) => {\n  return utils.execRecursively(obj, ['function'], utils.patchToString)\n}","redirectToString":"(proxyObj, originalObj) => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n\n      // `toString` targeted at our proxied Object detected\n      if (ctx === proxyObj) {\n        const fallback = () =>\n          originalObj && originalObj.name\n            ? utils.makeNativeString(originalObj.name)\n            : utils.makeNativeString(proxyObj.name)\n\n        // Return the toString representation of our original object if possible\n        return originalObj + '' || fallback()\n      }\n\n      if (typeof ctx === 'undefined' || ctx === null) {\n        return target.call(ctx)\n      }\n\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","replaceWithProxy":"(obj, propName, handler) => {\n  const originalObj = obj[propName]\n  const proxyObj = new Proxy(obj[propName], utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.redirectToString(proxyObj, originalObj)\n\n  return true\n}","replaceGetterWithProxy":"(obj, propName, handler) => {\n  const fn = Object.getOwnPropertyDescriptor(obj, propName).get\n  const fnStr = fn.toString() // special getter function string\n  const proxyObj = new Proxy(fn, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { get: proxyObj })\n  utils.patchToString(proxyObj, fnStr)\n\n  return true\n}","mockWithProxy":"(obj, propName, pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.patchToString(proxyObj)\n\n  return true\n}","createProxy":"(pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n  utils.patchToString(proxyObj)\n\n  return proxyObj\n}","splitObjPath":"objPath => ({\n  // Remove last dot entry (property) ==> `HTMLMediaElement.prototype`\n  objName: objPath.split('.').slice(0, -1).join('.'),\n  // Extract last dot entry ==> `canPlayType`\n  propName: objPath.split('.').slice(-1)[0]\n})","replaceObjPathWithProxy":"(objPath, handler) => {\n  const { objName, propName } = utils.splitObjPath(objPath)\n  const obj = eval(objName) // eslint-disable-line no-eval\n  return utils.replaceWithProxy(obj, propName, handler)\n}","execRecursively":"(obj = {}, typeFilter = [], fn) => {\n  function recurse(obj) {\n    for (const key in obj) {\n      if (obj[key] === undefined) {\n        continue\n      }\n      if (obj[key] && typeof obj[key] === 'object') {\n        recurse(obj[key])\n      } else {\n        if (obj[key] && typeFilter.includes(typeof obj[key])) {\n          fn.call(this, obj[key])\n        }\n      }\n    }\n  }\n  recurse(obj)\n  return obj\n}","stringifyFns":"(fnObj = { hello: () => 'world' }) => {\n  // Object.fromEntries() ponyfill (in 6 lines) - supported only in Node v12+, modern browsers are fine\n  // https://github.com/feross/fromentries\n  function fromEntries(iterable) {\n    return [...iterable].reduce((obj, [key, val]) => {\n      obj[key] = val\n      return obj\n    }, {})\n  }\n  return (Object.fromEntries || fromEntries)(\n    Object.entries(fnObj)\n      .filter(([key, value]) => typeof value === 'function')\n      .map(([key, value]) => [key, value.toString()]) // eslint-disable-line no-eval\n  )\n}","materializeFns":"(fnStrObj = { hello: \"() => 'world'\" }) => {\n  return Object.fromEntries(\n    Object.entries(fnStrObj).map(([key, value]) => {\n      if (value.startsWith('function')) {\n        // some trickery is needed to make oldschool functions work :-)\n        return [key, eval(`() => ${value}`)()] // eslint-disable-line no-eval\n      } else {\n        // arrow functions just work\n        return [key, eval(value)] // eslint-disable-line no-eval\n      }\n    })\n  )\n}","makeHandler":"() => ({\n  // Used by simple `navigator` getter evasions\n  getterValue: value => ({\n    apply(target, ctx, args) {\n      // Let's fetch the value first, to trigger and escalate potential errors\n      // Illegal invocations like `navigator.__proto__.vendor` will throw here\n      utils.cache.Reflect.apply(...arguments)\n      return value\n    }\n  })\n})"},"_mainFunction":"utils => {\n      /**\n       * Input might look funky, we need to normalize it so e.g. whitespace isn't an issue for our spoofing.\n       *\n       * @example\n       * video/webm; codecs=\"vp8, vorbis\"\n       * video/mp4; codecs=\"avc1.42E01E\"\n       * audio/x-m4a;\n       * audio/ogg; codecs=\"vorbis\"\n       * @param {String} arg\n       */\n      const parseInput = arg => {\n        const [mime, codecStr] = arg.trim().split(';')\n        let codecs = []\n        if (codecStr && codecStr.includes('codecs=\"')) {\n          codecs = codecStr\n            .trim()\n            .replace(`codecs=\"`, '')\n            .replace(`\"`, '')\n            .trim()\n            .split(',')\n            .filter(x => !!x)\n            .map(x => x.trim())\n        }\n        return {\n          mime,\n          codecStr,\n          codecs\n        }\n      }\n\n      const canPlayType = {\n        // Intercept certain requests\n        apply: function(target, ctx, args) {\n          if (!args || !args.length) {\n            return target.apply(ctx, args)\n          }\n          const { mime, codecs } = parseInput(args[0])\n          // This specific mp4 codec is missing in Chromium\n          if (mime === 'video/mp4') {\n            if (codecs.includes('avc1.42E01E')) {\n              return 'probably'\n            }\n          }\n          // This mimetype is only supported if no codecs are specified\n          if (mime === 'audio/x-m4a' && !codecs.length) {\n            return 'maybe'\n          }\n\n          // This mimetype is only supported if no codecs are specified\n          if (mime === 'audio/aac' && !codecs.length) {\n            return 'probably'\n          }\n          // Everything else as usual\n          return target.apply(ctx, args)\n        }\n      }\n\n      /* global HTMLMediaElement */\n      utils.replaceWithProxy(\n        HTMLMediaElement.prototype,\n        'canPlayType',\n        canPlayType\n      )\n    }","_args":[]});
(({ _utilsFns, _mainFunction, _args }) => {
        // Add this point we cannot use our utililty functions as they're just strings, we need to materialize them first
        const utils = Object.fromEntries(
          Object.entries(_utilsFns).map(([key, value]) => [key, eval(value)]) // eslint-disable-line no-eval
        )
        utils.init()
        return eval(_mainFunction)(utils, ..._args) // eslint-disable-line no-eval
      })({"_utilsFns":{"init":"() => {\n  utils.preloadCache()\n}","stripProxyFromErrors":"(handler = {}) => {\n  const newHandler = {\n    setPrototypeOf: function (target, proto) {\n      if (proto === null)\n        throw new TypeError('Cannot convert object to primitive value')\n      if (Object.getPrototypeOf(target) === Object.getPrototypeOf(proto)) {\n        throw new TypeError('Cyclic __proto__ value')\n      }\n      return Reflect.setPrototypeOf(target, proto)\n    }\n  }\n  // We wrap each trap in the handler in a try/catch and modify the error stack if they throw\n  const traps = Object.getOwnPropertyNames(handler)\n  traps.forEach(trap => {\n    newHandler[trap] = function () {\n      try {\n        // Forward the call to the defined proxy handler\n        return handler[trap].apply(this, arguments || [])\n      } catch (err) {\n        // Stack traces differ per browser, we only support chromium based ones currently\n        if (!err || !err.stack || !err.stack.includes(`at `)) {\n          throw err\n        }\n\n        // When something throws within one of our traps the Proxy will show up in error stacks\n        // An earlier implementation of this code would simply strip lines with a blacklist,\n        // but it makes sense to be more surgical here and only remove lines related to our Proxy.\n        // We try to use a known \"anchor\" line for that and strip it with everything above it.\n        // If the anchor line cannot be found for some reason we fall back to our blacklist approach.\n\n        const stripWithBlacklist = (stack, stripFirstLine = true) => {\n          const blacklist = [\n            `at Reflect.${trap} `, // e.g. Reflect.get or Reflect.apply\n            `at Object.${trap} `, // e.g. Object.get or Object.apply\n            `at Object.newHandler.<computed> [as ${trap}] ` // caused by this very wrapper :-)\n          ]\n          return (\n            err.stack\n              .split('\\n')\n              // Always remove the first (file) line in the stack (guaranteed to be our proxy)\n              .filter((line, index) => !(index === 1 && stripFirstLine))\n              // Check if the line starts with one of our blacklisted strings\n              .filter(line => !blacklist.some(bl => line.trim().startsWith(bl)))\n              .join('\\n')\n          )\n        }\n\n        const stripWithAnchor = (stack, anchor) => {\n          const stackArr = stack.split('\\n')\n          anchor = anchor || `at Object.newHandler.<computed> [as ${trap}] ` // Known first Proxy line in chromium\n          const anchorIndex = stackArr.findIndex(line =>\n            line.trim().startsWith(anchor)\n          )\n          if (anchorIndex === -1) {\n            return false // 404, anchor not found\n          }\n          // Strip everything from the top until we reach the anchor line\n          // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n          stackArr.splice(1, anchorIndex)\n          return stackArr.join('\\n')\n        }\n\n        // Special cases due to our nested toString proxies\n        err.stack = err.stack.replace(\n          'at Object.toString (',\n          'at Function.toString ('\n        )\n        if ((err.stack || '').includes('at Function.toString (')) {\n          err.stack = stripWithBlacklist(err.stack, false)\n          throw err\n        }\n\n        // Try using the anchor method, fallback to blacklist if necessary\n        err.stack = stripWithAnchor(err.stack) || stripWithBlacklist(err.stack)\n\n        throw err // Re-throw our now sanitized error\n      }\n    }\n  })\n  return newHandler\n}","stripErrorWithAnchor":"(err, anchor) => {\n  const stackArr = err.stack.split('\\n')\n  const anchorIndex = stackArr.findIndex(line => line.trim().startsWith(anchor))\n  if (anchorIndex === -1) {\n    return err // 404, anchor not found\n  }\n  // Strip everything from the top until we reach the anchor line (remove anchor line as well)\n  // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n  stackArr.splice(1, anchorIndex)\n  err.stack = stackArr.join('\\n')\n  return err\n}","replaceProperty":"(obj, propName, descriptorOverrides = {}) => {\n  return Object.defineProperty(obj, propName, {\n    // Copy over the existing descriptors (writable, enumerable, configurable, etc)\n    ...(Object.getOwnPropertyDescriptor(obj, propName) || {}),\n    // Add our overrides (e.g. value, get())\n    ...descriptorOverrides\n  })\n}","preloadCache":"() => {\n  if (utils.cache) {\n    return\n  }\n  utils.cache = {\n    // Used in our proxies\n    Reflect: {\n      get: Reflect.get.bind(Reflect),\n      apply: Reflect.apply.bind(Reflect)\n    },\n    // Used in `makeNativeString`\n    nativeToStringStr: Function.toString + '' // => `function toString() { [native code] }`\n  }\n}","makeNativeString":"(name = '') => {\n  return utils.cache.nativeToStringStr.replace('toString', name || '')\n}","patchToString":"(obj, str = '') => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n      // `toString` targeted at our proxied Object detected\n      if (ctx === obj) {\n        // We either return the optional string verbatim or derive the most desired result automatically\n        return str || utils.makeNativeString(obj.name)\n      }\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","patchToStringNested":"(obj = {}) => {\n  return utils.execRecursively(obj, ['function'], utils.patchToString)\n}","redirectToString":"(proxyObj, originalObj) => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n\n      // `toString` targeted at our proxied Object detected\n      if (ctx === proxyObj) {\n        const fallback = () =>\n          originalObj && originalObj.name\n            ? utils.makeNativeString(originalObj.name)\n            : utils.makeNativeString(proxyObj.name)\n\n        // Return the toString representation of our original object if possible\n        return originalObj + '' || fallback()\n      }\n\n      if (typeof ctx === 'undefined' || ctx === null) {\n        return target.call(ctx)\n      }\n\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","replaceWithProxy":"(obj, propName, handler) => {\n  const originalObj = obj[propName]\n  const proxyObj = new Proxy(obj[propName], utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.redirectToString(proxyObj, originalObj)\n\n  return true\n}","replaceGetterWithProxy":"(obj, propName, handler) => {\n  const fn = Object.getOwnPropertyDescriptor(obj, propName).get\n  const fnStr = fn.toString() // special getter function string\n  const proxyObj = new Proxy(fn, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { get: proxyObj })\n  utils.patchToString(proxyObj, fnStr)\n\n  return true\n}","mockWithProxy":"(obj, propName, pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.patchToString(proxyObj)\n\n  return true\n}","createProxy":"(pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n  utils.patchToString(proxyObj)\n\n  return proxyObj\n}","splitObjPath":"objPath => ({\n  // Remove last dot entry (property) ==> `HTMLMediaElement.prototype`\n  objName: objPath.split('.').slice(0, -1).join('.'),\n  // Extract last dot entry ==> `canPlayType`\n  propName: objPath.split('.').slice(-1)[0]\n})","replaceObjPathWithProxy":"(objPath, handler) => {\n  const { objName, propName } = utils.splitObjPath(objPath)\n  const obj = eval(objName) // eslint-disable-line no-eval\n  return utils.replaceWithProxy(obj, propName, handler)\n}","execRecursively":"(obj = {}, typeFilter = [], fn) => {\n  function recurse(obj) {\n    for (const key in obj) {\n      if (obj[key] === undefined) {\n        continue\n      }\n      if (obj[key] && typeof obj[key] === 'object') {\n        recurse(obj[key])\n      } else {\n        if (obj[key] && typeFilter.includes(typeof obj[key])) {\n          fn.call(this, obj[key])\n        }\n      }\n    }\n  }\n  recurse(obj)\n  return obj\n}","stringifyFns":"(fnObj = { hello: () => 'world' }) => {\n  // Object.fromEntries() ponyfill (in 6 lines) - supported only in Node v12+, modern browsers are fine\n  // https://github.com/feross/fromentries\n  function fromEntries(iterable) {\n    return [...iterable].reduce((obj, [key, val]) => {\n      obj[key] = val\n      return obj\n    }, {})\n  }\n  return (Object.fromEntries || fromEntries)(\n    Object.entries(fnObj)\n      .filter(([key, value]) => typeof value === 'function')\n      .map(([key, value]) => [key, value.toString()]) // eslint-disable-line no-eval\n  )\n}","materializeFns":"(fnStrObj = { hello: \"() => 'world'\" }) => {\n  return Object.fromEntries(\n    Object.entries(fnStrObj).map(([key, value]) => {\n      if (value.startsWith('function')) {\n        // some trickery is needed to make oldschool functions work :-)\n        return [key, eval(`() => ${value}`)()] // eslint-disable-line no-eval\n      } else {\n        // arrow functions just work\n        return [key, eval(value)] // eslint-disable-line no-eval\n      }\n    })\n  )\n}","makeHandler":"() => ({\n  // Used by simple `navigator` getter evasions\n  getterValue: value => ({\n    apply(target, ctx, args) {\n      // Let's fetch the value first, to trigger and escalate potential errors\n      // Illegal invocations like `navigator.__proto__.vendor` will throw here\n      utils.cache.Reflect.apply(...arguments)\n      return value\n    }\n  })\n})"},"_mainFunction":"(utils, { opts }) => {\n        utils.replaceGetterWithProxy(\n          Object.getPrototypeOf(navigator),\n          'hardwareConcurrency',\n          utils.makeHandler().getterValue(opts.hardwareConcurrency)\n        )\n      }","_args":[{"opts":{"hardwareConcurrency":4}}]});
(({ _utilsFns, _mainFunction, _args }) => {
        // Add this point we cannot use our utililty functions as they're just strings, we need to materialize them first
        const utils = Object.fromEntries(
          Object.entries(_utilsFns).map(([key, value]) => [key, eval(value)]) // eslint-disable-line no-eval
        )
        utils.init()
        return eval(_mainFunction)(utils, ..._args) // eslint-disable-line no-eval
      })({"_utilsFns":{"init":"() => {\n  utils.preloadCache()\n}","stripProxyFromErrors":"(handler = {}) => {\n  const newHandler = {\n    setPrototypeOf: function (target, proto) {\n      if (proto === null)\n        throw new TypeError('Cannot convert object to primitive value')\n      if (Object.getPrototypeOf(target) === Object.getPrototypeOf(proto)) {\n        throw new TypeError('Cyclic __proto__ value')\n      }\n      return Reflect.setPrototypeOf(target, proto)\n    }\n  }\n  // We wrap each trap in the handler in a try/catch and modify the error stack if they throw\n  const traps = Object.getOwnPropertyNames(handler)\n  traps.forEach(trap => {\n    newHandler[trap] = function () {\n      try {\n        // Forward the call to the defined proxy handler\n        return handler[trap].apply(this, arguments || [])\n      } catch (err) {\n        // Stack traces differ per browser, we only support chromium based ones currently\n        if (!err || !err.stack || !err.stack.includes(`at `)) {\n          throw err\n        }\n\n        // When something throws within one of our traps the Proxy will show up in error stacks\n        // An earlier implementation of this code would simply strip lines with a blacklist,\n        // but it makes sense to be more surgical here and only remove lines related to our Proxy.\n        // We try to use a known \"anchor\" line for that and strip it with everything above it.\n        // If the anchor line cannot be found for some reason we fall back to our blacklist approach.\n\n        const stripWithBlacklist = (stack, stripFirstLine = true) => {\n          const blacklist = [\n            `at Reflect.${trap} `, // e.g. Reflect.get or Reflect.apply\n            `at Object.${trap} `, // e.g. Object.get or Object.apply\n            `at Object.newHandler.<computed> [as ${trap}] ` // caused by this very wrapper :-)\n          ]\n          return (\n            err.stack\n              .split('\\n')\n              // Always remove the first (file) line in the stack (guaranteed to be our proxy)\n              .filter((line, index) => !(index === 1 && stripFirstLine))\n              // Check if the line starts with one of our blacklisted strings\n              .filter(line => !blacklist.some(bl => line.trim().startsWith(bl)))\n              .join('\\n')\n          )\n        }\n\n        const stripWithAnchor = (stack, anchor) => {\n          const stackArr = stack.split('\\n')\n          anchor = anchor || `at Object.newHandler.<computed> [as ${trap}] ` // Known first Proxy line in chromium\n          const anchorIndex = stackArr.findIndex(line =>\n            line.trim().startsWith(anchor)\n          )\n          if (anchorIndex === -1) {\n            return false // 404, anchor not found\n          }\n          // Strip everything from the top until we reach the anchor line\n          // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n          stackArr.splice(1, anchorIndex)\n          return stackArr.join('\\n')\n        }\n\n        // Special cases due to our nested toString proxies\n        err.stack = err.stack.replace(\n          'at Object.toString (',\n          'at Function.toString ('\n        )\n        if ((err.stack || '').includes('at Function.toString (')) {\n          err.stack = stripWithBlacklist(err.stack, false)\n          throw err\n        }\n\n        // Try using the anchor method, fallback to blacklist if necessary\n        err.stack = stripWithAnchor(err.stack) || stripWithBlacklist(err.stack)\n\n        throw err // Re-throw our now sanitized error\n      }\n    }\n  })\n  return newHandler\n}","stripErrorWithAnchor":"(err, anchor) => {\n  const stackArr = err.stack.split('\\n')\n  const anchorIndex = stackArr.findIndex(line => line.trim().startsWith(anchor))\n  if (anchorIndex === -1) {\n    return err // 404, anchor not found\n  }\n  // Strip everything from the top until we reach the anchor line (remove anchor line as well)\n  // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n  stackArr.splice(1, anchorIndex)\n  err.stack = stackArr.join('\\n')\n  return err\n}","replaceProperty":"(obj, propName, descriptorOverrides = {}) => {\n  return Object.defineProperty(obj, propName, {\n    // Copy over the existing descriptors (writable, enumerable, configurable, etc)\n    ...(Object.getOwnPropertyDescriptor(obj, propName) || {}),\n    // Add our overrides (e.g. value, get())\n    ...descriptorOverrides\n  })\n}","preloadCache":"() => {\n  if (utils.cache) {\n    return\n  }\n  utils.cache = {\n    // Used in our proxies\n    Reflect: {\n      get: Reflect.get.bind(Reflect),\n      apply: Reflect.apply.bind(Reflect)\n    },\n    // Used in `makeNativeString`\n    nativeToStringStr: Function.toString + '' // => `function toString() { [native code] }`\n  }\n}","makeNativeString":"(name = '') => {\n  return utils.cache.nativeToStringStr.replace('toString', name || '')\n}","patchToString":"(obj, str = '') => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n      // `toString` targeted at our proxied Object detected\n      if (ctx === obj) {\n        // We either return the optional string verbatim or derive the most desired result automatically\n        return str || utils.makeNativeString(obj.name)\n      }\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","patchToStringNested":"(obj = {}) => {\n  return utils.execRecursively(obj, ['function'], utils.patchToString)\n}","redirectToString":"(proxyObj, originalObj) => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n\n      // `toString` targeted at our proxied Object detected\n      if (ctx === proxyObj) {\n        const fallback = () =>\n          originalObj && originalObj.name\n            ? utils.makeNativeString(originalObj.name)\n            : utils.makeNativeString(proxyObj.name)\n\n        // Return the toString representation of our original object if possible\n        return originalObj + '' || fallback()\n      }\n\n      if (typeof ctx === 'undefined' || ctx === null) {\n        return target.call(ctx)\n      }\n\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","replaceWithProxy":"(obj, propName, handler) => {\n  const originalObj = obj[propName]\n  const proxyObj = new Proxy(obj[propName], utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.redirectToString(proxyObj, originalObj)\n\n  return true\n}","replaceGetterWithProxy":"(obj, propName, handler) => {\n  const fn = Object.getOwnPropertyDescriptor(obj, propName).get\n  const fnStr = fn.toString() // special getter function string\n  const proxyObj = new Proxy(fn, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { get: proxyObj })\n  utils.patchToString(proxyObj, fnStr)\n\n  return true\n}","mockWithProxy":"(obj, propName, pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.patchToString(proxyObj)\n\n  return true\n}","createProxy":"(pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n  utils.patchToString(proxyObj)\n\n  return proxyObj\n}","splitObjPath":"objPath => ({\n  // Remove last dot entry (property) ==> `HTMLMediaElement.prototype`\n  objName: objPath.split('.').slice(0, -1).join('.'),\n  // Extract last dot entry ==> `canPlayType`\n  propName: objPath.split('.').slice(-1)[0]\n})","replaceObjPathWithProxy":"(objPath, handler) => {\n  const { objName, propName } = utils.splitObjPath(objPath)\n  const obj = eval(objName) // eslint-disable-line no-eval\n  return utils.replaceWithProxy(obj, propName, handler)\n}","execRecursively":"(obj = {}, typeFilter = [], fn) => {\n  function recurse(obj) {\n    for (const key in obj) {\n      if (obj[key] === undefined) {\n        continue\n      }\n      if (obj[key] && typeof obj[key] === 'object') {\n        recurse(obj[key])\n      } else {\n        if (obj[key] && typeFilter.includes(typeof obj[key])) {\n          fn.call(this, obj[key])\n        }\n      }\n    }\n  }\n  recurse(obj)\n  return obj\n}","stringifyFns":"(fnObj = { hello: () => 'world' }) => {\n  // Object.fromEntries() ponyfill (in 6 lines) - supported only in Node v12+, modern browsers are fine\n  // https://github.com/feross/fromentries\n  function fromEntries(iterable) {\n    return [...iterable].reduce((obj, [key, val]) => {\n      obj[key] = val\n      return obj\n    }, {})\n  }\n  return (Object.fromEntries || fromEntries)(\n    Object.entries(fnObj)\n      .filter(([key, value]) => typeof value === 'function')\n      .map(([key, value]) => [key, value.toString()]) // eslint-disable-line no-eval\n  )\n}","materializeFns":"(fnStrObj = { hello: \"() => 'world'\" }) => {\n  return Object.fromEntries(\n    Object.entries(fnStrObj).map(([key, value]) => {\n      if (value.startsWith('function')) {\n        // some trickery is needed to make oldschool functions work :-)\n        return [key, eval(`() => ${value}`)()] // eslint-disable-line no-eval\n      } else {\n        // arrow functions just work\n        return [key, eval(value)] // eslint-disable-line no-eval\n      }\n    })\n  )\n}","makeHandler":"() => ({\n  // Used by simple `navigator` getter evasions\n  getterValue: value => ({\n    apply(target, ctx, args) {\n      // Let's fetch the value first, to trigger and escalate potential errors\n      // Illegal invocations like `navigator.__proto__.vendor` will throw here\n      utils.cache.Reflect.apply(...arguments)\n      return value\n    }\n  })\n})"},"_mainFunction":"(utils, { opts }) => {\n        const languages = opts.languages.length\n          ? opts.languages\n          : ['en-US', 'en']\n        utils.replaceGetterWithProxy(\n          Object.getPrototypeOf(navigator),\n          'languages',\n          utils.makeHandler().getterValue(Object.freeze([...languages]))\n        )\n      }","_args":[{"opts":{"languages":[]}}]});
(({ _utilsFns, _mainFunction, _args }) => {
        // Add this point we cannot use our utililty functions as they're just strings, we need to materialize them first
        const utils = Object.fromEntries(
          Object.entries(_utilsFns).map(([key, value]) => [key, eval(value)]) // eslint-disable-line no-eval
        )
        utils.init()
        return eval(_mainFunction)(utils, ..._args) // eslint-disable-line no-eval
      })({"_utilsFns":{"init":"() => {\n  utils.preloadCache()\n}","stripProxyFromErrors":"(handler = {}) => {\n  const newHandler = {\n    setPrototypeOf: function (target, proto) {\n      if (proto === null)\n        throw new TypeError('Cannot convert object to primitive value')\n      if (Object.getPrototypeOf(target) === Object.getPrototypeOf(proto)) {\n        throw new TypeError('Cyclic __proto__ value')\n      }\n      return Reflect.setPrototypeOf(target, proto)\n    }\n  }\n  // We wrap each trap in the handler in a try/catch and modify the error stack if they throw\n  const traps = Object.getOwnPropertyNames(handler)\n  traps.forEach(trap => {\n    newHandler[trap] = function () {\n      try {\n        // Forward the call to the defined proxy handler\n        return handler[trap].apply(this, arguments || [])\n      } catch (err) {\n        // Stack traces differ per browser, we only support chromium based ones currently\n        if (!err || !err.stack || !err.stack.includes(`at `)) {\n          throw err\n        }\n\n        // When something throws within one of our traps the Proxy will show up in error stacks\n        // An earlier implementation of this code would simply strip lines with a blacklist,\n        // but it makes sense to be more surgical here and only remove lines related to our Proxy.\n        // We try to use a known \"anchor\" line for that and strip it with everything above it.\n        // If the anchor line cannot be found for some reason we fall back to our blacklist approach.\n\n        const stripWithBlacklist = (stack, stripFirstLine = true) => {\n          const blacklist = [\n            `at Reflect.${trap} `, // e.g. Reflect.get or Reflect.apply\n            `at Object.${trap} `, // e.g. Object.get or Object.apply\n            `at Object.newHandler.<computed> [as ${trap}] ` // caused by this very wrapper :-)\n          ]\n          return (\n            err.stack\n              .split('\\n')\n              // Always remove the first (file) line in the stack (guaranteed to be our proxy)\n              .filter((line, index) => !(index === 1 && stripFirstLine))\n              // Check if the line starts with one of our blacklisted strings\n              .filter(line => !blacklist.some(bl => line.trim().startsWith(bl)))\n              .join('\\n')\n          )\n        }\n\n        const stripWithAnchor = (stack, anchor) => {\n          const stackArr = stack.split('\\n')\n          anchor = anchor || `at Object.newHandler.<computed> [as ${trap}] ` // Known first Proxy line in chromium\n          const anchorIndex = stackArr.findIndex(line =>\n            line.trim().startsWith(anchor)\n          )\n          if (anchorIndex === -1) {\n            return false // 404, anchor not found\n          }\n          // Strip everything from the top until we reach the anchor line\n          // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n          stackArr.splice(1, anchorIndex)\n          return stackArr.join('\\n')\n        }\n\n        // Special cases due to our nested toString proxies\n        err.stack = err.stack.replace(\n          'at Object.toString (',\n          'at Function.toString ('\n        )\n        if ((err.stack || '').includes('at Function.toString (')) {\n          err.stack = stripWithBlacklist(err.stack, false)\n          throw err\n        }\n\n        // Try using the anchor method, fallback to blacklist if necessary\n        err.stack = stripWithAnchor(err.stack) || stripWithBlacklist(err.stack)\n\n        throw err // Re-throw our now sanitized error\n      }\n    }\n  })\n  return newHandler\n}","stripErrorWithAnchor":"(err, anchor) => {\n  const stackArr = err.stack.split('\\n')\n  const anchorIndex = stackArr.findIndex(line => line.trim().startsWith(anchor))\n  if (anchorIndex === -1) {\n    return err // 404, anchor not found\n  }\n  // Strip everything from the top until we reach the anchor line (remove anchor line as well)\n  // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n  stackArr.splice(1, anchorIndex)\n  err.stack = stackArr.join('\\n')\n  return err\n}","replaceProperty":"(obj, propName, descriptorOverrides = {}) => {\n  return Object.defineProperty(obj, propName, {\n    // Copy over the existing descriptors (writable, enumerable, configurable, etc)\n    ...(Object.getOwnPropertyDescriptor(obj, propName) || {}),\n    // Add our overrides (e.g. value, get())\n    ...descriptorOverrides\n  })\n}","preloadCache":"() => {\n  if (utils.cache) {\n    return\n  }\n  utils.cache = {\n    // Used in our proxies\n    Reflect: {\n      get: Reflect.get.bind(Reflect),\n      apply: Reflect.apply.bind(Reflect)\n    },\n    // Used in `makeNativeString`\n    nativeToStringStr: Function.toString + '' // => `function toString() { [native code] }`\n  }\n}","makeNativeString":"(name = '') => {\n  return utils.cache.nativeToStringStr.replace('toString', name || '')\n}","patchToString":"(obj, str = '') => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n      // `toString` targeted at our proxied Object detected\n      if (ctx === obj) {\n        // We either return the optional string verbatim or derive the most desired result automatically\n        return str || utils.makeNativeString(obj.name)\n      }\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","patchToStringNested":"(obj = {}) => {\n  return utils.execRecursively(obj, ['function'], utils.patchToString)\n}","redirectToString":"(proxyObj, originalObj) => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n\n      // `toString` targeted at our proxied Object detected\n      if (ctx === proxyObj) {\n        const fallback = () =>\n          originalObj && originalObj.name\n            ? utils.makeNativeString(originalObj.name)\n            : utils.makeNativeString(proxyObj.name)\n\n        // Return the toString representation of our original object if possible\n        return originalObj + '' || fallback()\n      }\n\n      if (typeof ctx === 'undefined' || ctx === null) {\n        return target.call(ctx)\n      }\n\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","replaceWithProxy":"(obj, propName, handler) => {\n  const originalObj = obj[propName]\n  const proxyObj = new Proxy(obj[propName], utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.redirectToString(proxyObj, originalObj)\n\n  return true\n}","replaceGetterWithProxy":"(obj, propName, handler) => {\n  const fn = Object.getOwnPropertyDescriptor(obj, propName).get\n  const fnStr = fn.toString() // special getter function string\n  const proxyObj = new Proxy(fn, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { get: proxyObj })\n  utils.patchToString(proxyObj, fnStr)\n\n  return true\n}","mockWithProxy":"(obj, propName, pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.patchToString(proxyObj)\n\n  return true\n}","createProxy":"(pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n  utils.patchToString(proxyObj)\n\n  return proxyObj\n}","splitObjPath":"objPath => ({\n  // Remove last dot entry (property) ==> `HTMLMediaElement.prototype`\n  objName: objPath.split('.').slice(0, -1).join('.'),\n  // Extract last dot entry ==> `canPlayType`\n  propName: objPath.split('.').slice(-1)[0]\n})","replaceObjPathWithProxy":"(objPath, handler) => {\n  const { objName, propName } = utils.splitObjPath(objPath)\n  const obj = eval(objName) // eslint-disable-line no-eval\n  return utils.replaceWithProxy(obj, propName, handler)\n}","execRecursively":"(obj = {}, typeFilter = [], fn) => {\n  function recurse(obj) {\n    for (const key in obj) {\n      if (obj[key] === undefined) {\n        continue\n      }\n      if (obj[key] && typeof obj[key] === 'object') {\n        recurse(obj[key])\n      } else {\n        if (obj[key] && typeFilter.includes(typeof obj[key])) {\n          fn.call(this, obj[key])\n        }\n      }\n    }\n  }\n  recurse(obj)\n  return obj\n}","stringifyFns":"(fnObj = { hello: () => 'world' }) => {\n  // Object.fromEntries() ponyfill (in 6 lines) - supported only in Node v12+, modern browsers are fine\n  // https://github.com/feross/fromentries\n  function fromEntries(iterable) {\n    return [...iterable].reduce((obj, [key, val]) => {\n      obj[key] = val\n      return obj\n    }, {})\n  }\n  return (Object.fromEntries || fromEntries)(\n    Object.entries(fnObj)\n      .filter(([key, value]) => typeof value === 'function')\n      .map(([key, value]) => [key, value.toString()]) // eslint-disable-line no-eval\n  )\n}","materializeFns":"(fnStrObj = { hello: \"() => 'world'\" }) => {\n  return Object.fromEntries(\n    Object.entries(fnStrObj).map(([key, value]) => {\n      if (value.startsWith('function')) {\n        // some trickery is needed to make oldschool functions work :-)\n        return [key, eval(`() => ${value}`)()] // eslint-disable-line no-eval\n      } else {\n        // arrow functions just work\n        return [key, eval(value)] // eslint-disable-line no-eval\n      }\n    })\n  )\n}","makeHandler":"() => ({\n  // Used by simple `navigator` getter evasions\n  getterValue: value => ({\n    apply(target, ctx, args) {\n      // Let's fetch the value first, to trigger and escalate potential errors\n      // Illegal invocations like `navigator.__proto__.vendor` will throw here\n      utils.cache.Reflect.apply(...arguments)\n      return value\n    }\n  })\n})"},"_mainFunction":"(utils, opts) => {\n      const isSecure = document.location.protocol.startsWith('https')\n\n      // In headful on secure origins the permission should be \"default\", not \"denied\"\n      if (isSecure) {\n        utils.replaceGetterWithProxy(Notification, 'permission', {\n          apply() {\n            return 'default'\n          }\n        })\n      }\n\n      // Another weird behavior:\n      // On insecure origins in headful the state is \"denied\",\n      // whereas in headless it's \"prompt\"\n      if (!isSecure) {\n        const handler = {\n          apply(target, ctx, args) {\n            const param = (args || [])[0]\n\n            const isNotifications =\n              param && param.name && param.name === 'notifications'\n            if (!isNotifications) {\n              return utils.cache.Reflect.apply(...arguments)\n            }\n\n            return Promise.resolve(\n              Object.setPrototypeOf(\n                {\n                  state: 'denied',\n                  onchange: null\n                },\n                PermissionStatus.prototype\n              )\n            )\n          }\n        }\n        // Note: Don't use `Object.getPrototypeOf` here\n        utils.replaceWithProxy(Permissions.prototype, 'query', handler)\n      }\n    }","_args":[{}]});
(({ _utilsFns, _mainFunction, _args }) => {
        // Add this point we cannot use our utililty functions as they're just strings, we need to materialize them first
        const utils = Object.fromEntries(
          Object.entries(_utilsFns).map(([key, value]) => [key, eval(value)]) // eslint-disable-line no-eval
        )
        utils.init()
        return eval(_mainFunction)(utils, ..._args) // eslint-disable-line no-eval
      })({"_utilsFns":{"init":"() => {\n  utils.preloadCache()\n}","stripProxyFromErrors":"(handler = {}) => {\n  const newHandler = {\n    setPrototypeOf: function (target, proto) {\n      if (proto === null)\n        throw new TypeError('Cannot convert object to primitive value')\n      if (Object.getPrototypeOf(target) === Object.getPrototypeOf(proto)) {\n        throw new TypeError('Cyclic __proto__ value')\n      }\n      return Reflect.setPrototypeOf(target, proto)\n    }\n  }\n  // We wrap each trap in the handler in a try/catch and modify the error stack if they throw\n  const traps = Object.getOwnPropertyNames(handler)\n  traps.forEach(trap => {\n    newHandler[trap] = function () {\n      try {\n        // Forward the call to the defined proxy handler\n        return handler[trap].apply(this, arguments || [])\n      } catch (err) {\n        // Stack traces differ per browser, we only support chromium based ones currently\n        if (!err || !err.stack || !err.stack.includes(`at `)) {\n          throw err\n        }\n\n        // When something throws within one of our traps the Proxy will show up in error stacks\n        // An earlier implementation of this code would simply strip lines with a blacklist,\n        // but it makes sense to be more surgical here and only remove lines related to our Proxy.\n        // We try to use a known \"anchor\" line for that and strip it with everything above it.\n        // If the anchor line cannot be found for some reason we fall back to our blacklist approach.\n\n        const stripWithBlacklist = (stack, stripFirstLine = true) => {\n          const blacklist = [\n            `at Reflect.${trap} `, // e.g. Reflect.get or Reflect.apply\n            `at Object.${trap} `, // e.g. Object.get or Object.apply\n            `at Object.newHandler.<computed> [as ${trap}] ` // caused by this very wrapper :-)\n          ]\n          return (\n            err.stack\n              .split('\\n')\n              // Always remove the first (file) line in the stack (guaranteed to be our proxy)\n              .filter((line, index) => !(index === 1 && stripFirstLine))\n              // Check if the line starts with one of our blacklisted strings\n              .filter(line => !blacklist.some(bl => line.trim().startsWith(bl)))\n              .join('\\n')\n          )\n        }\n\n        const stripWithAnchor = (stack, anchor) => {\n          const stackArr = stack.split('\\n')\n          anchor = anchor || `at Object.newHandler.<computed> [as ${trap}] ` // Known first Proxy line in chromium\n          const anchorIndex = stackArr.findIndex(line =>\n            line.trim().startsWith(anchor)\n          )\n          if (anchorIndex === -1) {\n            return false // 404, anchor not found\n          }\n          // Strip everything from the top until we reach the anchor line\n          // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n          stackArr.splice(1, anchorIndex)\n          return stackArr.join('\\n')\n        }\n\n        // Special cases due to our nested toString proxies\n        err.stack = err.stack.replace(\n          'at Object.toString (',\n          'at Function.toString ('\n        )\n        if ((err.stack || '').includes('at Function.toString (')) {\n          err.stack = stripWithBlacklist(err.stack, false)\n          throw err\n        }\n\n        // Try using the anchor method, fallback to blacklist if necessary\n        err.stack = stripWithAnchor(err.stack) || stripWithBlacklist(err.stack)\n\n        throw err // Re-throw our now sanitized error\n      }\n    }\n  })\n  return newHandler\n}","stripErrorWithAnchor":"(err, anchor) => {\n  const stackArr = err.stack.split('\\n')\n  const anchorIndex = stackArr.findIndex(line => line.trim().startsWith(anchor))\n  if (anchorIndex === -1) {\n    return err // 404, anchor not found\n  }\n  // Strip everything from the top until we reach the anchor line (remove anchor line as well)\n  // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n  stackArr.splice(1, anchorIndex)\n  err.stack = stackArr.join('\\n')\n  return err\n}","replaceProperty":"(obj, propName, descriptorOverrides = {}) => {\n  return Object.defineProperty(obj, propName, {\n    // Copy over the existing descriptors (writable, enumerable, configurable, etc)\n    ...(Object.getOwnPropertyDescriptor(obj, propName) || {}),\n    // Add our overrides (e.g. value, get())\n    ...descriptorOverrides\n  })\n}","preloadCache":"() => {\n  if (utils.cache) {\n    return\n  }\n  utils.cache = {\n    // Used in our proxies\n    Reflect: {\n      get: Reflect.get.bind(Reflect),\n      apply: Reflect.apply.bind(Reflect)\n    },\n    // Used in `makeNativeString`\n    nativeToStringStr: Function.toString + '' // => `function toString() { [native code] }`\n  }\n}","makeNativeString":"(name = '') => {\n  return utils.cache.nativeToStringStr.replace('toString', name || '')\n}","patchToString":"(obj, str = '') => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n      // `toString` targeted at our proxied Object detected\n      if (ctx === obj) {\n        // We either return the optional string verbatim or derive the most desired result automatically\n        return str || utils.makeNativeString(obj.name)\n      }\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","patchToStringNested":"(obj = {}) => {\n  return utils.execRecursively(obj, ['function'], utils.patchToString)\n}","redirectToString":"(proxyObj, originalObj) => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n\n      // `toString` targeted at our proxied Object detected\n      if (ctx === proxyObj) {\n        const fallback = () =>\n          originalObj && originalObj.name\n            ? utils.makeNativeString(originalObj.name)\n            : utils.makeNativeString(proxyObj.name)\n\n        // Return the toString representation of our original object if possible\n        return originalObj + '' || fallback()\n      }\n\n      if (typeof ctx === 'undefined' || ctx === null) {\n        return target.call(ctx)\n      }\n\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","replaceWithProxy":"(obj, propName, handler) => {\n  const originalObj = obj[propName]\n  const proxyObj = new Proxy(obj[propName], utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.redirectToString(proxyObj, originalObj)\n\n  return true\n}","replaceGetterWithProxy":"(obj, propName, handler) => {\n  const fn = Object.getOwnPropertyDescriptor(obj, propName).get\n  const fnStr = fn.toString() // special getter function string\n  const proxyObj = new Proxy(fn, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { get: proxyObj })\n  utils.patchToString(proxyObj, fnStr)\n\n  return true\n}","mockWithProxy":"(obj, propName, pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.patchToString(proxyObj)\n\n  return true\n}","createProxy":"(pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n  utils.patchToString(proxyObj)\n\n  return proxyObj\n}","splitObjPath":"objPath => ({\n  // Remove last dot entry (property) ==> `HTMLMediaElement.prototype`\n  objName: objPath.split('.').slice(0, -1).join('.'),\n  // Extract last dot entry ==> `canPlayType`\n  propName: objPath.split('.').slice(-1)[0]\n})","replaceObjPathWithProxy":"(objPath, handler) => {\n  const { objName, propName } = utils.splitObjPath(objPath)\n  const obj = eval(objName) // eslint-disable-line no-eval\n  return utils.replaceWithProxy(obj, propName, handler)\n}","execRecursively":"(obj = {}, typeFilter = [], fn) => {\n  function recurse(obj) {\n    for (const key in obj) {\n      if (obj[key] === undefined) {\n        continue\n      }\n      if (obj[key] && typeof obj[key] === 'object') {\n        recurse(obj[key])\n      } else {\n        if (obj[key] && typeFilter.includes(typeof obj[key])) {\n          fn.call(this, obj[key])\n        }\n      }\n    }\n  }\n  recurse(obj)\n  return obj\n}","stringifyFns":"(fnObj = { hello: () => 'world' }) => {\n  // Object.fromEntries() ponyfill (in 6 lines) - supported only in Node v12+, modern browsers are fine\n  // https://github.com/feross/fromentries\n  function fromEntries(iterable) {\n    return [...iterable].reduce((obj, [key, val]) => {\n      obj[key] = val\n      return obj\n    }, {})\n  }\n  return (Object.fromEntries || fromEntries)(\n    Object.entries(fnObj)\n      .filter(([key, value]) => typeof value === 'function')\n      .map(([key, value]) => [key, value.toString()]) // eslint-disable-line no-eval\n  )\n}","materializeFns":"(fnStrObj = { hello: \"() => 'world'\" }) => {\n  return Object.fromEntries(\n    Object.entries(fnStrObj).map(([key, value]) => {\n      if (value.startsWith('function')) {\n        // some trickery is needed to make oldschool functions work :-)\n        return [key, eval(`() => ${value}`)()] // eslint-disable-line no-eval\n      } else {\n        // arrow functions just work\n        return [key, eval(value)] // eslint-disable-line no-eval\n      }\n    })\n  )\n}","makeHandler":"() => ({\n  // Used by simple `navigator` getter evasions\n  getterValue: value => ({\n    apply(target, ctx, args) {\n      // Let's fetch the value first, to trigger and escalate potential errors\n      // Illegal invocations like `navigator.__proto__.vendor` will throw here\n      utils.cache.Reflect.apply(...arguments)\n      return value\n    }\n  })\n})"},"_mainFunction":"(utils, { fns, data }) => {\n        fns = utils.materializeFns(fns)\n\n        // That means we're running headful\n        const hasPlugins = 'plugins' in navigator && navigator.plugins.length\n        if (hasPlugins) {\n          return // nothing to do here\n        }\n\n        const mimeTypes = fns.generateMimeTypeArray(utils, fns)(data.mimeTypes)\n        const plugins = fns.generatePluginArray(utils, fns)(data.plugins)\n\n        // Plugin and MimeType cross-reference each other, let's do that now\n        // Note: We're looping through `data.plugins` here, not the generated `plugins`\n        for (const pluginData of data.plugins) {\n          pluginData.__mimeTypes.forEach((type, index) => {\n            plugins[pluginData.name][index] = mimeTypes[type]\n\n            Object.defineProperty(plugins[pluginData.name], type, {\n              value: mimeTypes[type],\n              writable: false,\n              enumerable: false, // Not enumerable\n              configurable: true\n            })\n            Object.defineProperty(mimeTypes[type], 'enabledPlugin', {\n              value:\n                type === 'application/x-pnacl'\n                  ? mimeTypes['application/x-nacl'].enabledPlugin // these reference the same plugin, so we need to re-use the Proxy in order to avoid leaks\n                  : new Proxy(plugins[pluginData.name], {}), // Prevent circular references\n              writable: false,\n              enumerable: false, // Important: `JSON.stringify(navigator.plugins)`\n              configurable: true\n            })\n          })\n        }\n\n        const patchNavigator = (name, value) =>\n          utils.replaceProperty(Object.getPrototypeOf(navigator), name, {\n            get() {\n              return value\n            }\n          })\n\n        patchNavigator('mimeTypes', mimeTypes)\n        patchNavigator('plugins', plugins)\n\n        // All done\n      }","_args":[{"fns":{"generateMimeTypeArray":"(utils, fns) => mimeTypesData => {\n  return fns.generateMagicArray(utils, fns)(\n    mimeTypesData,\n    MimeTypeArray.prototype,\n    MimeType.prototype,\n    'type'\n  )\n}","generatePluginArray":"(utils, fns) => pluginsData => {\n  return fns.generateMagicArray(utils, fns)(\n    pluginsData,\n    PluginArray.prototype,\n    Plugin.prototype,\n    'name'\n  )\n}","generateMagicArray":"(utils, fns) =>\n  function(\n    dataArray = [],\n    proto = MimeTypeArray.prototype,\n    itemProto = MimeType.prototype,\n    itemMainProp = 'type'\n  ) {\n    // Quick helper to set props with the same descriptors vanilla is using\n    const defineProp = (obj, prop, value) =>\n      Object.defineProperty(obj, prop, {\n        value,\n        writable: false,\n        enumerable: false, // Important for mimeTypes & plugins: `JSON.stringify(navigator.mimeTypes)`\n        configurable: true\n      })\n\n    // Loop over our fake data and construct items\n    const makeItem = data => {\n      const item = {}\n      for (const prop of Object.keys(data)) {\n        if (prop.startsWith('__')) {\n          continue\n        }\n        defineProp(item, prop, data[prop])\n      }\n      return patchItem(item, data)\n    }\n\n    const patchItem = (item, data) => {\n      let descriptor = Object.getOwnPropertyDescriptors(item)\n\n      // Special case: Plugins have a magic length property which is not enumerable\n      // e.g. `navigator.plugins[i].length` should always be the length of the assigned mimeTypes\n      if (itemProto === Plugin.prototype) {\n        descriptor = {\n          ...descriptor,\n          length: {\n            value: data.__mimeTypes.length,\n            writable: false,\n            enumerable: false,\n            configurable: true // Important to be able to use the ownKeys trap in a Proxy to strip `length`\n          }\n        }\n      }\n\n      // We need to spoof a specific `MimeType` or `Plugin` object\n      const obj = Object.create(itemProto, descriptor)\n\n      // Virtually all property keys are not enumerable in vanilla\n      const blacklist = [...Object.keys(data), 'length', 'enabledPlugin']\n      return new Proxy(obj, {\n        ownKeys(target) {\n          return Reflect.ownKeys(target).filter(k => !blacklist.includes(k))\n        },\n        getOwnPropertyDescriptor(target, prop) {\n          if (blacklist.includes(prop)) {\n            return undefined\n          }\n          return Reflect.getOwnPropertyDescriptor(target, prop)\n        }\n      })\n    }\n\n    const magicArray = []\n\n    // Loop through our fake data and use that to create convincing entities\n    dataArray.forEach(data => {\n      magicArray.push(makeItem(data))\n    })\n\n    // Add direct property access  based on types (e.g. `obj['application/pdf']`) afterwards\n    magicArray.forEach(entry => {\n      defineProp(magicArray, entry[itemMainProp], entry)\n    })\n\n    // This is the best way to fake the type to make sure this is false: `Array.isArray(navigator.mimeTypes)`\n    const magicArrayObj = Object.create(proto, {\n      ...Object.getOwnPropertyDescriptors(magicArray),\n\n      // There's one ugly quirk we unfortunately need to take care of:\n      // The `MimeTypeArray` prototype has an enumerable `length` property,\n      // but headful Chrome will still skip it when running `Object.getOwnPropertyNames(navigator.mimeTypes)`.\n      // To strip it we need to make it first `configurable` and can then overlay a Proxy with an `ownKeys` trap.\n      length: {\n        value: magicArray.length,\n        writable: false,\n        enumerable: false,\n        configurable: true // Important to be able to use the ownKeys trap in a Proxy to strip `length`\n      }\n    })\n\n    // Generate our functional function mocks :-)\n    const functionMocks = fns.generateFunctionMocks(utils)(\n      proto,\n      itemMainProp,\n      magicArray\n    )\n\n    // We need to overlay our custom object with a JS Proxy\n    const magicArrayObjProxy = new Proxy(magicArrayObj, {\n      get(target, key = '') {\n        // Redirect function calls to our custom proxied versions mocking the vanilla behavior\n        if (key === 'item') {\n          return functionMocks.item\n        }\n        if (key === 'namedItem') {\n          return functionMocks.namedItem\n        }\n        if (proto === PluginArray.prototype && key === 'refresh') {\n          return functionMocks.refresh\n        }\n        // Everything else can pass through as normal\n        return utils.cache.Reflect.get(...arguments)\n      },\n      ownKeys(target) {\n        // There are a couple of quirks where the original property demonstrates \"magical\" behavior that makes no sense\n        // This can be witnessed when calling `Object.getOwnPropertyNames(navigator.mimeTypes)` and the absense of `length`\n        // My guess is that it has to do with the recent change of not allowing data enumeration and this being implemented weirdly\n        // For that reason we just completely fake the available property names based on our data to match what regular Chrome is doing\n        // Specific issues when not patching this: `length` property is available, direct `types` props (e.g. `obj['application/pdf']`) are missing\n        const keys = []\n        const typeProps = magicArray.map(mt => mt[itemMainProp])\n        typeProps.forEach((_, i) => keys.push(`${i}`))\n        typeProps.forEach(propName => keys.push(propName))\n        return keys\n      },\n      getOwnPropertyDescriptor(target, prop) {\n        if (prop === 'length') {\n          return undefined\n        }\n        return Reflect.getOwnPropertyDescriptor(target, prop)\n      }\n    })\n\n    return magicArrayObjProxy\n  }","generateFunctionMocks":"utils => (\n  proto,\n  itemMainProp,\n  dataArray\n) => ({\n  /** Returns the MimeType object with the specified index. */\n  item: utils.createProxy(proto.item, {\n    apply(target, ctx, args) {\n      if (!args.length) {\n        throw new TypeError(\n          `Failed to execute 'item' on '${\n            proto[Symbol.toStringTag]\n          }': 1 argument required, but only 0 present.`\n        )\n      }\n      // Special behavior alert:\n      // - Vanilla tries to cast strings to Numbers (only integers!) and use them as property index lookup\n      // - If anything else than an integer (including as string) is provided it will return the first entry\n      const isInteger = args[0] && Number.isInteger(Number(args[0])) // Cast potential string to number first, then check for integer\n      // Note: Vanilla never returns `undefined`\n      return (isInteger ? dataArray[Number(args[0])] : dataArray[0]) || null\n    }\n  }),\n  /** Returns the MimeType object with the specified name. */\n  namedItem: utils.createProxy(proto.namedItem, {\n    apply(target, ctx, args) {\n      if (!args.length) {\n        throw new TypeError(\n          `Failed to execute 'namedItem' on '${\n            proto[Symbol.toStringTag]\n          }': 1 argument required, but only 0 present.`\n        )\n      }\n      return dataArray.find(mt => mt[itemMainProp] === args[0]) || null // Not `undefined`!\n    }\n  }),\n  /** Does nothing and shall return nothing */\n  refresh: proto.refresh\n    ? utils.createProxy(proto.refresh, {\n        apply(target, ctx, args) {\n          return undefined\n        }\n      })\n    : undefined\n})"},"data":{"mimeTypes":[{"type":"application/pdf","suffixes":"pdf","description":"","__pluginName":"Chrome PDF Viewer"},{"type":"application/x-google-chrome-pdf","suffixes":"pdf","description":"Portable Document Format","__pluginName":"Chrome PDF Plugin"},{"type":"application/x-nacl","suffixes":"","description":"Native Client Executable","__pluginName":"Native Client"},{"type":"application/x-pnacl","suffixes":"","description":"Portable Native Client Executable","__pluginName":"Native Client"}],"plugins":[{"name":"Chrome PDF Plugin","filename":"internal-pdf-viewer","description":"Portable Document Format","__mimeTypes":["application/x-google-chrome-pdf"]},{"name":"Chrome PDF Viewer","filename":"mhjfbmdgcfjbbpaeojofohoefgiehjai","description":"","__mimeTypes":["application/pdf"]},{"name":"Native Client","filename":"internal-nacl-plugin","description":"","__mimeTypes":["application/x-nacl","application/x-pnacl"]}]}}]});
(() => {
      if (navigator.webdriver === false) {
        // Post Chrome 89.0.4339.0 and already good
      } else if (navigator.webdriver === undefined) {
        // Pre Chrome 89.0.4339.0 and already good
      } else {
        // Pre Chrome 88.0.4291.0 and needs patching
        delete Object.getPrototypeOf(navigator).webdriver
      }
    })();
(({ _utilsFns, _mainFunction, _args }) => {
        // Add this point we cannot use our utililty functions as they're just strings, we need to materialize them first
        const utils = Object.fromEntries(
          Object.entries(_utilsFns).map(([key, value]) => [key, eval(value)]) // eslint-disable-line no-eval
        )
        utils.init()
        return eval(_mainFunction)(utils, ..._args) // eslint-disable-line no-eval
      })({"_utilsFns":{"init":"() => {\n  utils.preloadCache()\n}","stripProxyFromErrors":"(handler = {}) => {\n  const newHandler = {\n    setPrototypeOf: function (target, proto) {\n      if (proto === null)\n        throw new TypeError('Cannot convert object to primitive value')\n      if (Object.getPrototypeOf(target) === Object.getPrototypeOf(proto)) {\n        throw new TypeError('Cyclic __proto__ value')\n      }\n      return Reflect.setPrototypeOf(target, proto)\n    }\n  }\n  // We wrap each trap in the handler in a try/catch and modify the error stack if they throw\n  const traps = Object.getOwnPropertyNames(handler)\n  traps.forEach(trap => {\n    newHandler[trap] = function () {\n      try {\n        // Forward the call to the defined proxy handler\n        return handler[trap].apply(this, arguments || [])\n      } catch (err) {\n        // Stack traces differ per browser, we only support chromium based ones currently\n        if (!err || !err.stack || !err.stack.includes(`at `)) {\n          throw err\n        }\n\n        // When something throws within one of our traps the Proxy will show up in error stacks\n        // An earlier implementation of this code would simply strip lines with a blacklist,\n        // but it makes sense to be more surgical here and only remove lines related to our Proxy.\n        // We try to use a known \"anchor\" line for that and strip it with everything above it.\n        // If the anchor line cannot be found for some reason we fall back to our blacklist approach.\n\n        const stripWithBlacklist = (stack, stripFirstLine = true) => {\n          const blacklist = [\n            `at Reflect.${trap} `, // e.g. Reflect.get or Reflect.apply\n            `at Object.${trap} `, // e.g. Object.get or Object.apply\n            `at Object.newHandler.<computed> [as ${trap}] ` // caused by this very wrapper :-)\n          ]\n          return (\n            err.stack\n              .split('\\n')\n              // Always remove the first (file) line in the stack (guaranteed to be our proxy)\n              .filter((line, index) => !(index === 1 && stripFirstLine))\n              // Check if the line starts with one of our blacklisted strings\n              .filter(line => !blacklist.some(bl => line.trim().startsWith(bl)))\n              .join('\\n')\n          )\n        }\n\n        const stripWithAnchor = (stack, anchor) => {\n          const stackArr = stack.split('\\n')\n          anchor = anchor || `at Object.newHandler.<computed> [as ${trap}] ` // Known first Proxy line in chromium\n          const anchorIndex = stackArr.findIndex(line =>\n            line.trim().startsWith(anchor)\n          )\n          if (anchorIndex === -1) {\n            return false // 404, anchor not found\n          }\n          // Strip everything from the top until we reach the anchor line\n          // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n          stackArr.splice(1, anchorIndex)\n          return stackArr.join('\\n')\n        }\n\n        // Special cases due to our nested toString proxies\n        err.stack = err.stack.replace(\n          'at Object.toString (',\n          'at Function.toString ('\n        )\n        if ((err.stack || '').includes('at Function.toString (')) {\n          err.stack = stripWithBlacklist(err.stack, false)\n          throw err\n        }\n\n        // Try using the anchor method, fallback to blacklist if necessary\n        err.stack = stripWithAnchor(err.stack) || stripWithBlacklist(err.stack)\n\n        throw err // Re-throw our now sanitized error\n      }\n    }\n  })\n  return newHandler\n}","stripErrorWithAnchor":"(err, anchor) => {\n  const stackArr = err.stack.split('\\n')\n  const anchorIndex = stackArr.findIndex(line => line.trim().startsWith(anchor))\n  if (anchorIndex === -1) {\n    return err // 404, anchor not found\n  }\n  // Strip everything from the top until we reach the anchor line (remove anchor line as well)\n  // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n  stackArr.splice(1, anchorIndex)\n  err.stack = stackArr.join('\\n')\n  return err\n}","replaceProperty":"(obj, propName, descriptorOverrides = {}) => {\n  return Object.defineProperty(obj, propName, {\n    // Copy over the existing descriptors (writable, enumerable, configurable, etc)\n    ...(Object.getOwnPropertyDescriptor(obj, propName) || {}),\n    // Add our overrides (e.g. value, get())\n    ...descriptorOverrides\n  })\n}","preloadCache":"() => {\n  if (utils.cache) {\n    return\n  }\n  utils.cache = {\n    // Used in our proxies\n    Reflect: {\n      get: Reflect.get.bind(Reflect),\n      apply: Reflect.apply.bind(Reflect)\n    },\n    // Used in `makeNativeString`\n    nativeToStringStr: Function.toString + '' // => `function toString() { [native code] }`\n  }\n}","makeNativeString":"(name = '') => {\n  return utils.cache.nativeToStringStr.replace('toString', name || '')\n}","patchToString":"(obj, str = '') => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n      // `toString` targeted at our proxied Object detected\n      if (ctx === obj) {\n        // We either return the optional string verbatim or derive the most desired result automatically\n        return str || utils.makeNativeString(obj.name)\n      }\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","patchToStringNested":"(obj = {}) => {\n  return utils.execRecursively(obj, ['function'], utils.patchToString)\n}","redirectToString":"(proxyObj, originalObj) => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n\n      // `toString` targeted at our proxied Object detected\n      if (ctx === proxyObj) {\n        const fallback = () =>\n          originalObj && originalObj.name\n            ? utils.makeNativeString(originalObj.name)\n            : utils.makeNativeString(proxyObj.name)\n\n        // Return the toString representation of our original object if possible\n        return originalObj + '' || fallback()\n      }\n\n      if (typeof ctx === 'undefined' || ctx === null) {\n        return target.call(ctx)\n      }\n\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","replaceWithProxy":"(obj, propName, handler) => {\n  const originalObj = obj[propName]\n  const proxyObj = new Proxy(obj[propName], utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.redirectToString(proxyObj, originalObj)\n\n  return true\n}","replaceGetterWithProxy":"(obj, propName, handler) => {\n  const fn = Object.getOwnPropertyDescriptor(obj, propName).get\n  const fnStr = fn.toString() // special getter function string\n  const proxyObj = new Proxy(fn, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { get: proxyObj })\n  utils.patchToString(proxyObj, fnStr)\n\n  return true\n}","mockWithProxy":"(obj, propName, pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.patchToString(proxyObj)\n\n  return true\n}","createProxy":"(pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n  utils.patchToString(proxyObj)\n\n  return proxyObj\n}","splitObjPath":"objPath => ({\n  // Remove last dot entry (property) ==> `HTMLMediaElement.prototype`\n  objName: objPath.split('.').slice(0, -1).join('.'),\n  // Extract last dot entry ==> `canPlayType`\n  propName: objPath.split('.').slice(-1)[0]\n})","replaceObjPathWithProxy":"(objPath, handler) => {\n  const { objName, propName } = utils.splitObjPath(objPath)\n  const obj = eval(objName) // eslint-disable-line no-eval\n  return utils.replaceWithProxy(obj, propName, handler)\n}","execRecursively":"(obj = {}, typeFilter = [], fn) => {\n  function recurse(obj) {\n    for (const key in obj) {\n      if (obj[key] === undefined) {\n        continue\n      }\n      if (obj[key] && typeof obj[key] === 'object') {\n        recurse(obj[key])\n      } else {\n        if (obj[key] && typeFilter.includes(typeof obj[key])) {\n          fn.call(this, obj[key])\n        }\n      }\n    }\n  }\n  recurse(obj)\n  return obj\n}","stringifyFns":"(fnObj = { hello: () => 'world' }) => {\n  // Object.fromEntries() ponyfill (in 6 lines) - supported only in Node v12+, modern browsers are fine\n  // https://github.com/feross/fromentries\n  function fromEntries(iterable) {\n    return [...iterable].reduce((obj, [key, val]) => {\n      obj[key] = val\n      return obj\n    }, {})\n  }\n  return (Object.fromEntries || fromEntries)(\n    Object.entries(fnObj)\n      .filter(([key, value]) => typeof value === 'function')\n      .map(([key, value]) => [key, value.toString()]) // eslint-disable-line no-eval\n  )\n}","materializeFns":"(fnStrObj = { hello: \"() => 'world'\" }) => {\n  return Object.fromEntries(\n    Object.entries(fnStrObj).map(([key, value]) => {\n      if (value.startsWith('function')) {\n        // some trickery is needed to make oldschool functions work :-)\n        return [key, eval(`() => ${value}`)()] // eslint-disable-line no-eval\n      } else {\n        // arrow functions just work\n        return [key, eval(value)] // eslint-disable-line no-eval\n      }\n    })\n  )\n}","makeHandler":"() => ({\n  // Used by simple `navigator` getter evasions\n  getterValue: value => ({\n    apply(target, ctx, args) {\n      // Let's fetch the value first, to trigger and escalate potential errors\n      // Illegal invocations like `navigator.__proto__.vendor` will throw here\n      utils.cache.Reflect.apply(...arguments)\n      return value\n    }\n  })\n})"},"_mainFunction":"(utils, opts) => {\n      const getParameterProxyHandler = {\n        apply: function(target, ctx, args) {\n          const param = (args || [])[0]\n          const result = utils.cache.Reflect.apply(target, ctx, args)\n          // UNMASKED_VENDOR_WEBGL\n          if (param === 37445) {\n            return opts.vendor || 'Intel Inc.' // default in headless: Google Inc.\n          }\n          // UNMASKED_RENDERER_WEBGL\n          if (param === 37446) {\n            return opts.renderer || 'Intel Iris OpenGL Engine' // default in headless: Google SwiftShader\n          }\n          return result\n        }\n      }\n\n      // There's more than one WebGL rendering context\n      // https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext#Browser_compatibility\n      // To find out the original values here: Object.getOwnPropertyDescriptors(WebGLRenderingContext.prototype.getParameter)\n      const addProxy = (obj, propName) => {\n        utils.replaceWithProxy(obj, propName, getParameterProxyHandler)\n      }\n      // For whatever weird reason loops don't play nice with Object.defineProperty, here's the next best thing:\n      addProxy(WebGLRenderingContext.prototype, 'getParameter')\n      addProxy(WebGL2RenderingContext.prototype, 'getParameter')\n    }","_args":[{}]});
(() => {
      try {
        if (window.outerWidth && window.outerHeight) {
          return // nothing to do here
        }
        const windowFrame = 85 // probably OS and WM dependent
        window.outerWidth = window.innerWidth
        window.outerHeight = window.innerHeight + windowFrame
      } catch (err) {}
    })();
(({ _utilsFns, _mainFunction, _args }) => {
        // Add this point we cannot use our utililty functions as they're just strings, we need to materialize them first
        const utils = Object.fromEntries(
          Object.entries(_utilsFns).map(([key, value]) => [key, eval(value)]) // eslint-disable-line no-eval
        )
        utils.init()
        return eval(_mainFunction)(utils, ..._args) // eslint-disable-line no-eval
      })({"_utilsFns":{"init":"() => {\n  utils.preloadCache()\n}","stripProxyFromErrors":"(handler = {}) => {\n  const newHandler = {\n    setPrototypeOf: function (target, proto) {\n      if (proto === null)\n        throw new TypeError('Cannot convert object to primitive value')\n      if (Object.getPrototypeOf(target) === Object.getPrototypeOf(proto)) {\n        throw new TypeError('Cyclic __proto__ value')\n      }\n      return Reflect.setPrototypeOf(target, proto)\n    }\n  }\n  // We wrap each trap in the handler in a try/catch and modify the error stack if they throw\n  const traps = Object.getOwnPropertyNames(handler)\n  traps.forEach(trap => {\n    newHandler[trap] = function () {\n      try {\n        // Forward the call to the defined proxy handler\n        return handler[trap].apply(this, arguments || [])\n      } catch (err) {\n        // Stack traces differ per browser, we only support chromium based ones currently\n        if (!err || !err.stack || !err.stack.includes(`at `)) {\n          throw err\n        }\n\n        // When something throws within one of our traps the Proxy will show up in error stacks\n        // An earlier implementation of this code would simply strip lines with a blacklist,\n        // but it makes sense to be more surgical here and only remove lines related to our Proxy.\n        // We try to use a known \"anchor\" line for that and strip it with everything above it.\n        // If the anchor line cannot be found for some reason we fall back to our blacklist approach.\n\n        const stripWithBlacklist = (stack, stripFirstLine = true) => {\n          const blacklist = [\n            `at Reflect.${trap} `, // e.g. Reflect.get or Reflect.apply\n            `at Object.${trap} `, // e.g. Object.get or Object.apply\n            `at Object.newHandler.<computed> [as ${trap}] ` // caused by this very wrapper :-)\n          ]\n          return (\n            err.stack\n              .split('\\n')\n              // Always remove the first (file) line in the stack (guaranteed to be our proxy)\n              .filter((line, index) => !(index === 1 && stripFirstLine))\n              // Check if the line starts with one of our blacklisted strings\n              .filter(line => !blacklist.some(bl => line.trim().startsWith(bl)))\n              .join('\\n')\n          )\n        }\n\n        const stripWithAnchor = (stack, anchor) => {\n          const stackArr = stack.split('\\n')\n          anchor = anchor || `at Object.newHandler.<computed> [as ${trap}] ` // Known first Proxy line in chromium\n          const anchorIndex = stackArr.findIndex(line =>\n            line.trim().startsWith(anchor)\n          )\n          if (anchorIndex === -1) {\n            return false // 404, anchor not found\n          }\n          // Strip everything from the top until we reach the anchor line\n          // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n          stackArr.splice(1, anchorIndex)\n          return stackArr.join('\\n')\n        }\n\n        // Special cases due to our nested toString proxies\n        err.stack = err.stack.replace(\n          'at Object.toString (',\n          'at Function.toString ('\n        )\n        if ((err.stack || '').includes('at Function.toString (')) {\n          err.stack = stripWithBlacklist(err.stack, false)\n          throw err\n        }\n\n        // Try using the anchor method, fallback to blacklist if necessary\n        err.stack = stripWithAnchor(err.stack) || stripWithBlacklist(err.stack)\n\n        throw err // Re-throw our now sanitized error\n      }\n    }\n  })\n  return newHandler\n}","stripErrorWithAnchor":"(err, anchor) => {\n  const stackArr = err.stack.split('\\n')\n  const anchorIndex = stackArr.findIndex(line => line.trim().startsWith(anchor))\n  if (anchorIndex === -1) {\n    return err // 404, anchor not found\n  }\n  // Strip everything from the top until we reach the anchor line (remove anchor line as well)\n  // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)\n  stackArr.splice(1, anchorIndex)\n  err.stack = stackArr.join('\\n')\n  return err\n}","replaceProperty":"(obj, propName, descriptorOverrides = {}) => {\n  return Object.defineProperty(obj, propName, {\n    // Copy over the existing descriptors (writable, enumerable, configurable, etc)\n    ...(Object.getOwnPropertyDescriptor(obj, propName) || {}),\n    // Add our overrides (e.g. value, get())\n    ...descriptorOverrides\n  })\n}","preloadCache":"() => {\n  if (utils.cache) {\n    return\n  }\n  utils.cache = {\n    // Used in our proxies\n    Reflect: {\n      get: Reflect.get.bind(Reflect),\n      apply: Reflect.apply.bind(Reflect)\n    },\n    // Used in `makeNativeString`\n    nativeToStringStr: Function.toString + '' // => `function toString() { [native code] }`\n  }\n}","makeNativeString":"(name = '') => {\n  return utils.cache.nativeToStringStr.replace('toString', name || '')\n}","patchToString":"(obj, str = '') => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n      // `toString` targeted at our proxied Object detected\n      if (ctx === obj) {\n        // We either return the optional string verbatim or derive the most desired result automatically\n        return str || utils.makeNativeString(obj.name)\n      }\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","patchToStringNested":"(obj = {}) => {\n  return utils.execRecursively(obj, ['function'], utils.patchToString)\n}","redirectToString":"(proxyObj, originalObj) => {\n  const handler = {\n    apply: function (target, ctx) {\n      // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + \"\"`\n      if (ctx === Function.prototype.toString) {\n        return utils.makeNativeString('toString')\n      }\n\n      // `toString` targeted at our proxied Object detected\n      if (ctx === proxyObj) {\n        const fallback = () =>\n          originalObj && originalObj.name\n            ? utils.makeNativeString(originalObj.name)\n            : utils.makeNativeString(proxyObj.name)\n\n        // Return the toString representation of our original object if possible\n        return originalObj + '' || fallback()\n      }\n\n      if (typeof ctx === 'undefined' || ctx === null) {\n        return target.call(ctx)\n      }\n\n      // Check if the toString protype of the context is the same as the global prototype,\n      // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case\n      const hasSameProto = Object.getPrototypeOf(\n        Function.prototype.toString\n      ).isPrototypeOf(ctx.toString) // eslint-disable-line no-prototype-builtins\n      if (!hasSameProto) {\n        // Pass the call on to the local Function.prototype.toString instead\n        return ctx.toString()\n      }\n\n      return target.call(ctx)\n    }\n  }\n\n  const toStringProxy = new Proxy(\n    Function.prototype.toString,\n    utils.stripProxyFromErrors(handler)\n  )\n  utils.replaceProperty(Function.prototype, 'toString', {\n    value: toStringProxy\n  })\n}","replaceWithProxy":"(obj, propName, handler) => {\n  const originalObj = obj[propName]\n  const proxyObj = new Proxy(obj[propName], utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.redirectToString(proxyObj, originalObj)\n\n  return true\n}","replaceGetterWithProxy":"(obj, propName, handler) => {\n  const fn = Object.getOwnPropertyDescriptor(obj, propName).get\n  const fnStr = fn.toString() // special getter function string\n  const proxyObj = new Proxy(fn, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { get: proxyObj })\n  utils.patchToString(proxyObj, fnStr)\n\n  return true\n}","mockWithProxy":"(obj, propName, pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n\n  utils.replaceProperty(obj, propName, { value: proxyObj })\n  utils.patchToString(proxyObj)\n\n  return true\n}","createProxy":"(pseudoTarget, handler) => {\n  const proxyObj = new Proxy(pseudoTarget, utils.stripProxyFromErrors(handler))\n  utils.patchToString(proxyObj)\n\n  return proxyObj\n}","splitObjPath":"objPath => ({\n  // Remove last dot entry (property) ==> `HTMLMediaElement.prototype`\n  objName: objPath.split('.').slice(0, -1).join('.'),\n  // Extract last dot entry ==> `canPlayType`\n  propName: objPath.split('.').slice(-1)[0]\n})","replaceObjPathWithProxy":"(objPath, handler) => {\n  const { objName, propName } = utils.splitObjPath(objPath)\n  const obj = eval(objName) // eslint-disable-line no-eval\n  return utils.replaceWithProxy(obj, propName, handler)\n}","execRecursively":"(obj = {}, typeFilter = [], fn) => {\n  function recurse(obj) {\n    for (const key in obj) {\n      if (obj[key] === undefined) {\n        continue\n      }\n      if (obj[key] && typeof obj[key] === 'object') {\n        recurse(obj[key])\n      } else {\n        if (obj[key] && typeFilter.includes(typeof obj[key])) {\n          fn.call(this, obj[key])\n        }\n      }\n    }\n  }\n  recurse(obj)\n  return obj\n}","stringifyFns":"(fnObj = { hello: () => 'world' }) => {\n  // Object.fromEntries() ponyfill (in 6 lines) - supported only in Node v12+, modern browsers are fine\n  // https://github.com/feross/fromentries\n  function fromEntries(iterable) {\n    return [...iterable].reduce((obj, [key, val]) => {\n      obj[key] = val\n      return obj\n    }, {})\n  }\n  return (Object.fromEntries || fromEntries)(\n    Object.entries(fnObj)\n      .filter(([key, value]) => typeof value === 'function')\n      .map(([key, value]) => [key, value.toString()]) // eslint-disable-line no-eval\n  )\n}","materializeFns":"(fnStrObj = { hello: \"() => 'world'\" }) => {\n  return Object.fromEntries(\n    Object.entries(fnStrObj).map(([key, value]) => {\n      if (value.startsWith('function')) {\n        // some trickery is needed to make oldschool functions work :-)\n        return [key, eval(`() => ${value}`)()] // eslint-disable-line no-eval\n      } else {\n        // arrow functions just work\n        return [key, eval(value)] // eslint-disable-line no-eval\n      }\n    })\n  )\n}","makeHandler":"() => ({\n  // Used by simple `navigator` getter evasions\n  getterValue: value => ({\n    apply(target, ctx, args) {\n      // Let's fetch the value first, to trigger and escalate potential errors\n      // Illegal invocations like `navigator.__proto__.vendor` will throw here\n      utils.cache.Reflect.apply(...arguments)\n      return value\n    }\n  })\n})"},"_mainFunction":"(utils, opts) => {\n      try {\n        // Adds a contentWindow proxy to the provided iframe element\n        const addContentWindowProxy = iframe => {\n          const contentWindowProxy = {\n            get(target, key) {\n              // Now to the interesting part:\n              // We actually make this thing behave like a regular iframe window,\n              // by intercepting calls to e.g. `.self` and redirect it to the correct thing. :)\n              // That makes it possible for these assertions to be correct:\n              // iframe.contentWindow.self === window.top // must be false\n              if (key === 'self') {\n                return this\n              }\n              // iframe.contentWindow.frameElement === iframe // must be true\n              if (key === 'frameElement') {\n                return iframe\n              }\n              // Intercept iframe.contentWindow[0] to hide the property 0 added by the proxy.\n              if (key === '0') {\n                  return undefined\n              }\n              return Reflect.get(target, key)\n            }\n          }\n\n          if (!iframe.contentWindow) {\n            const proxy = new Proxy(window, contentWindowProxy)\n            Object.defineProperty(iframe, 'contentWindow', {\n              get() {\n                return proxy\n              },\n              set(newValue) {\n                return newValue // contentWindow is immutable\n              },\n              enumerable: true,\n              configurable: false\n            })\n          }\n        }\n\n        // Handles iframe element creation, augments `srcdoc` property so we can intercept further\n        const handleIframeCreation = (target, thisArg, args) => {\n          const iframe = target.apply(thisArg, args)\n\n          // We need to keep the originals around\n          const _iframe = iframe\n          const _srcdoc = _iframe.srcdoc\n\n          // Add hook for the srcdoc property\n          // We need to be very surgical here to not break other iframes by accident\n          Object.defineProperty(iframe, 'srcdoc', {\n            configurable: true, // Important, so we can reset this later\n            get: function() {\n              return _srcdoc\n            },\n            set: function(newValue) {\n              addContentWindowProxy(this)\n              // Reset property, the hook is only needed once\n              Object.defineProperty(iframe, 'srcdoc', {\n                configurable: false,\n                writable: false,\n                value: _srcdoc\n              })\n              _iframe.srcdoc = newValue\n            }\n          })\n          return iframe\n        }\n\n        // Adds a hook to intercept iframe creation events\n        const addIframeCreationSniffer = () => {\n          /* global document */\n          const createElementHandler = {\n            // Make toString() native\n            get(target, key) {\n              return Reflect.get(target, key)\n            },\n            apply: function(target, thisArg, args) {\n              const isIframe =\n                args && args.length && `${args[0]}`.toLowerCase() === 'iframe'\n              if (!isIframe) {\n                // Everything as usual\n                return target.apply(thisArg, args)\n              } else {\n                return handleIframeCreation(target, thisArg, args)\n              }\n            }\n          }\n          // All this just due to iframes with srcdoc bug\n          utils.replaceWithProxy(\n            document,\n            'createElement',\n            createElementHandler\n          )\n        }\n\n        // Let's go\n        addIframeCreationSniffer()\n      } catch (err) {\n        // console.warn(err)\n      }\n    }","_args":[]});;
"use strict";
let __pulsar_utils__ = function () {
    this.config = __pulsar_CONFIGS || __pulsar_DEFAULT_CONFIGS;
    this.fineHeight = 4000;
    this.fineNumAnchor = 100;
    this.fineNumImage = 20;
};
/**
 * @param scroll The count to scroll down
 * @return {Object|boolean}
 * */
__pulsar_utils__.waitForReady = function(scroll = 3) {
    return this.checkStatus(scroll);
};
/**
 * @param scroll The count to scroll down
 * @return {Object|boolean}
 * */
__pulsar_utils__.checkStatus = function(scroll = 3) {
    if (!document) {
        return false
    }
    if (!document.__pulsar__Data) {
        // initialization
        this.createDataIfAbsent();
        this.updateStat(true);
    }
    let status = document.__pulsar__Data.trace.status;
    status.n += 1;
    if (status.scroll < scroll) {
        window.scrollBy(0, 500);
        status.scroll += 1;
    }
    let ready = this.isActuallyReady();
    if (!ready) {
        return false
    }
    if (this.isBrowserError()) {
        document.__pulsar__Data.trace.status.ec = document.querySelector(".error-code").textContent
    }
    // The document is ready
    return JSON.stringify(document.__pulsar__Data)
};
__pulsar_utils__.isBrowserError = function () {
    if (document.documentURI.startsWith("chrome-error")) {
        return true
    }
    return false
};
__pulsar_utils__.createDataIfAbsent = function() {
    if (!document.__pulsar__Data) {
        let location;
        if (window.location instanceof Location) {
            location = window.location.href
        } else {
            location = window.location
        }
        document.__pulsar__Data = {
            trace: {
                status: { n: 0, scroll: 0, idl: 0, st: "", r: "", ec: "" },
                initStat: null,
                lastStat: {w: 0, h: 0, na: 0, ni: 0, nst: 0, nnm: 0},
                lastD:    {w: 0, h: 0, na: 0, ni: 0, nst: 0, nnm: 0},
                initD:    {w: 0, h: 0, na: 0, ni: 0, nst: 0, nnm: 0}
            },
            urls: {
                URL: document.URL,
                baseURI: document.baseURI,
                location: location,
                documentURI: document.documentURI,
                referrer: document.referrer
            }
        };
    }
};
__pulsar_utils__.writeData = function() {
    if (!document.body) {
        return false
    }
    let script = document.getElementById(__pulsar_CONFIGS.SCRIPT_SECTION_ID);
    if (script != null) {
        return
    }
    script = document.createElement('script');
    script.id = __pulsar_CONFIGS.SCRIPT_SECTION_ID;
    script.type = 'text/javascript';
    let pulsarData = JSON.stringify(document.__pulsar__Data, null, 3);
    script.textContent = "\n" + `;let __pulsar__Data = ${pulsarData};\n`;
    document.body.appendChild(script);
};
/**
 * Check if the document is ready to analyze.
 * A document is hardly be perfect ready in time, since it's very common there are very slow sub resources to wait for.
 * */
__pulsar_utils__.isActuallyReady = function() {
    // unexpected
    if (!document.body) {
        return false
    }
    this.updateStat();
    if (!document.__pulsar__Data) {
        return false
    }
    let ready = false;
    let trace = document.__pulsar__Data.trace;
    let status = trace.status;
    let d = trace.lastD;
    // all sub resources are loaded, the document is ready now
    if (status.st === "c") {
        // assert(document.readyState === "complete")
        status.r = "st";
        ready = true
    }
    // The DOM is very good for analysis, no wait for more information
    let stat = trace.lastStat;
    if (status.n > 20 && stat.h >= this.fineHeight
        && stat.na >= this.fineNumAnchor
        && stat.ni >= this.fineNumImage
    ) {
        if (d.h < 10 && d.na === 0 && d.ni === 0 && d.nst === 0 && d.nnm === 0) {
            // DOM changed since last check, store the latest stat and return false to wait for the next check
            ++status.idl;
            if (status.idl > 10) {
                // idle for 10 seconds
                status.r = "ct";
                ready = true;
            }
        }
    }
    return ready;
};
__pulsar_utils__.isIdle = function(init = false) {
    let idle = false;
    let trace = document.__pulsar__Data.trace;
    let status = trace.status;
    let d = trace.lastD;
    if (d.h < 10 && d.na === 0 && d.ni === 0 && d.nst === 0 && d.nnm === 0) {
        // DOM changed since last check, store the latest stat and return false to wait for the next check
        ++status.idl;
        if (status.idl > 5) {
            // idle for 5 seconds
            idle = true;
        }
    }
    return idle
};
/**
 * @return {Object}
 * */
__pulsar_utils__.updateStat = function(init = false) {
    if (!document.body) {
        return
    }
    const config = __pulsar_CONFIGS;
    const viewPortWidth = config.viewPortWidth;
    const viewPortHeight = config.viewPortHeight;
    const maxWidth = 1.2 * viewPortWidth;
    const fineWidth = 300;
    let width = 0;
    let height = 0;
    let na = 0;  // anchor
    let ni = 0;  // image
    let nst = 0; // short text in first screen
    let nnm = 0; // number like text in first screen
    if (!this.isBrowserError()) {
        document.body.__pulsar_forEach((node) => {
            if (node.__pulsar_isIFrame()) {
                return
            }
            if (node.__pulsar_isAnchor()) ++na;
            if (node.__pulsar_isImage() && !node.__pulsar_isSmallImage()) ++ni;
            if (node.__pulsar_isText() && node.__pulsar_nScreen() <= 20) {
                let isShortText = node.__pulsar_isShortText();
                let isNumberLike = isShortText && node.__pulsar_isNumberLike();
                if (isShortText) {
                    ++nst;
                    if (isNumberLike) {
                        ++nnm;
                    }
                    let ele = node.__pulsar_bestElement();
                    if (ele != null && !init && !ele.hasAttribute("_ps_tp")) {
                        // not set at initialization, it's lazy loaded
                        ele.setAttribute("_ps_lazy", "1")
                    }
                    if (ele != null) {
                        let type = isNumberLike ? "nm" : "st";
                        ele.setAttribute("_ps_tp", type);
                    }
                }
            }
            if (node.__pulsar_isDiv() && node.scrollWidth > width && node.scrollWidth < maxWidth) width = node.scrollWidth;
            if (node.__pulsar_isDiv() && node.scrollWidth >= fineWidth && node.scrollHeight > height) height = node.scrollHeight;
        });
    }
    // unexpected but occurs when do performance test to parallel harvest Web sites
    if (!document.__pulsar__Data) {
        return
    }
    let trace = document.__pulsar__Data.trace;
    let initStat = trace.initStat;
    if (!initStat) {
        initStat = { w: width, h: height, na: na, ni: ni, nst: nst, nnm: nnm };
        trace.initStat = initStat
    }
    let lastStat = trace.lastStat;
    let lastStatus = trace.status;
    let state = document.readyState.substr(0, 1);
    let newMultiStatus = {
        status: {n: lastStatus.n, scroll: lastStatus.scroll, idl: lastStatus.idl, st: state, r: lastStatus.r},
        lastStat: {w: width, h: height, na: na, ni: ni, nst: nst, nnm: nnm},
        // changes from last round
        lastD: {
            w: width - lastStat.w,
            h: height - lastStat.h,
            na: na - lastStat.na,
            ni: ni - lastStat.ni,
            nst: nst - lastStat.nst,
            nnm: nnm - lastStat.nnm
        },
        // changes from the initialization
        initD: {
            w: width - initStat.w,
            h: height - initStat.h,
            na: na - initStat.na,
            ni: ni - initStat.ni,
            nst: nst - initStat.nst,
            nnm: nnm - initStat.nnm
        }
    };
    document.__pulsar__Data.trace = Object.assign(trace, newMultiStatus)
};
/**
 * @param {Number} ratio The ratio of the page's height to scroll to, default is 0.5
 * */
__pulsar_utils__.scrollToMiddle = function(ratio = 0.5) {
    if (!document || !document.documentElement || !document.body) {
        return
    }
    if (ratio < 0 || ratio > 1) {
        ratio = 0.5
    }
    let x = 0;
    let y = Math.max(
        document.documentElement.scrollHeight,
        document.documentElement.clientHeight,
        document.body.scrollHeight
    );
    y = Math.min(y, 15000) * ratio
    window.scrollTo(x, y)
};
__pulsar_utils__.scrollToBottom = function() {
    if (!document || !document.documentElement || !document.body) {
        return
    }
    let x = 0;
    let y = Math.max(
        document.documentElement.scrollHeight,
        document.documentElement.clientHeight,
        document.body.scrollHeight
    );
    y = Math.min(y, 15000)
    window.scrollTo(x, y)
};
__pulsar_utils__.scrollUp = function() {
    if (!document.__pulsar__Data) {
        // TODO: this occurs when do performance test, but the reason is not investigated
        // return false
    }
    window.scrollBy(0, -500);
};
__pulsar_utils__.scrollToTop = function() {
    window.scrollTo(0, 0)
};
__pulsar_utils__.scrollDown = function() {
    if (!document.__pulsar__Data) {
        // TODO: this occurs when do performance test, but the reason is not investigated
        // return false
    }
    window.scrollBy(0, 500);
};
__pulsar_utils__.scrollDownN = function(scrollCount = 5) {
    if (!document.__pulsar__Data) {
        // TODO: this occurs when do performance test, but the reason is not investigated
        // return false
    }
    let status = document.__pulsar__Data.trace.status;
    window.scrollBy(0, 500);
    status.scroll += 1;
    return status.scroll >= scrollCount
};
/**
 * Check if a element be visible
 *
 * @param  {String} selector
 * @return boolean
 */
__pulsar_utils__.isVisible = function(selector) {
    let ele = document.querySelector(selector)
    if (ele == null) {
        return false
    }
    return this.isElementVisible(ele)
}
/**
 * Check if a element be visible.
 *
 * @param  {Element} element
 * @return boolean
 */
__pulsar_utils__.isElementVisible = function(element) {
    if (!element.ownerDocument || !element.ownerDocument.defaultView)
        return true;
    const style = element.ownerDocument.defaultView.getComputedStyle(element);
    if (!style || style.visibility === 'hidden')
        return false;
    if (style.display === 'contents') {
        // display:contents is not rendered itself, but its child nodes are.
        for (let child = element.firstChild; child; child = child.nextSibling) {
            if (child.nodeType === 1 /* Node.ELEMENT_NODE */ && this.isElementVisible(child))
            return true;
            if (child.nodeType === 3 /* Node.TEXT_NODE */ && this.isVisibleTextNode(child))
            return true;
        }
        return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}
/**
 * Check if a text node be visible.
 *
 * @param  {Node} node
 * @return boolean
 */
__pulsar_utils__.isVisibleTextNode = function (node) {
    // https://stackoverflow.com/questions/1461059/is-there-an-equivalent-to-getboundingclientrect-for-text-nodes
    const range = document.createRange();
    range.selectNode(node);
    const rect = range.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}
/**
 * Test if a element is checked.
 *
 * @param  {String} selector
 * @return boolean
 */
__pulsar_utils__.isChecked = function(selector) {
    let ele = document.querySelector(selector)
    if (ele == null) {
        return false
    }
    return this.isElementChecked(ele)
}
/**
 * Test if a element is checked.
 *
 * @param  {Element} element
 * @return boolean
 */
__pulsar_utils__.isElementChecked = function(element) {
    if (['checkbox', 'radio'].includes(element.getAttribute('role') || '')) {
        return element.getAttribute('aria-checked') === 'true';
    }
    if (element.nodeName !== 'INPUT') {
        throw this.createStacklessError('Not a checkbox or radio button');
    }
    if (element instanceof HTMLInputElement) {
        if (!['radio', 'checkbox'].includes(element.type.toLowerCase())) {
            throw this.createStacklessError('Not a checkbox or radio button');
        }
        return element.checked
    }
    return false
}
/**
 * Scroll into view.
 *
 * @param {String} selector The element to scroll to
 * */
__pulsar_utils__.scrollIntoView = function(selector) {
    let ele = document.querySelector(selector)
    if (ele) {
        ele.scrollIntoView(
            {
                block: "start",
                inline: "nearest",
                behavior: 'auto',
            }
        )
    }
};
/**
 * Select the first element and click it
 *
 * @param  {String} selector
 * @return
 */
__pulsar_utils__.click = function(selector) {
    let ele = document.querySelector(selector)
    if (ele instanceof HTMLElement) {
        ele.click()
    }
}
/**
 * Select the first element and click it
 *
 * @param  {String} selector
 * @param  {String} pattern
 * @return
 */
__pulsar_utils__.clickMatches = function(selector, pattern) {
    let elements = document.querySelectorAll(selector)
    for (let ele of elements) {
        if (ele instanceof HTMLElement) {
            let text = ele.textContent
            if (text.match(pattern)) {
                ele.scrollIntoView()
                ele.click()
            }
        }
    }
}
/**
 * Select the first element and click it.
 *
 * @param  {String} selector
 * @param  {String} attrName
 * @param  {String} pattern
 * @return
 */
__pulsar_utils__.clickMatches = function(selector, attrName, pattern) {
    let elements = document.querySelectorAll(selector)
    for (let ele of elements) {
        if (ele instanceof HTMLElement) {
            let attrValue = ele.getAttribute(attrName)
            if (attrValue.match(pattern)) {
                ele.scrollIntoView()
                ele.click()
                return
            }
        }
    }
}
/**
 * Select the first element and click it.
 *
 * @param  {number} n The n-th anchor.
 * @param  {string|null} rootSelector The n-th anchor.
 * @return {string|null}
 */
__pulsar_utils__.clickNthAnchor = function(n, rootSelector) {
    let rootNode
    if (!rootSelector) {
        rootNode = document.body
    } else {
        rootNode = document.querySelector(rootSelector)
    }
    if (!rootNode) {
        return null
    }
    let c = 0
    let href = null
    let visitor = function () {}
    visitor.head = function (node, depth) {
        if (node instanceof HTMLElement
            && node.__pulsar_isAnchor()
            && node.__pulsar_maybeClickable()
        ) {
            ++c;
            if (c === n) {
                visitor.stopped = true
                node.scrollIntoView()
                href = node.getAttribute("href")
                node.click()
            }
        }
    };
    new __pulsar_NodeTraversor(visitor).traverse(rootNode)
    return href
}
/**
 * Select the first element and check it if not checked.
 *
 * @param  {String} selector
 * @return
 */
__pulsar_utils__.check = function(selector) {
    if (!this.isChecked(selector)) {
        let ele = document.querySelector(selector)
        if (ele instanceof HTMLElement) {
            ele.click()
        }
    }
}
/**
 * Select the first element and uncheck it if checked.
 *
 * @param  {String} selector
 * @return
 */
__pulsar_utils__.uncheck = function(selector) {
    if (this.isChecked(selector)) {
        let ele = document.querySelector(selector)
        if (ele instanceof HTMLElement) {
            ele.click()
        }
    }
}
/**
 * Select the first element and extract the text
 *
 * @param  {String} selector
 * @return {String}
 */
__pulsar_utils__.outerHTML = function(selector) {
    let element = document.querySelector(selector)
    if (element != null) {
        return element.outerHTML
    }
    return null
};
/**
 * Select the first element and extract the text
 *
 * @param  {String} selector
 * @return {String}
 */
__pulsar_utils__.firstText = function(selector) {
    let element = document.querySelector(selector)
    if (element != null) {
        return element.textContent
    }
    return null
};
/**
 * Select elements and extract the texts
 *
 * @param  {String} selector
 * @return {Array}
 */
__pulsar_utils__.allTexts = function(selector) {
    let elements = document.querySelectorAll(selector)
    return elements.map(e => e.textContent)
};
/**
 * Select the first element and extract the text
 *
 * @param  {String} selector
 * @param  {String} attrName
 * @return {String}
 */
__pulsar_utils__.firstAttr = function(selector, attrName) {
    let element = document.querySelector(selector)
    if (element != null) {
        return element.getAttribute(attrName)
    }
    return null
};
/**
 * Select elements and extract the texts
 *
 * @param  {String} selector
 * @param  {String} attrName
 * @return {Array}
 */
__pulsar_utils__.allAttrs = function(selector, attrName) {
    let elements = document.querySelectorAll(selector)
    return elements.map(e => e.getAttribute(attrName))
};
/**
 * Select elements and extract the texts
 *
 * @param  {string} pattern
 * @param  {string} frameNameOrId
 * @return {string|null}
 */
__pulsar_utils__.findMatches = function(pattern, frameNameOrId) {
    let expression = `(//frame|//iframe)[@name="${frameNameOrId}" or @id="${frameNameOrId}"]`
    let frameContext = document.evaluate(expression, document,null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null
    ).snapshotItem(0).contentDocument;
    let element = frameContext.__pulsar_findMatches(pattern)
    return element?.textContent
};
/**
 * Select elements and extract the texts
 *
 * @param  {String} selector
 * @param  {String} attrName
 * @return {Array}
 */
__pulsar_utils__.findMatchesForAttrs = function(selector, attrName) {
    let elements = document.querySelectorAll(selector)
    return elements.map(e => e.getAttribute(attrName))
};
/**
 * Select elements and extract the texts
 *
 * @param  {string} selector
 * @param  {string} attrName
 * @return {any}
 */
__pulsar_utils__.doForAllFrames = function(selector, attrName) {
    this.__doForAllFramesRecursively(window, 0, selector, attrName)
    return "hello"
};
/**
 * Select elements and extract the texts.
 *
 * @param  {Window} rootFrame
 * @param  {string} selector
 * @param  {string} attrName
 * @return {any}
 */
__pulsar_utils__.__doForAllFramesRecursively = function(rootFrame, depth, selector, attrName) {
    let doc = rootFrame.document
    doc.body.style.background = "green";
    doc.body.setAttribute("data-user", "vincent")
    doc.body.setAttribute("data-depth", depth.toString())
    doc.body.setAttribute("data-frames", rootFrame.frames.length.toString())
    console.log(rootFrame.name)
    // doc.body.__pulsar_forEachElement(e => {
    //     let textContent = e.textContent
    //     if (textContent.contains("PRESS")) {
    //         // e.textContent = "PRESSED"
    //     }
    // })
    let dep = window.document.body.getAttribute("data-depth") || 0
    if (depth > dep) {
        window.document.body.setAttribute("data-depth", depth.toString())
    }
    const frames = rootFrame.frames; // or const frames = window.parent.frames;
    for (let i = 0; i < frames.length; i++) {
        // do something with each subframe as frames[i]
        let frame = frames[i]
        let doc1 = frame.document
        this.__doForAllFramesRecursively(frame, depth + 1, selector, attrName)
    }
    return frames.length
};
/**
 * Clones an object.
 *
 * @param  {Object} o
 * @return {Object}
 */
__pulsar_utils__.clone = function(o) {
    return JSON.parse(JSON.stringify(o))
};
/**
 * Get attribute as an integer
 * @param node {Element}
 * @param attrName {String}
 * @param defaultValue {Number}
 * @return {Number}
 * */
__pulsar_utils__.getIntAttribute = function(node, attrName, defaultValue) {
    if (!defaultValue) {
        defaultValue = 0;
    }
    let value = node.getAttribute(attrName);
    if (!value) {
        return defaultValue;
    }
    return parseInt(value);
};
/**
 * Increase the attribute value as if it's an integer
 * @param node {Element}
 * @param attrName {String}
 * @param add {Number}
 * */
__pulsar_utils__.increaseIntAttribute = function(node, attrName, add) {
    let value = node.getAttribute(attrName);
    if (!value) {
        value = '0';
    }
    value = parseInt(value) + add;
    node.setAttribute(attrName, value.toString())
};
/**
 * Get attribute as an integer
 * */
__pulsar_utils__.getReadableNodeName = function(node) {
    let name = node.tagName
        + (node.id ? ("#" + node.id) : "")
        + (node.className ? ("#" + node.className) : "");
    let seq = this.getIntAttribute(node, "_seq", -1);
    if (seq >= 0) {
        name += "-" + seq;
    }
    return name;
};
/**
 * Clean node's textContent
 * @param textContent {String} the string to clean
 * @return {String} The clean string
 * */
__pulsar_utils__.getCleanTextContent = function(textContent) {
    // all control characters
    // @see http://www.asciima.com/
    textContent = textContent.replace(/[\x00-\x1f]/g, " ");
    // combine all blanks into one " " character
    textContent = textContent.replace(/\s+/g, " ");
    return textContent.trim();
};
/**
 * Get clean, merged textContent from node list
 * @param nodeOrList {NodeList|Array|Node} the node from which we extract the content
 * @return {String} The clean string, "" if no text content available.
 * */
__pulsar_utils__.getMergedTextContent = function(nodeOrList) {
    if (!nodeOrList) {
        return "";
    }
    if (nodeOrList instanceof  Node) {
        return this.getTextContent(nodeOrList);
    }
    let content = "";
    for (let i = 0; i < nodeOrList.length; ++i) {
        if (i > 0) {
            content += " ";
        }
        content += this.getTextContent(nodeOrList[i]);
    }
    return content;
};
/**
 * Get clean node's textContent
 * @param node {Node} the node from which we extract the content
 * @return {String} The clean string, "" if no text content available.
 * */
__pulsar_utils__.getTextContent = function(node) {
    if (!node || !node.textContent || node.textContent.length === 0) {
        return "";
    }
    return this.getCleanTextContent(node.textContent);
};
/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 *
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
__pulsar_utils__.getTextWidth = function(text, font) {
    // re-use canvas object for better performance
    let canvas = this.getTextWidth.canvas || (__pulsar_utils__.getTextWidth.canvas = document.createElement("canvas"));
    let context = canvas.getContext("2d");
    context.font = font;
    let metrics = context.measureText(text);
    return Math.round(metrics.width * 10) / 10
};
/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {String} text The text to be rendered.
 * @param {HTMLElement} ele The container element.
 * */
__pulsar_utils__.getElementTextWidth = function(text, ele) {
    let style = window.getComputedStyle(ele);
    let font = style.getPropertyValue('font-weight') + ' '
        + style.getPropertyValue('font-size') + ' '
        + style.getPropertyValue('font-family');
    return this.getTextWidth(text, font);
};
/**
 * Format rectangle
 * @param top {Number}
 * @param left {Number}
 * @param width {Number}
 * @param height {Number}
 * @return {String|Boolean}
 * */
__pulsar_utils__.formatRect = function(top, left, width, height) {
    if (width === 0 && height === 0) {
        return false;
    }
    return ''
        + Math.round(top * 10) / 10 + ' '
        + Math.round(left * 10) / 10 + ' '
        + Math.round(width * 10) / 10 + ' '
        + Math.round(height * 10) / 10;
};
/**
 * Format a DOMRect object
 * @param rect {DOMRect}
 * @return {String|Boolean}
 * */
__pulsar_utils__.formatDOMRect = function(rect) {
    if (!rect || (rect.width === 0 && rect.height === 0)) {
        return false;
    }
    return ''
        + Math.round(rect.left * 10) / 10 + ' '
        + Math.round(rect.top * 10) / 10 + ' '
        + Math.round(rect.width * 10) / 10 + ' '
        + Math.round(rect.height * 10) / 10;
};
/**
 * Format a DOMRectList object
 * @param rectList {DOMRectList}
 * @return {String}
 * */
__pulsar_utils__.formatDOMRectList = function(rectList) {
    if (!rectList) {
        return '[]';
    }
    let r = "["
    for (let i = 0; i < rectList.length; ++i) {
        r += "{"
        r += this.formatDOMRect(rectList.item(i))
        r += "}, "
    }
    r += "]"
    return r
};
/**
 * The result is the smallest rectangle which contains the entire element, including the padding, border and margin.
 *
 * @param selector {string} The selector to get the element from.
 * @return {String}
 * */
__pulsar_utils__.queryClientRects = function(selector) {
    let ele = document.querySelector(selector);
    if (!ele) {
        return null;
    }
    return this.formatDOMRectList(ele.getClientRects())
};
/**
 * The result is the smallest rectangle which contains the entire element, including the padding, border and margin.
 *
 * @param selector {string} The selector to get the element from.
 * @return {DOMRect|String|Boolean}
 * */
__pulsar_utils__.queryClientRect = function(selector) {
    let ele = document.querySelector(selector);
    if (!ele) {
        return null;
    }
    let rect = ele.__pulsar_getRect()
    return this.formatDOMRect(rect)
};
/**
 * The result is the smallest rectangle which contains the entire element, including the padding, border and margin.
 *
 * @param node {Node|Element}
 * @return {DOMRect|Boolean|null}
 * */
__pulsar_utils__.getClientRect = function(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        return this.getTextNodeClientRect(node)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        return this.getElementClientRect(node)
    } else {
        return null
    }
};
/**
 * The computed style.
 *
 * @param node {Node|Element|Text}
 * @param propertyNames {Array}
 * @return {Object|Boolean|null}
 * */
__pulsar_utils__.getComputedStyle = function(node, propertyNames) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        let styles = {};
        let computedStyle = window.getComputedStyle(node, null);
        propertyNames.forEach(propertyName =>
            styles[propertyName] = this.getPropertyValue(computedStyle, propertyName)
        );
        return styles
    } else {
        return null
    }
};
/**
 * Get a simplified property value of computed style.
 *
 * @param style {CSSStyleDeclaration}
 * @param propertyName {String}
 * @return {String}
 * */
__pulsar_utils__.getPropertyValue = function(style, propertyName) {
    let value = style.getPropertyValue(propertyName);
    if (!value || value === '') {
        return ''
    }
    if (propertyName === 'font-size') {
        value = value.substring(0, value.lastIndexOf('px'))
    } else if (propertyName === 'color' || propertyName === 'background-color') {
        value = this.shortenHex(__pulsar_utils__.rgb2hex(value));
        // skip prefix '#'
        value = value.substring(1)
    }
    return value
};
/**
 * Color rgb(a) format to hex
 *
 * rgb(255, 255, 0) -> #
 *
 * @param rgb {String}
 * @return {String}
 * */
__pulsar_utils__.rgb2hex = function(rgb) {
    let parts = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (parts && parts.length === 4) ? "#" +
        ("0" + parseInt(parts[1],10).toString(16)).slice(-2) +
        ("0" + parseInt(parts[2],10).toString(16)).slice(-2) +
        ("0" + parseInt(parts[3],10).toString(16)).slice(-2) : '';
};
/**
 * CSS Hex to Shorthand Hex conversion
 * @param hex {String}
 * @return {String}
 * */
__pulsar_utils__.shortenHex = function(hex) {
    if ((hex.charAt(1) === hex.charAt(2))
        && (hex.charAt(3) === hex.charAt(4))
        && (hex.charAt(5) === hex.charAt(6))) {
        hex = "#" + hex.charAt(1) + hex.charAt(3) + hex.charAt(5);
    }
    // the most simple case: all chars are the same
    if (hex.length === 4) {
        let c = hex.charAt(1);
        if (hex.charAt(2) === c && hex.charAt(3) === c) {
            return '#' + c
        }
    }
    return hex
};
/**
 * Add to attribute
 *
 * @param node {Node|Element|Text}
 * @param attributeName {String}
 * @param key {String}
 * @param value {Object}
 * */
__pulsar_utils__.addTuple = function(node, attributeName, key, value) {
    let attributeValue = node.getAttribute(attributeName) || "";
    if (attributeValue.length > 0) {
        attributeValue += " "
    }
    attributeValue += key + ":" + value.toString();
    node.setAttribute(attributeName, attributeValue);
};
/**
 * The result is the smallest rectangle which contains the entire element, including the padding, border and margin.
 *
 * Properties other than width and height are relative to the top-left of the viewport.
 *
 * @see https://idiallo.com/javascript/element-postion
 * @see https://stackoverflow.com/questions/442404/retrieve-the-position-x-y-of-an-html-element
 *
 * @param ele {Node|Element}
 * @return {DOMRect|Boolean}
 * */
__pulsar_utils__.getElementClientRect = function(ele) {
    let bodyRect = this.bodyRect || (__pulsar_utils__.bodyRect = document.body.getBoundingClientRect());
    let r = ele.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) {
        return false
    }
    let top = r.top - bodyRect.top;
    let left = r.left - bodyRect.left;
    return new DOMRect(left, top, r.width, r.height);
};
/**
 * Get the client rect of a text node
 *
 * @param node {Node|Text}
 * @return {DOMRect|null}
 * */
__pulsar_utils__.getTextNodeClientRect = function(node) {
    let bodyRect = this.bodyRect || (__pulsar_utils__.bodyRect = document.body.getBoundingClientRect());
    let rect = null;
    let text = this.getTextContent(node);
    if (text.length > 0) {
        let range = document.createRange();
        range.selectNodeContents(node);
        let rects = range.getClientRects();
        if (rects.length > 0) {
            let r = rects[0];
            if (r.width > 0 && r.height > 0) {
                let top = r.top - bodyRect.top;
                let left = r.left - bodyRect.left;
                rect = new DOMRect(left, top, r.width, r.height);
            }
        }
    }
    return rect;
};
/**
 * The full page metrics
 * */
__pulsar_utils__.getFullPageMetrics = function() {
    let metrics = {
        width: Math.max(window.innerWidth, document.body.scrollWidth, document.documentElement.scrollWidth) | 0,
        height: Math.max(window.innerHeight, document.body.scrollHeight, document.documentElement.scrollHeight) | 0,
        deviceScaleFactor: window.devicePixelRatio || 1,
        mobile: typeof window.orientation !== 'undefined'
    };
    return JSON.stringify(metrics)
};
/**
 * Generate meta data
 * */
__pulsar_utils__.generateMetadata = function() {
    let config = __pulsar_CONFIGS
    let meta = document.getElementById(config.META_INFORMATION_ID);
    if (meta != null) {
        // already generated
        return
    }
    let date = new Date();
    let ele = document.createElement("input");
    ele.setAttribute("type", "hidden");
    ele.setAttribute("id", config.META_INFORMATION_ID);
    ele.setAttribute("domain", document.domain);
    ele.setAttribute("view-port", config.viewPortWidth + "x" + config.viewPortHeight);
    ele.setAttribute("date-time", date.toLocaleDateString() + " " + date.toLocaleTimeString());
    ele.setAttribute("timestamp", date.getTime().toString());
    document.body.appendChild(ele);
};
/**
 * Calculate visualization info and do human actions
 * */
__pulsar_utils__.compute = function() {
    if (!document.body || !document.body.firstChild) {
        return
    }
    const DATA_ERROR = "data-error";
    let done = document.body.hasAttribute(DATA_ERROR);
    if (done) {
        return
    }
    this.scrollToTop();
    // calling window.stop will pause all resource loading
    window.stop();
    this.updateStat();
    this.writeData();
    // remove temporary flags
    document.body.__pulsar_forEachElement(ele => {
        ele.removeAttribute("_ps_tp")
    });
    // traverse the DOM and compute necessary data, we must compute data before we perform humanization
    new __pulsar_NodeTraversor(new __pulsar_NodeFeatureCalculator()).traverse(document.body);
    this.generateMetadata();
    this.addProjectSpecifiedData();
    // if any script error occurs, the flag can NOT be seen
    document.body.setAttribute(DATA_ERROR, '0');
    return JSON.stringify(document.__pulsar__Data)
};
__pulsar_utils__.addProjectSpecifiedData = function() {
};
/**
 * Create a error without stack trace
 *
 * @param {String} message
 * @return {Error}
 * */
__pulsar_utils__.createStacklessError = function (message) {
    const error = new Error(message);
    // Chromium/WebKit should delete the stack instead.
    delete error.stack;
    return error;
}
/**
 * Return a + b.
 *
 * This simple function is used for a smoke test.
 *
 * @param a {Number}
 * @param b {Number}
 * @return {Number}
 * */
__pulsar_utils__.add = function(a, b) {
    return a + b
};
/**
 * Return type infomation.
 *
 * @return {Object}
 * */
__pulsar_utils__.typeInfo = function() {
    let fields = Object.keys(__pulsar_utils__).join(", ")
    return fields
};;
const __pulsar_DEFAULT_CONFIGS = {
    "propertyNames": ["font-size, color, background-color"],
    "viewPortWidth": 1920,
    "viewPortHeight": 1080,
    "META_INFORMATION_ID": "PulsarMetaInformation",
    "SCRIPT_SECTION_ID": "PulsarScriptSection",
    "ATTR_HIDDEN": "_h",
    "ATTR_OVERFLOW_HIDDEN": "_oh",
    "ATTR_OVERFLOW_VISIBLE": "_visible",
    "ATTR_ELEMENT_NODE_VI": "vi",
    "ATTR_TEXT_NODE_VI": "tv"
};;
"use strict";
/**
 * Set attribute if it's not blank
 * @param attrName {String}
 * @param attrValue {String}
 * */
Node.prototype.__pulsar_setAttributeIfNotBlank = function(attrName, attrValue) {
    if (this instanceof HTMLElement && attrValue && attrValue.trim().length > 0) {
        this.setAttribute(attrName, attrValue.trim())
    }
};
/**
 * @param predicate The predicate
 * */
Node.prototype.__pulsar_count = function(predicate) {
    let c = 0;
    let visitor = function () {};
    visitor.head = function (node, depth) {
        if (predicate(node)) {
            ++c;
        }
    };
    new __pulsar_NodeTraversor(visitor).traverse(this);
    return c;
};
/**
 * @param action The action applied to each node
 * */
Node.prototype.__pulsar_forEach = function(action) {
    let visitor = {};
    visitor.head = function (node, depth) {
        action(node)
    };
    new __pulsar_NodeTraversor(visitor).traverse(this);
};
/**
 * @param action The action applied to each node
 * */
Node.prototype.__pulsar_forEachElement = function(action) {
    let visitor = {};
    visitor.head = function (node, depth) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            action(node)
        }
    };
    new __pulsar_NodeTraversor(visitor).traverse(this);
};
/**
 * @param pattern The pattern to match
 * @return {Element|null}
 * */
Node.prototype.__pulsar_findMatches = function(pattern) {
    let visitor = {};
    let result = null
    visitor.head = function (node, depth) {
        if (node instanceof HTMLElement) {
            let text = node.textContent
            if (text.match(pattern)) {
                result = node
                visitor.stopped = true
            }
        }
    };
    new __pulsar_NodeTraversor(visitor).traverse(this);
    return result
};
/**
 * @return {boolean}
 * */
Node.prototype.__pulsar_isText = function() {
    return this.nodeType === Node.TEXT_NODE;
};
/**
 * @return {string}
 * */
Node.prototype.__pulsar_cleanText = function() {
    let text = this.textContent.replace(/\s+/g, ' ');
    // remove &nbsp;
    text = text.replace(/\u00A0/g, ' ');
    return text.trim();
};
/**
 * @return {boolean}
 * */
Node.prototype.__pulsar_isShortText = function() {
    if (!this.__pulsar_isText()) return false;
    let text = this.__pulsar_cleanText();
    return text.length >= 1 && text.length <= 9;
};
/**
 * @return {boolean}
 * */
Node.prototype.__pulsar_isNumberLike = function() {
    if (!this.__pulsar_isShortText()) return false;
    let text = this.__pulsar_cleanText().replace(/\s+/g, '');
    // matches ￥3,412.25, ￥3,412.25, 3,412.25, 3412.25, etc
    return /.{0,4}((\d+),?)*(\d+)\.?\d+.{0,3}/.test(text);
};
/**
 * @return {boolean}
 * */
Node.prototype.__pulsar_isElement = function() {
    return this.nodeType === Node.ELEMENT_NODE;
};
/**
 * @return {Element}
 * */
Node.prototype.__pulsar_bestElement = function() {
    if (this.__pulsar_isElement()) return this;
    else return this.parentElement;
};
/**
 * @return {boolean}
 * */
Node.prototype.__pulsar_isTextOrElement = function() {
    return this.__pulsar_isText() || this.__pulsar_isElement();
};
/**
 * @return {boolean}
 * */
Node.prototype.__pulsar_isDiv = function() {
    // HTML-uppercased qualified name
    return this.nodeName === "DIV";
};
/**
 * @return {boolean}
 * */
Node.prototype.__pulsar_isImage = function() {
    // HTML-uppercased qualified name
    return this.nodeName === "IMG";
};
/**
 * @return {Number}
 * */
Node.prototype.__pulsar_nScreen = function() {
    let rect = this.__pulsar_getRect();
    const config = __pulsar_CONFIGS;
    const viewPortHeight = config.viewPortHeight;
    let ns = rect.y / viewPortHeight;
    return Math.ceil(ns);
};
/**
 * @return {boolean}
 * */
Node.prototype.__pulsar_isSmallImage = function() {
    if (!this.__pulsar_isImage()) {
        return false
    }
    let rect = this.__pulsar_getRect();
    return rect.width <= 50 || rect.height <= 50;
};
/**
 * @return {boolean}
 * */
Node.prototype.__pulsar_isMediumImage = function() {
    if (!this.__pulsar_isImage()) {
        return false
    }
    let rect = this.__pulsar_getRect();
    let area = rect.width * rect.height;
    return rect.width > 50 && rect.height > 50 && area < 300 * 300;
};
/**
 * @return {boolean}
 * */
Node.prototype.__pulsar_isLargeImage = function() {
    if (!this.__pulsar_isImage()) {
        return false
    }
    let rect = this.__pulsar_getRect();
    let area = rect.width * rect.height;
    return area > 300 * 300;
};
/**
 * @return {boolean}
 * */
Node.prototype.__pulsar_isAnchor = function() {
    // HTML-uppercased qualified name
    // if (this instanceof HTMLAnchorElement)
    return this.nodeName === "A";
};
/**
 * @return {boolean}
 * */
Node.prototype.__pulsar_maybeClickable = function() {
    let element = this.__pulsar_bestElement();
    if (element == null) {
        return false
    }
    if (!element.__pulsar_isAnchor()) {
        return false
    }
    let clickable = true
    let rect = this.__pulsar_getRect()
    if (rect.x < 0 || rect.y < 0) {
        clickable = false
    }
    if (rect.width < 5 || rect.height < 5.0) {
        clickable = false
    }
    return clickable
};
/**
 * @return {boolean}
 * */
Node.prototype.__pulsar_isTile = function() {
    return this.__pulsar_isImage() || this.__pulsar_isText();
};
/**
 * @return {boolean}
 * */
Node.prototype.__pulsar_isIFrame = function() {
    return this.nodeName === "IFRAME";
};
/**
 * Get the estimated rect of this node, if the node is not an element, return it's parent element's rect
 * @return {DOMRect|null}
 * */
Node.prototype.__pulsar_getRect = function() {
    let element = this.__pulsar_bestElement();
    if (element == null) {
        return null
    }
    let rect = __pulsar_utils__.getClientRect(element);
    if (element.__pulsar_isImage()) {
        if (!rect) {
            rect = new DOMRect(0, 0, 0, 0)
        }
        if (rect.width === 0) {
            let w = element.getAttribute("width");
            if (w && /\d+/.test(w)) {
                rect.width = Number.parseInt(w)
            }
        }
        if (rect.height === 0) {
            let h = element.getAttribute("height");
            if (h && /\d+/.test(h)) {
                rect.height = Number.parseInt(h)
            }
        }
    }
    return rect
};
let __pulsar_NodeExt = function (node, config) {
    /**
     * The config
     * */
    this.config = config;
    /**
     * Desired property names of computed styles
     * Array
     * */
    this.propertyNames = [];
    /**
     * Computed styles
     * Map
     * */
    this.styles = {};
    /**
     * Max width for all descendants, if an element have property overflow:hidden, then
     * all it's descendants should hide the parts overflowed.
     * Number
     * */
    this.maxWidth = config.viewPortWidth;
    /**
     * The rectangle of this node
     * DOMRect
     * */
    this.rect = null;
    /**
     * Integer
     * */
    this.depth = 0;
    /**
     * Sequence
     * */
    this.sequence = 0;
    /**
     * Node
     * */
    this.node = node;
};
/**
 * Check if it's visible
 * https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
 * @return {boolean}
 * */
__pulsar_NodeExt.prototype.isVisible = function() {
    let hidden = this.node.offsetParent === null;
    if (hidden) {
        return false
    }
    return !this.isOverflowHidden()
};
__pulsar_NodeExt.prototype.isHidden = function() {
    return !this.isVisible();
};
/**
 * @return {boolean}
 * */
__pulsar_NodeExt.prototype.isOverflown = function() {
    return this.node.scrollHeight > this.node.clientHeight || this.node.scrollWidth > this.node.clientWidth;
};
/**
 * @return {boolean}
 * */
__pulsar_NodeExt.prototype.isOverflowHidden = function() {
    let p = this.parent();
    let maxWidth = this.config.viewPortWidth;
    return p != null && p.maxWidth < maxWidth && (this.left() >= p.right() || this.right() <= p.left());
};
/**
 * @return {boolean}
 * */
__pulsar_NodeExt.prototype.hasOverflowHidden = function() {
    return this.styles["overflow"] === "hidden";
};
/**
 * @return {boolean}
 * */
__pulsar_NodeExt.prototype.hasParent = function() {
    return this.node.parentElement != null && this.parent() != null;
};
/**
 * @return {__pulsar_NodeExt}
 * */
__pulsar_NodeExt.prototype.parent = function() {
    return this.node.parentElement.nodeExt;
};
/**
 * Get left
 * */
__pulsar_NodeExt.prototype.left = function() {
    return this.rect.left
};
/**
 * Get right
 * */
__pulsar_NodeExt.prototype.right = function() {
    return this.left() + this.width()
};
/**
 * Get top
 * */
__pulsar_NodeExt.prototype.top = function() {
    return this.rect.top
};
/**
 * Get bottom
 * */
__pulsar_NodeExt.prototype.bottom = function() {
    return this.top() + this.height()
};
/**
 * Get width
 * */
__pulsar_NodeExt.prototype.width = function() {
    return this.rect.width
};
/**
 * Get height
 * */
__pulsar_NodeExt.prototype.height = function() {
    return this.rect.height
};
/**
 * @param width {Number|null}
 * */
__pulsar_NodeExt.prototype.updateMaxWidth = function(width) {
    if (this.hasParent()) {
        this.maxWidth = Math.min(this.parent().maxWidth, width);
    }
};
/**
 * Get the attribute value
 * @param attrName {String}
 * @return {String|null}
 * */
__pulsar_NodeExt.prototype.attr = function(attrName) {
    if (this.node.isElement()) {
        return this.node.getAttribute(attrName)
    }
    return null
};
/**
 * Get the formatted rect
 * */
__pulsar_NodeExt.prototype.formatDOMRect = function() {
    return __pulsar_utils__.formatDOMRect(this.rect)
};
/**
 * Get the formatted rect
 * @return string
 * */
__pulsar_NodeExt.prototype.formatStyles = function() {
    return this.propertyNames.map(propertyName => this.styles[propertyName]).join(", ")
};
/**
 * Adjust the node's DOMRect
 * If the child element larger than the parent and the parent have overflow:hidden style,
 * the child element's DOMRect should be adjusted
 * */
__pulsar_NodeExt.prototype.adjustDOMRect = function() {
    if (this.rect) {
        this.rect.width = Math.min(this.rect.width, this.maxWidth);
    }
};;
/**
 * Created by vincent on 16-5-17.
 */
"use strict";
/**
 * Create a new traversor.
 *
 * @param visitor {Object} a class implementing the {@link NodeFeatureCalculator} interface, to be called when visiting each node.
 */
let __pulsar_NodeTraversor = function(visitor) {
    this.visitor = visitor;
    this.options = {
        diagnosis : false
    };
    if (arguments.length > 1) {
        this.options = arguments[1];
    }
}
/**
 * Start a depth-first traverse of the root and all of its descendants.
 * @param root {Node} the root node point to traverse.
 */
__pulsar_NodeTraversor.prototype.traverse = function(root) {
    let node = root
    let depth = 0
    let visitor = this.visitor
    visitor.stopped = false
    if (!visitor.tail) {
        // empty function
        visitor.tail = function () {}
    }
    while (!visitor.stopped && node != null) {
        visitor.head(node, depth);
        if (node.childNodes.length > 0) {
            node = node.childNodes[0];
            depth++;
        } else {
            while (node.nextSibling == null && depth > 0) {
                visitor.tail(node, depth);
                node = node.parentNode;
                depth--;
            }
            visitor.tail(node, depth);
            if (node === root)
                break;
            node = node.nextSibling;
        }
    }
};;
/**
 * Created by vincent on 16-5-17.
 *
 * NodeVisitor: used with NodeTraversor together
 */
/**
 * Create a new NodeFeatureCalculator
 */
let __pulsar_NodeFeatureCalculator = function() {
    this.stopped = false;
    this.config = __pulsar_CONFIGS || __pulsar_DEFAULT_CONFIGS;
    this.debug = this.config.debug;
    this.sequence = 0;
};
/**
 * Check if stopped
 */
__pulsar_NodeFeatureCalculator.prototype.isStopped = function() {
    return this.stopped;
};
/**
 * Enter the element for the first time
 * @param node {Node} the node to enter
 * @param  depth {Number} the depth in the DOM
 */
__pulsar_NodeFeatureCalculator.prototype.head = function(node, depth) {
    if (node.__pulsar_isIFrame()) {
        return
    }
    ++this.sequence;
    node.__pulsar_nodeExt = new __pulsar_NodeExt(node, this.config);
    this.calcSelfIndicator(node, depth);
};
/**
 * Calculate the features of the Node itself
 * @param node {Node|Text|HTMLElement} the node to enter
 * @param  depth {Number} the depth in the DOM
 */
__pulsar_NodeFeatureCalculator.prototype.calcSelfIndicator = function(node, depth) {
    let nodeExt = node.__pulsar_nodeExt;
    if (node.__pulsar_isText()) {
        this.calcCharacterWidth(node, depth);
    }
    nodeExt.depth = depth;
    nodeExt.sequence = this.sequence;
    if (node.__pulsar_isElement()) {
        // Browser computed styles. Only leaf elements matter
        nodeExt.propertyNames = this.config.propertyNames || [];
        let requiredPropertyNames = nodeExt.propertyNames.concat("overflow");
        nodeExt.styles = __pulsar_utils__.getComputedStyle(node, requiredPropertyNames);
    }
    // Calculate the rectangle of this node
    nodeExt.rect = node.__pulsar_getRect();
    // TODO: since there are too many _hidden nodes, we should simplified it to save space
    if (node.__pulsar_isElement()) {
        // "hidden" seems not defined properly,
        // some parent element is "hidden" and some of there children are not expected to be hidden
        // for example, ul tag often have a zero dimension
        if (nodeExt.isHidden()) {
            // node.toggleAttribute(ATTR_HIDDEN, true);
            node.setAttribute(this.config.ATTR_HIDDEN, '');
        }
        if (nodeExt.isOverflowHidden() || (nodeExt.hasParent() && nodeExt.parent().node.hasAttribute(this.config.ATTR_OVERFLOW_HIDDEN))) {
            // node.toggleAttribute(ATTR_OVERFLOW_HIDDEN, true);
            node.setAttribute(this.config.ATTR_OVERFLOW_HIDDEN, '');
        }
    }
    // all descendant nodes should be smaller than this one
    if (nodeExt.hasOverflowHidden()) {
        // TODO: also update max height
        nodeExt.updateMaxWidth(nodeExt.rect.width);
    } else {
        nodeExt.updateMaxWidth(this.config.viewPortWidth);
    }
    nodeExt.adjustDOMRect();
};
/**
 * Leaving the the element
 *
 * @param node {Node|Element} the node visited
 * @param  depth {Number} the depth in the DOM
 */
__pulsar_NodeFeatureCalculator.prototype.tail = function(node, depth) {
    if (node.__pulsar_isIFrame()) {
        return
    }
    let config = this.config
    let nodeExt = node.__pulsar_nodeExt;
    if (!nodeExt) {
        return
    }
    if (node.__pulsar_isElement()) {
        node.__pulsar_setAttributeIfNotBlank(config.ATTR_COMPUTED_STYLE, nodeExt.formatStyles());
        node.__pulsar_setAttributeIfNotBlank(config.ATTR_ELEMENT_NODE_VI, nodeExt.formatDOMRect());
        // calculate the rectangle of each child text node
        for (let i = 0; i < node.childNodes.length; ++i) {
            let childNodeExt = node.childNodes[i].__pulsar_nodeExt;
            if (childNodeExt && childNodeExt.node.__pulsar_isText()) {
                // 'tv' is short for 'text node vision information'
                node.__pulsar_setAttributeIfNotBlank(config.ATTR_TEXT_NODE_VI + i, childNodeExt.formatDOMRect());
            }
        }
    }
    if (this.debug > 0) {
        this.addDebugInfo()
    }
};
/**
 * Calculate the width of the text node, this is a complement of the rectangle information, can be used for debugging
 *
 * @param node {Node} the node to enter
 * @param  depth {Number} the depth in the DOM
 * @return {Number}
 */
__pulsar_NodeFeatureCalculator.prototype.calcCharacterWidth = function(node, depth) {
    let parent = node.parentElement;
    let cw = parent.getAttribute('_cw');
    let width = 0;
    if (!cw) {
        let text = __pulsar_utils__.getTextContent(node);
        if (text.length > 0) {
            width = __pulsar_utils__.getElementTextWidth(text, parent);
            cw = Math.round(width / text.length * 10) / 10;
            parent.setAttribute('_cw', cw.toString())
        }
    }
    return width
};
__pulsar_NodeFeatureCalculator.prototype.addDebugInfo = function(node) {
    if (!node.__pulsar_nodeExt) {
        return
    }
    let config = this.config;
    let nodeExt = node.__pulsar_nodeExt;
    if (node.__pulsar_isText()) {
        // 'tl' is short for 'text length', it's used to diagnosis
        if (node.textContent) {
            __pulsar_utils__.addTuple(node, config.ATTR_DEBUG, "tl" + i, node.textContent.length);
        }
    } else {
        let descend = __pulsar_utils__.getIntAttribute(node, "_d", 0);
        __pulsar_utils__.increaseIntAttribute(node.parentElement, '_d', 1);
    }
};