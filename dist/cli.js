#!/usr/bin/env bun
// @bun
// node_modules/@opentui/solid/index.js
import { CliRenderer, createCliRenderer, engine as engine2 } from "@opentui/core";
import { createTestRenderer } from "@opentui/core/testing";
import {
  ASCIIFontRenderable,
  BoxRenderable,
  CodeRenderable,
  DiffRenderable,
  InputRenderable as InputRenderable2,
  LineNumberRenderable,
  MarkdownRenderable,
  ScrollBoxRenderable as ScrollBoxRenderable2,
  SelectRenderable as SelectRenderable2,
  TabSelectRenderable as TabSelectRenderable2,
  TextareaRenderable,
  TextAttributes,
  TextNodeRenderable as TextNodeRenderable3,
  TextRenderable as TextRenderable3
} from "@opentui/core";
import {
  engine,
  Timeline
} from "@opentui/core";

// node_modules/solid-js/dist/server.js
var sharedConfig = {
  context: undefined,
  registry: undefined,
  effects: undefined,
  done: false,
  getContextId() {
    return getContextId(this.context.count);
  },
  getNextContextId() {
    return getContextId(this.context.count++);
  }
};
function getContextId(count) {
  const num = String(count), len = num.length - 1;
  return sharedConfig.context.id + (len ? String.fromCharCode(96 + len) : "") + num;
}
function setHydrateContext(context) {
  sharedConfig.context = context;
}
function nextHydrateContext() {
  return {
    ...sharedConfig.context,
    id: sharedConfig.getNextContextId(),
    count: 0
  };
}
var IS_DEV = false;
var equalFn = (a, b) => a === b;
var $PROXY = Symbol("solid-proxy");
var SUPPORTS_PROXY = typeof Proxy === "function";
var $TRACK = Symbol("solid-track");
var $DEVCOMP = Symbol("solid-dev-component");
var signalOptions = {
  equals: equalFn
};
var ERROR = null;
var runEffects = runQueue;
var STALE = 1;
var PENDING = 2;
var UNOWNED = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
};
var Owner = null;
var Transition = null;
var Scheduler = null;
var ExternalSourceConfig = null;
var Listener = null;
var Updates = null;
var Effects = null;
var ExecCount = 0;
function createRoot(fn, detachedOwner) {
  const listener = Listener, owner = Owner, unowned = fn.length === 0, current = detachedOwner === undefined ? owner : detachedOwner, root = unowned ? UNOWNED : {
    owned: null,
    cleanups: null,
    context: current ? current.context : null,
    owner: current
  }, updateFn = unowned ? fn : () => fn(() => untrack(() => cleanNode(root)));
  Owner = root;
  Listener = null;
  try {
    return runUpdates(updateFn, true);
  } finally {
    Listener = listener;
    Owner = owner;
  }
}
function createSignal(value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const s = {
    value,
    observers: null,
    observerSlots: null,
    comparator: options.equals || undefined
  };
  const setter = (value2) => {
    if (typeof value2 === "function") {
      if (Transition && Transition.running && Transition.sources.has(s))
        value2 = value2(s.tValue);
      else
        value2 = value2(s.value);
    }
    return writeSignal(s, value2);
  };
  return [readSignal.bind(s), setter];
}
function createRenderEffect(fn, value, options) {
  const c = createComputation(fn, value, false, STALE);
  if (Scheduler && Transition && Transition.running)
    Updates.push(c);
  else
    updateComputation(c);
}
function createEffect(fn, value, options) {
  runEffects = runUserEffects;
  const c = createComputation(fn, value, false, STALE), s = SuspenseContext && useContext(SuspenseContext);
  if (s)
    c.suspense = s;
  if (!options || !options.render)
    c.user = true;
  Effects ? Effects.push(c) : updateComputation(c);
}
function createMemo(fn, value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const c = createComputation(fn, value, true, 0);
  c.observers = null;
  c.observerSlots = null;
  c.comparator = options.equals || undefined;
  if (Scheduler && Transition && Transition.running) {
    c.tState = STALE;
    Updates.push(c);
  } else
    updateComputation(c);
  return readSignal.bind(c);
}
function batch(fn) {
  return runUpdates(fn, false);
}
function untrack(fn) {
  if (!ExternalSourceConfig && Listener === null)
    return fn();
  const listener = Listener;
  Listener = null;
  try {
    if (ExternalSourceConfig)
      return ExternalSourceConfig.untrack(fn);
    return fn();
  } finally {
    Listener = listener;
  }
}
function onMount(fn) {
  createEffect(() => untrack(fn));
}
function onCleanup(fn) {
  if (Owner === null)
    ;
  else if (Owner.cleanups === null)
    Owner.cleanups = [fn];
  else
    Owner.cleanups.push(fn);
  return fn;
}
function getListener() {
  return Listener;
}
function startTransition(fn) {
  if (Transition && Transition.running) {
    fn();
    return Transition.done;
  }
  const l = Listener;
  const o = Owner;
  return Promise.resolve().then(() => {
    Listener = l;
    Owner = o;
    let t;
    if (Scheduler || SuspenseContext) {
      t = Transition || (Transition = {
        sources: new Set,
        effects: [],
        promises: new Set,
        disposed: new Set,
        queue: new Set,
        running: true
      });
      t.done || (t.done = new Promise((res) => t.resolve = res));
      t.running = true;
    }
    runUpdates(fn, false);
    Listener = Owner = null;
    return t ? t.done : undefined;
  });
}
var [transPending, setTransPending] = /* @__PURE__ */ createSignal(false);
function createContext(defaultValue, options) {
  const id = Symbol("context");
  return {
    id,
    Provider: createProvider(id),
    defaultValue
  };
}
function useContext(context) {
  let value;
  return Owner && Owner.context && (value = Owner.context[context.id]) !== undefined ? value : context.defaultValue;
}
function children(fn) {
  const children2 = createMemo(fn);
  const memo = createMemo(() => resolveChildren(children2()));
  memo.toArray = () => {
    const c = memo();
    return Array.isArray(c) ? c : c != null ? [c] : [];
  };
  return memo;
}
var SuspenseContext;
function readSignal() {
  const runningTransition = Transition && Transition.running;
  if (this.sources && (runningTransition ? this.tState : this.state)) {
    if ((runningTransition ? this.tState : this.state) === STALE)
      updateComputation(this);
    else {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(this), false);
      Updates = updates;
    }
  }
  if (Listener) {
    const sSlot = this.observers ? this.observers.length : 0;
    if (!Listener.sources) {
      Listener.sources = [this];
      Listener.sourceSlots = [sSlot];
    } else {
      Listener.sources.push(this);
      Listener.sourceSlots.push(sSlot);
    }
    if (!this.observers) {
      this.observers = [Listener];
      this.observerSlots = [Listener.sources.length - 1];
    } else {
      this.observers.push(Listener);
      this.observerSlots.push(Listener.sources.length - 1);
    }
  }
  if (runningTransition && Transition.sources.has(this))
    return this.tValue;
  return this.value;
}
function writeSignal(node, value, isComp) {
  let current = Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value;
  if (!node.comparator || !node.comparator(current, value)) {
    if (Transition) {
      const TransitionRunning = Transition.running;
      if (TransitionRunning || !isComp && Transition.sources.has(node)) {
        Transition.sources.add(node);
        node.tValue = value;
      }
      if (!TransitionRunning)
        node.value = value;
    } else
      node.value = value;
    if (node.observers && node.observers.length) {
      runUpdates(() => {
        for (let i = 0;i < node.observers.length; i += 1) {
          const o = node.observers[i];
          const TransitionRunning = Transition && Transition.running;
          if (TransitionRunning && Transition.disposed.has(o))
            continue;
          if (TransitionRunning ? !o.tState : !o.state) {
            if (o.pure)
              Updates.push(o);
            else
              Effects.push(o);
            if (o.observers)
              markDownstream(o);
          }
          if (!TransitionRunning)
            o.state = STALE;
          else
            o.tState = STALE;
        }
        if (Updates.length > 1e6) {
          Updates = [];
          if (IS_DEV)
            ;
          throw new Error;
        }
      }, false);
    }
  }
  return value;
}
function updateComputation(node) {
  if (!node.fn)
    return;
  cleanNode(node);
  const time = ExecCount;
  runComputation(node, Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value, time);
  if (Transition && !Transition.running && Transition.sources.has(node)) {
    queueMicrotask(() => {
      runUpdates(() => {
        Transition && (Transition.running = true);
        Listener = Owner = node;
        runComputation(node, node.tValue, time);
        Listener = Owner = null;
      }, false);
    });
  }
}
function runComputation(node, value, time) {
  let nextValue;
  const owner = Owner, listener = Listener;
  Listener = Owner = node;
  try {
    nextValue = node.fn(value);
  } catch (err) {
    if (node.pure) {
      if (Transition && Transition.running) {
        node.tState = STALE;
        node.tOwned && node.tOwned.forEach(cleanNode);
        node.tOwned = undefined;
      } else {
        node.state = STALE;
        node.owned && node.owned.forEach(cleanNode);
        node.owned = null;
      }
    }
    node.updatedAt = time + 1;
    return handleError(err);
  } finally {
    Listener = listener;
    Owner = owner;
  }
  if (!node.updatedAt || node.updatedAt <= time) {
    if (node.updatedAt != null && "observers" in node) {
      writeSignal(node, nextValue, true);
    } else if (Transition && Transition.running && node.pure) {
      Transition.sources.add(node);
      node.tValue = nextValue;
    } else
      node.value = nextValue;
    node.updatedAt = time;
  }
}
function createComputation(fn, init, pure, state = STALE, options) {
  const c = {
    fn,
    state,
    updatedAt: null,
    owned: null,
    sources: null,
    sourceSlots: null,
    cleanups: null,
    value: init,
    owner: Owner,
    context: Owner ? Owner.context : null,
    pure
  };
  if (Transition && Transition.running) {
    c.state = 0;
    c.tState = state;
  }
  if (Owner === null)
    ;
  else if (Owner !== UNOWNED) {
    if (Transition && Transition.running && Owner.pure) {
      if (!Owner.tOwned)
        Owner.tOwned = [c];
      else
        Owner.tOwned.push(c);
    } else {
      if (!Owner.owned)
        Owner.owned = [c];
      else
        Owner.owned.push(c);
    }
  }
  if (ExternalSourceConfig && c.fn) {
    const [track, trigger] = createSignal(undefined, {
      equals: false
    });
    const ordinary = ExternalSourceConfig.factory(c.fn, trigger);
    onCleanup(() => ordinary.dispose());
    const triggerInTransition = () => startTransition(trigger).then(() => inTransition.dispose());
    const inTransition = ExternalSourceConfig.factory(c.fn, triggerInTransition);
    c.fn = (x) => {
      track();
      return Transition && Transition.running ? inTransition.track(x) : ordinary.track(x);
    };
  }
  return c;
}
function runTop(node) {
  const runningTransition = Transition && Transition.running;
  if ((runningTransition ? node.tState : node.state) === 0)
    return;
  if ((runningTransition ? node.tState : node.state) === PENDING)
    return lookUpstream(node);
  if (node.suspense && untrack(node.suspense.inFallback))
    return node.suspense.effects.push(node);
  const ancestors = [node];
  while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
    if (runningTransition && Transition.disposed.has(node))
      return;
    if (runningTransition ? node.tState : node.state)
      ancestors.push(node);
  }
  for (let i = ancestors.length - 1;i >= 0; i--) {
    node = ancestors[i];
    if (runningTransition) {
      let top = node, prev = ancestors[i + 1];
      while ((top = top.owner) && top !== prev) {
        if (Transition.disposed.has(top))
          return;
      }
    }
    if ((runningTransition ? node.tState : node.state) === STALE) {
      updateComputation(node);
    } else if ((runningTransition ? node.tState : node.state) === PENDING) {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(node, ancestors[0]), false);
      Updates = updates;
    }
  }
}
function runUpdates(fn, init) {
  if (Updates)
    return fn();
  let wait = false;
  if (!init)
    Updates = [];
  if (Effects)
    wait = true;
  else
    Effects = [];
  ExecCount++;
  try {
    const res = fn();
    completeUpdates(wait);
    return res;
  } catch (err) {
    if (!wait)
      Effects = null;
    Updates = null;
    handleError(err);
  }
}
function completeUpdates(wait) {
  if (Updates) {
    if (Scheduler && Transition && Transition.running)
      scheduleQueue(Updates);
    else
      runQueue(Updates);
    Updates = null;
  }
  if (wait)
    return;
  let res;
  if (Transition) {
    if (!Transition.promises.size && !Transition.queue.size) {
      const sources = Transition.sources;
      const disposed = Transition.disposed;
      Effects.push.apply(Effects, Transition.effects);
      res = Transition.resolve;
      for (const e2 of Effects) {
        "tState" in e2 && (e2.state = e2.tState);
        delete e2.tState;
      }
      Transition = null;
      runUpdates(() => {
        for (const d of disposed)
          cleanNode(d);
        for (const v of sources) {
          v.value = v.tValue;
          if (v.owned) {
            for (let i = 0, len = v.owned.length;i < len; i++)
              cleanNode(v.owned[i]);
          }
          if (v.tOwned)
            v.owned = v.tOwned;
          delete v.tValue;
          delete v.tOwned;
          v.tState = 0;
        }
        setTransPending(false);
      }, false);
    } else if (Transition.running) {
      Transition.running = false;
      Transition.effects.push.apply(Transition.effects, Effects);
      Effects = null;
      setTransPending(true);
      return;
    }
  }
  const e = Effects;
  Effects = null;
  if (e.length)
    runUpdates(() => runEffects(e), false);
  if (res)
    res();
}
function runQueue(queue) {
  for (let i = 0;i < queue.length; i++)
    runTop(queue[i]);
}
function scheduleQueue(queue) {
  for (let i = 0;i < queue.length; i++) {
    const item = queue[i];
    const tasks = Transition.queue;
    if (!tasks.has(item)) {
      tasks.add(item);
      Scheduler(() => {
        tasks.delete(item);
        runUpdates(() => {
          Transition.running = true;
          runTop(item);
        }, false);
        Transition && (Transition.running = false);
      });
    }
  }
}
function runUserEffects(queue) {
  let i, userLength = 0;
  for (i = 0;i < queue.length; i++) {
    const e = queue[i];
    if (!e.user)
      runTop(e);
    else
      queue[userLength++] = e;
  }
  if (sharedConfig.context) {
    if (sharedConfig.count) {
      sharedConfig.effects || (sharedConfig.effects = []);
      sharedConfig.effects.push(...queue.slice(0, userLength));
      return;
    }
    setHydrateContext();
  }
  if (sharedConfig.effects && (sharedConfig.done || !sharedConfig.count)) {
    queue = [...sharedConfig.effects, ...queue];
    userLength += sharedConfig.effects.length;
    delete sharedConfig.effects;
  }
  for (i = 0;i < userLength; i++)
    runTop(queue[i]);
}
function lookUpstream(node, ignore) {
  const runningTransition = Transition && Transition.running;
  if (runningTransition)
    node.tState = 0;
  else
    node.state = 0;
  for (let i = 0;i < node.sources.length; i += 1) {
    const source = node.sources[i];
    if (source.sources) {
      const state = runningTransition ? source.tState : source.state;
      if (state === STALE) {
        if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount))
          runTop(source);
      } else if (state === PENDING)
        lookUpstream(source, ignore);
    }
  }
}
function markDownstream(node) {
  const runningTransition = Transition && Transition.running;
  for (let i = 0;i < node.observers.length; i += 1) {
    const o = node.observers[i];
    if (runningTransition ? !o.tState : !o.state) {
      if (runningTransition)
        o.tState = PENDING;
      else
        o.state = PENDING;
      if (o.pure)
        Updates.push(o);
      else
        Effects.push(o);
      o.observers && markDownstream(o);
    }
  }
}
function cleanNode(node) {
  let i;
  if (node.sources) {
    while (node.sources.length) {
      const source = node.sources.pop(), index = node.sourceSlots.pop(), obs = source.observers;
      if (obs && obs.length) {
        const n = obs.pop(), s = source.observerSlots.pop();
        if (index < obs.length) {
          n.sourceSlots[s] = index;
          obs[index] = n;
          source.observerSlots[index] = s;
        }
      }
    }
  }
  if (node.tOwned) {
    for (i = node.tOwned.length - 1;i >= 0; i--)
      cleanNode(node.tOwned[i]);
    delete node.tOwned;
  }
  if (Transition && Transition.running && node.pure) {
    reset(node, true);
  } else if (node.owned) {
    for (i = node.owned.length - 1;i >= 0; i--)
      cleanNode(node.owned[i]);
    node.owned = null;
  }
  if (node.cleanups) {
    for (i = node.cleanups.length - 1;i >= 0; i--)
      node.cleanups[i]();
    node.cleanups = null;
  }
  if (Transition && Transition.running)
    node.tState = 0;
  else
    node.state = 0;
}
function reset(node, top) {
  if (!top) {
    node.tState = 0;
    Transition.disposed.add(node);
  }
  if (node.owned) {
    for (let i = 0;i < node.owned.length; i++)
      reset(node.owned[i]);
  }
}
function castError(err) {
  if (err instanceof Error)
    return err;
  return new Error(typeof err === "string" ? err : "Unknown error", {
    cause: err
  });
}
function runErrors(err, fns, owner) {
  try {
    for (const f of fns)
      f(err);
  } catch (e) {
    handleError(e, owner && owner.owner || null);
  }
}
function handleError(err, owner = Owner) {
  const fns = ERROR && owner && owner.context && owner.context[ERROR];
  const error = castError(err);
  if (!fns)
    throw error;
  if (Effects)
    Effects.push({
      fn() {
        runErrors(error, fns, owner);
      },
      state: STALE
    });
  else
    runErrors(error, fns, owner);
}
function resolveChildren(children2) {
  if (typeof children2 === "function" && !children2.length)
    return resolveChildren(children2());
  if (Array.isArray(children2)) {
    const results = [];
    for (let i = 0;i < children2.length; i++) {
      const result = resolveChildren(children2[i]);
      Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
    }
    return results;
  }
  return children2;
}
function createProvider(id, options) {
  return function provider(props) {
    let res;
    createRenderEffect(() => res = untrack(() => {
      Owner.context = {
        ...Owner.context,
        [id]: props.value
      };
      return children(() => props.children);
    }), undefined);
    return res;
  };
}
var FALLBACK = Symbol("fallback");
var hydrationEnabled = false;
function createComponent(Comp, props) {
  if (hydrationEnabled) {
    if (sharedConfig.context) {
      const c = sharedConfig.context;
      setHydrateContext(nextHydrateContext());
      const r = untrack(() => Comp(props || {}));
      setHydrateContext(c);
      return r;
    }
  }
  return untrack(() => Comp(props || {}));
}
function trueFn() {
  return true;
}
var propTraps = {
  get(_, property, receiver) {
    if (property === $PROXY)
      return receiver;
    return _.get(property);
  },
  has(_, property) {
    if (property === $PROXY)
      return true;
    return _.has(property);
  },
  set: trueFn,
  deleteProperty: trueFn,
  getOwnPropertyDescriptor(_, property) {
    return {
      configurable: true,
      enumerable: true,
      get() {
        return _.get(property);
      },
      set: trueFn,
      deleteProperty: trueFn
    };
  },
  ownKeys(_) {
    return _.keys();
  }
};
function resolveSource(s) {
  return !(s = typeof s === "function" ? s() : s) ? {} : s;
}
function resolveSources() {
  for (let i = 0, length = this.length;i < length; ++i) {
    const v = this[i]();
    if (v !== undefined)
      return v;
  }
}
function mergeProps(...sources) {
  let proxy = false;
  for (let i = 0;i < sources.length; i++) {
    const s = sources[i];
    proxy = proxy || !!s && $PROXY in s;
    sources[i] = typeof s === "function" ? (proxy = true, createMemo(s)) : s;
  }
  if (SUPPORTS_PROXY && proxy) {
    return new Proxy({
      get(property) {
        for (let i = sources.length - 1;i >= 0; i--) {
          const v = resolveSource(sources[i])[property];
          if (v !== undefined)
            return v;
        }
      },
      has(property) {
        for (let i = sources.length - 1;i >= 0; i--) {
          if (property in resolveSource(sources[i]))
            return true;
        }
        return false;
      },
      keys() {
        const keys = [];
        for (let i = 0;i < sources.length; i++)
          keys.push(...Object.keys(resolveSource(sources[i])));
        return [...new Set(keys)];
      }
    }, propTraps);
  }
  const sourcesMap = {};
  const defined = Object.create(null);
  for (let i = sources.length - 1;i >= 0; i--) {
    const source = sources[i];
    if (!source)
      continue;
    const sourceKeys = Object.getOwnPropertyNames(source);
    for (let i2 = sourceKeys.length - 1;i2 >= 0; i2--) {
      const key = sourceKeys[i2];
      if (key === "__proto__" || key === "constructor")
        continue;
      const desc = Object.getOwnPropertyDescriptor(source, key);
      if (!defined[key]) {
        defined[key] = desc.get ? {
          enumerable: true,
          configurable: true,
          get: resolveSources.bind(sourcesMap[key] = [desc.get.bind(source)])
        } : desc.value !== undefined ? desc : undefined;
      } else {
        const sources2 = sourcesMap[key];
        if (sources2) {
          if (desc.get)
            sources2.push(desc.get.bind(source));
          else if (desc.value !== undefined)
            sources2.push(() => desc.value);
        }
      }
    }
  }
  const target = {};
  const definedKeys = Object.keys(defined);
  for (let i = definedKeys.length - 1;i >= 0; i--) {
    const key = definedKeys[i], desc = defined[key];
    if (desc && desc.get)
      Object.defineProperty(target, key, desc);
    else
      target[key] = desc ? desc.value : undefined;
  }
  return target;
}
var narrowedError = (name) => `Stale read from <${name}>.`;
function Show(props) {
  const keyed = props.keyed;
  const conditionValue = createMemo(() => props.when, undefined, undefined);
  const condition = keyed ? conditionValue : createMemo(conditionValue, undefined, {
    equals: (a, b) => !a === !b
  });
  return createMemo(() => {
    const c = condition();
    if (c) {
      const child = props.children;
      const fn = typeof child === "function" && child.length > 0;
      return fn ? untrack(() => child(keyed ? c : () => {
        if (!untrack(condition))
          throw narrowedError("Show");
        return conditionValue();
      })) : child;
    }
    return props.fallback;
  }, undefined, undefined);
}
function Switch(props) {
  const chs = children(() => props.children);
  const switchFunc = createMemo(() => {
    const ch = chs();
    const mps = Array.isArray(ch) ? ch : [ch];
    let func = () => {
      return;
    };
    for (let i = 0;i < mps.length; i++) {
      const index = i;
      const mp = mps[i];
      const prevFunc = func;
      const conditionValue = createMemo(() => prevFunc() ? undefined : mp.when, undefined, undefined);
      const condition = mp.keyed ? conditionValue : createMemo(conditionValue, undefined, {
        equals: (a, b) => !a === !b
      });
      func = () => prevFunc() || (condition() ? [index, conditionValue, mp] : undefined);
    }
    return func;
  });
  return createMemo(() => {
    const sel = switchFunc()();
    if (!sel)
      return props.fallback;
    const [index, conditionValue, mp] = sel;
    const child = mp.children;
    const fn = typeof child === "function" && child.length > 0;
    return fn ? untrack(() => child(mp.keyed ? conditionValue() : () => {
      if (untrack(switchFunc)()?.[0] !== index)
        throw narrowedError("Match");
      return conditionValue();
    })) : child;
  }, undefined, undefined);
}
function Match(props) {
  return props;
}

// node_modules/@opentui/solid/index.js
import {
  BaseRenderable,
  createTextAttributes,
  InputRenderable,
  InputRenderableEvents,
  isTextNodeRenderable,
  parseColor,
  Renderable,
  RootTextNodeRenderable,
  ScrollBoxRenderable,
  SelectRenderable,
  SelectRenderableEvents,
  TabSelectRenderable,
  TabSelectRenderableEvents,
  TextNodeRenderable,
  TextRenderable
} from "@opentui/core";
import { BaseRenderable as BaseRenderable2, isTextNodeRenderable as isTextNodeRenderable2, TextNodeRenderable as TextNodeRenderable2, TextRenderable as TextRenderable2, Yoga } from "@opentui/core";
var RendererContext = createContext();
var useRenderer = () => {
  const renderer = useContext(RendererContext);
  if (!renderer) {
    throw new Error("No renderer found");
  }
  return renderer;
};
var onResize = (callback) => {
  const renderer = useRenderer();
  onMount(() => {
    renderer.on("resize", callback);
  });
  onCleanup(() => {
    renderer.off("resize", callback);
  });
};
var useTerminalDimensions = () => {
  const renderer = useRenderer();
  const [terminalDimensions, setTerminalDimensions] = createSignal({ width: renderer.width, height: renderer.height });
  const callback = (width, height) => {
    setTerminalDimensions({ width, height });
  };
  onResize(callback);
  return terminalDimensions;
};
var useKeyboard = (callback, options) => {
  const renderer = useRenderer();
  const keyHandler = renderer.keyInput;
  onMount(() => {
    keyHandler.on("keypress", callback);
    if (options?.release) {
      keyHandler.on("keyrelease", callback);
    }
  });
  onCleanup(() => {
    keyHandler.off("keypress", callback);
    if (options?.release) {
      keyHandler.off("keyrelease", callback);
    }
  });
};
var memo = (fn) => createMemo(() => fn());
function createRenderer({
  createElement,
  createTextNode,
  createSlotNode,
  isTextNode,
  replaceText,
  insertNode,
  removeNode,
  setProperty,
  getParentNode,
  getFirstChild,
  getNextSibling
}) {
  function insert(parent, accessor, marker, initial) {
    if (marker !== undefined && !initial)
      initial = [];
    if (typeof accessor !== "function")
      return insertExpression(parent, accessor, initial, marker);
    createRenderEffect((current) => insertExpression(parent, accessor(), current, marker), initial);
  }
  function insertExpression(parent, value, current, marker, unwrapArray) {
    while (typeof current === "function")
      current = current();
    if (value === current)
      return current;
    const t = typeof value, multi = marker !== undefined;
    if (t === "string" || t === "number") {
      if (t === "number")
        value = value.toString();
      if (multi) {
        let node = current[0];
        if (node && isTextNode(node)) {
          replaceText(node, value);
        } else
          node = createTextNode(value);
        current = cleanChildren(parent, current, marker, node);
      } else {
        if (current !== "" && typeof current === "string") {
          replaceText(getFirstChild(parent), current = value);
        } else {
          cleanChildren(parent, current, marker, createTextNode(value));
          current = value;
        }
      }
    } else if (value == null || t === "boolean") {
      current = cleanChildren(parent, current, marker);
    } else if (t === "function") {
      createRenderEffect(() => {
        let v = value();
        while (typeof v === "function")
          v = v();
        current = insertExpression(parent, v, current, marker);
      });
      return () => current;
    } else if (Array.isArray(value)) {
      const array = [];
      if (normalizeIncomingArray(array, value, unwrapArray)) {
        createRenderEffect(() => current = insertExpression(parent, array, current, marker, true));
        return () => current;
      }
      if (array.length === 0) {
        const replacement = cleanChildren(parent, current, marker);
        if (multi)
          return current = replacement;
      } else {
        if (Array.isArray(current)) {
          if (current.length === 0) {
            appendNodes(parent, array, marker);
          } else
            reconcileArrays(parent, current, array);
        } else if (current == null || current === "") {
          appendNodes(parent, array);
        } else {
          reconcileArrays(parent, multi && current || [getFirstChild(parent)], array);
        }
      }
      current = array;
    } else {
      if (Array.isArray(current)) {
        if (multi)
          return current = cleanChildren(parent, current, marker, value);
        cleanChildren(parent, current, null, value);
      } else if (current == null || current === "" || !getFirstChild(parent)) {
        insertNode(parent, value);
      } else
        replaceNode(parent, value, getFirstChild(parent));
      current = value;
    }
    return current;
  }
  function normalizeIncomingArray(normalized, array, unwrap) {
    let dynamic = false;
    for (let i = 0, len = array.length;i < len; i++) {
      let item = array[i], t;
      if (item == null || item === true || item === false)
        ;
      else if (Array.isArray(item)) {
        dynamic = normalizeIncomingArray(normalized, item) || dynamic;
      } else if ((t = typeof item) === "string" || t === "number") {
        normalized.push(createTextNode(item));
      } else if (t === "function") {
        if (unwrap) {
          while (typeof item === "function")
            item = item();
          dynamic = normalizeIncomingArray(normalized, Array.isArray(item) ? item : [item]) || dynamic;
        } else {
          normalized.push(item);
          dynamic = true;
        }
      } else
        normalized.push(item);
    }
    return dynamic;
  }
  function reconcileArrays(parentNode, a, b) {
    let bLength = b.length, aEnd = a.length, bEnd = bLength, aStart = 0, bStart = 0, after = getNextSibling(a[aEnd - 1]), map = null;
    while (aStart < aEnd || bStart < bEnd) {
      if (a[aStart] === b[bStart]) {
        aStart++;
        bStart++;
        continue;
      }
      while (a[aEnd - 1] === b[bEnd - 1]) {
        aEnd--;
        bEnd--;
      }
      if (aEnd === aStart) {
        const node = bEnd < bLength ? bStart ? getNextSibling(b[bStart - 1]) : b[bEnd - bStart] : after;
        while (bStart < bEnd)
          insertNode(parentNode, b[bStart++], node);
      } else if (bEnd === bStart) {
        while (aStart < aEnd) {
          if (!map || !map.has(a[aStart]))
            removeNode(parentNode, a[aStart]);
          aStart++;
        }
      } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
        const node = getNextSibling(a[--aEnd]);
        insertNode(parentNode, b[bStart++], getNextSibling(a[aStart++]));
        insertNode(parentNode, b[--bEnd], node);
        a[aEnd] = b[bEnd];
      } else {
        if (!map) {
          map = new Map;
          let i = bStart;
          while (i < bEnd)
            map.set(b[i], i++);
        }
        const index = map.get(a[aStart]);
        if (index != null) {
          if (bStart < index && index < bEnd) {
            let i = aStart, sequence = 1, t;
            while (++i < aEnd && i < bEnd) {
              if ((t = map.get(a[i])) == null || t !== index + sequence)
                break;
              sequence++;
            }
            if (sequence > index - bStart) {
              const node = a[aStart];
              while (bStart < index)
                insertNode(parentNode, b[bStart++], node);
            } else
              replaceNode(parentNode, b[bStart++], a[aStart++]);
          } else
            aStart++;
        } else
          removeNode(parentNode, a[aStart++]);
      }
    }
  }
  function cleanChildren(parent, current, marker, replacement) {
    if (marker === undefined) {
      let removed;
      while (removed = getFirstChild(parent))
        removeNode(parent, removed);
      replacement && insertNode(parent, replacement);
      return replacement ?? "";
    }
    const node = replacement || createSlotNode();
    if (current.length) {
      let inserted = false;
      for (let i = current.length - 1;i >= 0; i--) {
        const el = current[i];
        if (node !== el) {
          const isParent = getParentNode(el) === parent;
          if (!inserted && !i)
            isParent ? replaceNode(parent, node, el) : insertNode(parent, node, marker);
          else
            isParent && removeNode(parent, el);
        } else
          inserted = true;
      }
    } else
      insertNode(parent, node, marker);
    return [node];
  }
  function appendNodes(parent, array, marker) {
    for (let i = 0, len = array.length;i < len; i++)
      insertNode(parent, array[i], marker);
  }
  function replaceNode(parent, newNode, oldNode) {
    insertNode(parent, newNode, oldNode);
    removeNode(parent, oldNode);
  }
  function spreadExpression(node, props, prevProps = {}, skipChildren) {
    props || (props = {});
    if (!skipChildren) {
      createRenderEffect(() => prevProps.children = insertExpression(node, props.children, prevProps.children));
    }
    createRenderEffect(() => props.ref && props.ref(node));
    createRenderEffect(() => {
      for (const prop in props) {
        if (prop === "children" || prop === "ref")
          continue;
        const value = props[prop];
        if (value === prevProps[prop])
          continue;
        setProperty(node, prop, value, prevProps[prop]);
        prevProps[prop] = value;
      }
    });
    return prevProps;
  }
  return {
    render(code, element) {
      let disposer;
      createRoot((dispose) => {
        disposer = dispose;
        insert(element, code());
      });
      return disposer;
    },
    insert,
    spread(node, accessor, skipChildren) {
      if (typeof accessor === "function") {
        createRenderEffect((current) => spreadExpression(node, accessor(), current, skipChildren));
      } else
        spreadExpression(node, accessor, undefined, skipChildren);
    },
    createElement,
    createTextNode,
    insertNode,
    setProp(node, name, value, prev) {
      setProperty(node, name, value, prev);
      return value;
    },
    mergeProps,
    effect: createRenderEffect,
    memo,
    createComponent,
    use(fn, element, arg) {
      return untrack(() => fn(element, arg));
    }
  };
}
function createRenderer2(options) {
  const renderer = createRenderer(options);
  renderer.mergeProps = mergeProps;
  return renderer;
}
var idCounter = new Map;
function getNextId(elementType) {
  if (!idCounter.has(elementType)) {
    idCounter.set(elementType, 0);
  }
  const value = idCounter.get(elementType) + 1;
  idCounter.set(elementType, value);
  return `${elementType}-${value}`;
}
var log = (...args) => {
  if (process.env.DEBUG) {
    console.log("[Reconciler]", ...args);
  }
};

class TextNode extends TextNodeRenderable {
  static fromString(text, options = {}) {
    const node = new TextNode(options);
    node.add(text);
    return node;
  }
}
var logId = (node) => {
  if (!node)
    return;
  return node.id;
};
var getNodeChildren = (node) => {
  let children2;
  if (node instanceof TextRenderable) {
    children2 = node.getTextChildren();
  } else {
    children2 = node.getChildren();
  }
  return children2;
};
function _insertNode(parent, node, anchor) {
  log("Inserting node:", logId(node), "into parent:", logId(parent), "with anchor:", logId(anchor), node instanceof TextNode);
  if (node instanceof SlotRenderable) {
    node.parent = parent;
    node = node.getSlotChild(parent);
  }
  if (anchor && anchor instanceof SlotRenderable) {
    anchor = anchor.getSlotChild(parent);
  }
  if (isTextNodeRenderable(node)) {
    if (!(parent instanceof TextRenderable) && !isTextNodeRenderable(parent)) {
      throw new Error(`Orphan text error: "${node.toChunks().map((c) => c.text).join("")}" must have a <text> as a parent: ${parent.id} above ${node.id}`);
    }
  }
  if (!(parent instanceof BaseRenderable)) {
    console.error("[INSERT]", "Tried to mount a non base renderable");
    throw new Error("Tried to mount a non base renderable");
  }
  if (!anchor) {
    parent.add(node);
    return;
  }
  const children2 = getNodeChildren(parent);
  const anchorIndex = children2.findIndex((el) => el.id === anchor.id);
  if (anchorIndex === -1) {
    log("[INSERT]", "Could not find anchor", logId(parent), logId(anchor), "[children]", ...children2.map((c) => c.id));
  }
  parent.add(node, anchorIndex);
}
function _removeNode(parent, node) {
  log("Removing node:", logId(node), "from parent:", logId(parent));
  if (node instanceof SlotRenderable) {
    node.parent = null;
    node = node.getSlotChild(parent);
  }
  parent.remove(node.id);
  process.nextTick(() => {
    if (node instanceof BaseRenderable && !node.parent) {
      node.destroyRecursively();
      return;
    }
  });
}
function _createTextNode(value) {
  log("Creating text node:", value);
  const id = getNextId("text-node");
  if (typeof value === "number") {
    value = value.toString();
  }
  return TextNode.fromString(value, { id });
}
function createSlotNode() {
  const id = getNextId("slot-node");
  log("Creating slot node", id);
  return new SlotRenderable(id);
}
function _getParentNode(childNode) {
  log("Getting parent of node:", logId(childNode));
  let parent = childNode.parent ?? undefined;
  if (parent instanceof RootTextNodeRenderable) {
    parent = parent.textParent ?? undefined;
  }
  const scrollBoxCandidate = parent?.parent?.parent?.parent;
  if (scrollBoxCandidate instanceof ScrollBoxRenderable && scrollBoxCandidate.content === parent) {
    parent = scrollBoxCandidate;
  }
  return parent;
}
var {
  render: _render,
  effect,
  memo: memo2,
  createComponent: createComponent2,
  createElement,
  createTextNode,
  insertNode,
  insert,
  spread,
  setProp,
  mergeProps: mergeProps3,
  use
} = createRenderer2({
  createElement(tagName) {
    log("Creating element:", tagName);
    const id = getNextId(tagName);
    const solidRenderer = useContext(RendererContext);
    if (!solidRenderer) {
      throw new Error("No renderer found");
    }
    const elements = getComponentCatalogue();
    if (!elements[tagName]) {
      throw new Error(`[Reconciler] Unknown component type: ${tagName}`);
    }
    const element = new elements[tagName](solidRenderer, { id });
    log("Element created with id:", id);
    return element;
  },
  createTextNode: _createTextNode,
  createSlotNode,
  replaceText(textNode, value) {
    log("Replacing text:", value, "in node:", logId(textNode));
    if (!(textNode instanceof TextNode))
      return;
    textNode.replace(value, 0);
  },
  setProperty(node, name, value, prev) {
    if (name.startsWith("on:")) {
      const eventName = name.slice(3);
      if (value) {
        node.on(eventName, value);
      }
      if (prev) {
        node.off(eventName, prev);
      }
      return;
    }
    if (isTextNodeRenderable(node)) {
      if (name === "href") {
        node.link = { url: value };
        return;
      }
      if (name === "style") {
        node.attributes |= createTextAttributes(value);
        node.fg = value.fg ? parseColor(value.fg) : node.fg;
        node.bg = value.bg ? parseColor(value.bg) : node.bg;
        return;
      }
      return;
    }
    switch (name) {
      case "id":
        log("Id mapped", node.id, "=", value);
        node[name] = value;
        break;
      case "focused":
        if (!(node instanceof Renderable))
          return;
        if (value) {
          node.focus();
        } else {
          node.blur();
        }
        break;
      case "onChange":
        let event = undefined;
        if (node instanceof SelectRenderable) {
          event = SelectRenderableEvents.SELECTION_CHANGED;
        } else if (node instanceof TabSelectRenderable) {
          event = TabSelectRenderableEvents.SELECTION_CHANGED;
        } else if (node instanceof InputRenderable) {
          event = InputRenderableEvents.CHANGE;
        }
        if (!event)
          break;
        if (value) {
          node.on(event, value);
        }
        if (prev) {
          node.off(event, prev);
        }
        break;
      case "onInput":
        if (node instanceof InputRenderable) {
          if (value) {
            node.on(InputRenderableEvents.INPUT, value);
          }
          if (prev) {
            node.off(InputRenderableEvents.INPUT, prev);
          }
        }
        break;
      case "onSubmit":
        if (node instanceof InputRenderable) {
          if (value) {
            node.on(InputRenderableEvents.ENTER, value);
          }
          if (prev) {
            node.off(InputRenderableEvents.ENTER, prev);
          }
        } else {
          node[name] = value;
        }
        break;
      case "onSelect":
        if (node instanceof SelectRenderable) {
          if (value) {
            node.on(SelectRenderableEvents.ITEM_SELECTED, value);
          }
          if (prev) {
            node.off(SelectRenderableEvents.ITEM_SELECTED, prev);
          }
        } else if (node instanceof TabSelectRenderable) {
          if (value) {
            node.on(TabSelectRenderableEvents.ITEM_SELECTED, value);
          }
          if (prev) {
            node.off(TabSelectRenderableEvents.ITEM_SELECTED, prev);
          }
        }
        break;
      case "style":
        for (const prop in value) {
          const propVal = value[prop];
          if (prev !== undefined && propVal === prev[prop])
            continue;
          node[prop] = propVal;
        }
        break;
      case "text":
      case "content":
        node[name] = typeof value === "string" ? value : Array.isArray(value) ? value.join("") : `${value}`;
        break;
      default:
        node[name] = value;
    }
  },
  isTextNode(node) {
    return node instanceof TextNode;
  },
  insertNode: _insertNode,
  removeNode: _removeNode,
  getParentNode: _getParentNode,
  getFirstChild(node) {
    log("Getting first child of node:", logId(node));
    const firstChild = getNodeChildren(node)[0];
    if (!firstChild) {
      log("No first child found for node:", logId(node));
      return;
    }
    log("First child found:", logId(firstChild), "for node:", logId(node));
    return firstChild;
  },
  getNextSibling(node) {
    log("Getting next sibling of node:", logId(node));
    const parent = _getParentNode(node);
    if (!parent) {
      log("No parent found for node:", logId(node));
      return;
    }
    const siblings = getNodeChildren(parent);
    const index = siblings.indexOf(node);
    if (index === -1 || index === siblings.length - 1) {
      log("No next sibling found for node:", logId(node));
      return;
    }
    const nextSibling = siblings[index + 1];
    if (!nextSibling) {
      log("Next sibling is null for node:", logId(node));
      return;
    }
    log("Next sibling found:", logId(nextSibling), "for node:", logId(node));
    return nextSibling;
  }
});
class SlotBaseRenderable extends BaseRenderable2 {
  constructor(id) {
    super({
      id
    });
  }
  add(obj, index) {
    throw new Error("Can't add children on an Slot renderable");
  }
  getChildren() {
    return [];
  }
  remove(id) {}
  insertBefore(obj, anchor) {
    throw new Error("Can't add children on an Slot renderable");
  }
  getRenderable(id) {
    return;
  }
  getChildrenCount() {
    return 0;
  }
  requestRender() {}
  findDescendantById(id) {
    return;
  }
}

class TextSlotRenderable extends TextNodeRenderable2 {
  slotParent;
  destroyed = false;
  constructor(id, parent) {
    super({ id });
    this._visible = false;
    this.slotParent = parent;
  }
  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.slotParent?.destroy();
    super.destroy();
  }
}

class LayoutSlotRenderable extends SlotBaseRenderable {
  yogaNode;
  slotParent;
  destroyed = false;
  constructor(id, parent) {
    super(id);
    this._visible = false;
    this.slotParent = parent;
    this.yogaNode = Yoga.default.Node.create();
    this.yogaNode.setDisplay(Yoga.Display.None);
  }
  getLayoutNode() {
    return this.yogaNode;
  }
  updateFromLayout() {}
  updateLayout() {}
  onRemove() {}
  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    super.destroy();
    this.slotParent?.destroy();
  }
}

class SlotRenderable extends SlotBaseRenderable {
  layoutNode;
  textNode;
  destroyed = false;
  constructor(id) {
    super(id);
    this._visible = false;
  }
  getSlotChild(parent) {
    if (isTextNodeRenderable2(parent) || parent instanceof TextRenderable2) {
      if (!this.textNode) {
        this.textNode = new TextSlotRenderable(`slot-text-${this.id}`, this);
      }
      return this.textNode;
    }
    if (!this.layoutNode) {
      this.layoutNode = new LayoutSlotRenderable(`slot-layout-${this.id}`, this);
    }
    return this.layoutNode;
  }
  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    if (this.layoutNode) {
      this.layoutNode.destroy();
    }
    if (this.textNode) {
      this.textNode.destroy();
    }
  }
}

class SpanRenderable extends TextNodeRenderable3 {
  _ctx;
  constructor(_ctx, options) {
    super(options);
    this._ctx = _ctx;
  }
}
class TextModifierRenderable extends SpanRenderable {
  constructor(options, modifier) {
    super(null, options);
    if (modifier === "b" || modifier === "strong") {
      this.attributes = (this.attributes || 0) | TextAttributes.BOLD;
    } else if (modifier === "i" || modifier === "em") {
      this.attributes = (this.attributes || 0) | TextAttributes.ITALIC;
    } else if (modifier === "u") {
      this.attributes = (this.attributes || 0) | TextAttributes.UNDERLINE;
    }
  }
}

class BoldSpanRenderable extends TextModifierRenderable {
  constructor(options) {
    super(options, "b");
  }
}

class ItalicSpanRenderable extends TextModifierRenderable {
  constructor(options) {
    super(options, "i");
  }
}

class UnderlineSpanRenderable extends TextModifierRenderable {
  constructor(options) {
    super(options, "u");
  }
}

class LineBreakRenderable extends SpanRenderable {
  constructor(_ctx, options) {
    super(null, options);
    this.add();
  }
  add() {
    return super.add(`
`);
  }
}

class LinkRenderable extends SpanRenderable {
  constructor(_ctx, options) {
    const linkOptions = {
      ...options,
      link: { url: options.href }
    };
    super(null, linkOptions);
  }
}
var baseComponents = {
  box: BoxRenderable,
  text: TextRenderable3,
  input: InputRenderable2,
  select: SelectRenderable2,
  textarea: TextareaRenderable,
  ascii_font: ASCIIFontRenderable,
  tab_select: TabSelectRenderable2,
  scrollbox: ScrollBoxRenderable2,
  code: CodeRenderable,
  diff: DiffRenderable,
  line_number: LineNumberRenderable,
  markdown: MarkdownRenderable,
  span: SpanRenderable,
  strong: BoldSpanRenderable,
  b: BoldSpanRenderable,
  em: ItalicSpanRenderable,
  i: ItalicSpanRenderable,
  u: UnderlineSpanRenderable,
  br: LineBreakRenderable,
  a: LinkRenderable
};
var componentCatalogue = { ...baseComponents };
function getComponentCatalogue() {
  return componentCatalogue;
}
var render = async (node, rendererOrConfig = {}) => {
  let isDisposed = false;
  let dispose;
  const renderer = rendererOrConfig instanceof CliRenderer ? rendererOrConfig : await createCliRenderer({
    ...rendererOrConfig,
    onDestroy: () => {
      if (!isDisposed) {
        isDisposed = true;
        dispose();
      }
      rendererOrConfig.onDestroy?.();
    }
  });
  if (rendererOrConfig instanceof CliRenderer) {
    renderer.on("destroy", () => {
      if (!isDisposed) {
        isDisposed = true;
        dispose();
      }
    });
  }
  engine2.attach(renderer);
  dispose = _render(() => createComponent2(RendererContext.Provider, {
    get value() {
      return renderer;
    },
    get children() {
      return createComponent2(node, {});
    }
  }), renderer.root);
};

// index.tsx
import { resolve as resolve2 } from "path";

// src/theme.ts
var colors = {
  bg: "#1a1b26",
  bgDark: "#16161e",
  bgHighlight: "#292e42",
  fg: "#c0caf5",
  fgDark: "#565f89",
  fgMuted: "#545c7e",
  blue: "#7aa2f7",
  cyan: "#7dcfff",
  green: "#9ece6a",
  yellow: "#e0af68",
  orange: "#ff9e64",
  purple: "#bb9af7",
  red: "#f7768e",
  magenta: "#ff007c",
  white: "#c0caf5",
  border: "#3b4261",
  selection: "#283457"
};
var teamTypeColors = {
  review: colors.blue,
  feature: colors.green,
  planning: colors.yellow,
  research: colors.purple,
  brainstorm: colors.orange,
  unknown: colors.fgDark
};
function teamTypeLabel(type) {
  return type.toUpperCase();
}

// src/components/Header.tsx
function Header() {
  return (() => {
    var _el$ = createElement("box"), _el$2 = createElement("text");
    insertNode(_el$, _el$2);
    setProp(_el$, "width", "100%");
    setProp(_el$, "height", 3);
    setProp(_el$, "borderStyle", "single");
    setProp(_el$, "justifyContent", "center");
    setProp(_el$, "alignItems", "center");
    insertNode(_el$2, createTextNode(`TEAM TASKS TUI`));
    setProp(_el$2, "bold", true);
    effect((_p$) => {
      var _v$ = colors.border, _v$2 = colors.bgDark, _v$3 = colors.blue;
      _v$ !== _p$.e && (_p$.e = setProp(_el$, "borderColor", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = setProp(_el$, "backgroundColor", _v$2, _p$.t));
      _v$3 !== _p$.a && (_p$.a = setProp(_el$2, "fg", _v$3, _p$.a));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined
    });
    return _el$;
  })();
}

// node_modules/solid-js/store/dist/server.js
var $RAW = Symbol("store-raw");
var $NODE = Symbol("store-node");
var $HAS = Symbol("store-has");
var $SELF = Symbol("store-self");
function wrap$1(value) {
  let p = value[$PROXY];
  if (!p) {
    Object.defineProperty(value, $PROXY, {
      value: p = new Proxy(value, proxyTraps$1)
    });
    if (!Array.isArray(value)) {
      const keys = Object.keys(value), desc = Object.getOwnPropertyDescriptors(value);
      for (let i = 0, l = keys.length;i < l; i++) {
        const prop = keys[i];
        if (desc[prop].get) {
          Object.defineProperty(value, prop, {
            enumerable: desc[prop].enumerable,
            get: desc[prop].get.bind(p)
          });
        }
      }
    }
  }
  return p;
}
function isWrappable(obj) {
  let proto;
  return obj != null && typeof obj === "object" && (obj[$PROXY] || !(proto = Object.getPrototypeOf(obj)) || proto === Object.prototype || Array.isArray(obj));
}
function unwrap(item, set = new Set) {
  let result, unwrapped, v, prop;
  if (result = item != null && item[$RAW])
    return result;
  if (!isWrappable(item) || set.has(item))
    return item;
  if (Array.isArray(item)) {
    if (Object.isFrozen(item))
      item = item.slice(0);
    else
      set.add(item);
    for (let i = 0, l = item.length;i < l; i++) {
      v = item[i];
      if ((unwrapped = unwrap(v, set)) !== v)
        item[i] = unwrapped;
    }
  } else {
    if (Object.isFrozen(item))
      item = Object.assign({}, item);
    else
      set.add(item);
    const keys = Object.keys(item), desc = Object.getOwnPropertyDescriptors(item);
    for (let i = 0, l = keys.length;i < l; i++) {
      prop = keys[i];
      if (desc[prop].get)
        continue;
      v = item[prop];
      if ((unwrapped = unwrap(v, set)) !== v)
        item[prop] = unwrapped;
    }
  }
  return item;
}
function getNodes(target, symbol) {
  let nodes = target[symbol];
  if (!nodes)
    Object.defineProperty(target, symbol, {
      value: nodes = Object.create(null)
    });
  return nodes;
}
function getNode(nodes, property, value) {
  if (nodes[property])
    return nodes[property];
  const [s, set] = createSignal(value, {
    equals: false,
    internal: true
  });
  s.$ = set;
  return nodes[property] = s;
}
function proxyDescriptor$1(target, property) {
  const desc = Reflect.getOwnPropertyDescriptor(target, property);
  if (!desc || desc.get || !desc.configurable || property === $PROXY || property === $NODE)
    return desc;
  delete desc.value;
  delete desc.writable;
  desc.get = () => target[$PROXY][property];
  return desc;
}
function trackSelf(target) {
  getListener() && getNode(getNodes(target, $NODE), $SELF)();
}
function ownKeys(target) {
  trackSelf(target);
  return Reflect.ownKeys(target);
}
var proxyTraps$1 = {
  get(target, property, receiver) {
    if (property === $RAW)
      return target;
    if (property === $PROXY)
      return receiver;
    if (property === $TRACK) {
      trackSelf(target);
      return receiver;
    }
    const nodes = getNodes(target, $NODE);
    const tracked = nodes[property];
    let value = tracked ? tracked() : target[property];
    if (property === $NODE || property === $HAS || property === "__proto__")
      return value;
    if (!tracked) {
      const desc = Object.getOwnPropertyDescriptor(target, property);
      if (getListener() && (typeof value !== "function" || target.hasOwnProperty(property)) && !(desc && desc.get))
        value = getNode(nodes, property, value)();
    }
    return isWrappable(value) ? wrap$1(value) : value;
  },
  has(target, property) {
    if (property === $RAW || property === $PROXY || property === $TRACK || property === $NODE || property === $HAS || property === "__proto__")
      return true;
    getListener() && getNode(getNodes(target, $HAS), property)();
    return property in target;
  },
  set() {
    return true;
  },
  deleteProperty() {
    return true;
  },
  ownKeys,
  getOwnPropertyDescriptor: proxyDescriptor$1
};
function setProperty(state, property, value, deleting = false) {
  if (!deleting && state[property] === value)
    return;
  const prev = state[property], len = state.length;
  if (value === undefined) {
    delete state[property];
    if (state[$HAS] && state[$HAS][property] && prev !== undefined)
      state[$HAS][property].$();
  } else {
    state[property] = value;
    if (state[$HAS] && state[$HAS][property] && prev === undefined)
      state[$HAS][property].$();
  }
  let nodes = getNodes(state, $NODE), node;
  if (node = getNode(nodes, property, prev))
    node.$(() => value);
  if (Array.isArray(state) && state.length !== len) {
    for (let i = state.length;i < len; i++)
      (node = nodes[i]) && node.$();
    (node = getNode(nodes, "length", len)) && node.$(state.length);
  }
  (node = nodes[$SELF]) && node.$();
}
function mergeStoreNode(state, value) {
  const keys = Object.keys(value);
  for (let i = 0;i < keys.length; i += 1) {
    const key = keys[i];
    setProperty(state, key, value[key]);
  }
}
function updateArray(current, next) {
  if (typeof next === "function")
    next = next(current);
  next = unwrap(next);
  if (Array.isArray(next)) {
    if (current === next)
      return;
    let i = 0, len = next.length;
    for (;i < len; i++) {
      const value = next[i];
      if (current[i] !== value)
        setProperty(current, i, value);
    }
    setProperty(current, "length", len);
  } else
    mergeStoreNode(current, next);
}
function updatePath(current, path, traversed = []) {
  let part, prev = current;
  if (path.length > 1) {
    part = path.shift();
    const partType = typeof part, isArray = Array.isArray(current);
    if (Array.isArray(part)) {
      for (let i = 0;i < part.length; i++) {
        updatePath(current, [part[i]].concat(path), traversed);
      }
      return;
    } else if (isArray && partType === "function") {
      for (let i = 0;i < current.length; i++) {
        if (part(current[i], i))
          updatePath(current, [i].concat(path), traversed);
      }
      return;
    } else if (isArray && partType === "object") {
      const {
        from = 0,
        to = current.length - 1,
        by = 1
      } = part;
      for (let i = from;i <= to; i += by) {
        updatePath(current, [i].concat(path), traversed);
      }
      return;
    } else if (path.length > 1) {
      updatePath(current[part], path, [part].concat(traversed));
      return;
    }
    prev = current[part];
    traversed = [part].concat(traversed);
  }
  let value = path[0];
  if (typeof value === "function") {
    value = value(prev, traversed);
    if (value === prev)
      return;
  }
  if (part === undefined && value == undefined)
    return;
  value = unwrap(value);
  if (part === undefined || isWrappable(prev) && isWrappable(value) && !Array.isArray(value)) {
    mergeStoreNode(prev, value);
  } else
    setProperty(current, part, value);
}
function createStore(...[store, options]) {
  const unwrappedStore = unwrap(store || {});
  const isArray = Array.isArray(unwrappedStore);
  const wrappedStore = wrap$1(unwrappedStore);
  function setStore(...args) {
    batch(() => {
      isArray && args.length === 1 ? updateArray(unwrappedStore, args[0]) : updatePath(unwrappedStore, args);
    });
  }
  return [wrappedStore, setStore];
}
var $ROOT = Symbol("store-root");
var producers = new WeakMap;
var setterTraps = {
  get(target, property) {
    if (property === $RAW)
      return target;
    const value = target[property];
    let proxy;
    return isWrappable(value) ? producers.get(value) || (producers.set(value, proxy = new Proxy(value, setterTraps)), proxy) : value;
  },
  set(target, property, value) {
    setProperty(target, property, unwrap(value));
    return true;
  },
  deleteProperty(target, property) {
    setProperty(target, property, undefined, true);
    return true;
  }
};
function produce(fn) {
  return (state) => {
    if (isWrappable(state)) {
      let proxy;
      if (!(proxy = producers.get(state))) {
        producers.set(state, proxy = new Proxy(state, setterTraps));
      }
      fn(proxy);
    }
    return state;
  };
}

// src/data/store.ts
var [state, setState] = createStore({
  teams: [],
  liveTeams: [],
  selectedTeamIndex: 0,
  selectedTaskIndex: 0,
  viewMode: "teams",
  watchPath: "./docs/teams",
  lastUpdate: null
});
function setTeams(teams) {
  setState("teams", teams);
  setState("lastUpdate", new Date);
  if (state.selectedTeamIndex >= teams.length) {
    setState("selectedTeamIndex", Math.max(0, teams.length - 1));
  }
  const team = teams[state.selectedTeamIndex];
  if (team && state.selectedTaskIndex >= team.tasks.length) {
    setState("selectedTaskIndex", Math.max(0, team.tasks.length - 1));
  }
}
function updateTeam(dirName, team) {
  setState(produce((s) => {
    const idx = s.teams.findIndex((t) => t.dir === dirName);
    team.lastModified = Date.now();
    if (idx >= 0) {
      s.teams[idx] = team;
    } else {
      s.teams.push(team);
    }
    s.lastUpdate = new Date;
  }));
}
function setWatchPath(path) {
  setState("watchPath", path);
}
function getUnifiedTeams() {
  const entries = [];
  for (const lt of state.liveTeams) {
    entries.push({ kind: "live", team: lt });
  }
  for (const dt of state.teams) {
    entries.push({ kind: "docs", team: dt });
  }
  entries.sort((a, b) => {
    const aTime = a.kind === "live" ? a.team.lastModified : a.team.lastModified;
    const bTime = b.kind === "live" ? b.team.lastModified : b.team.lastModified;
    return bTime - aTime;
  });
  return entries;
}
function selectTeam(index) {
  const totalTeams = state.liveTeams.length + state.teams.length;
  setState(produce((s) => {
    s.selectedTeamIndex = Math.max(0, Math.min(index, totalTeams - 1));
    s.selectedTaskIndex = 0;
  }));
}
function selectTask(index) {
  const unified = getUnifiedTeams();
  const entry = unified[state.selectedTeamIndex];
  if (!entry)
    return;
  const taskCount = entry.kind === "live" ? entry.team.tasks.length : entry.team.tasks.length;
  setState("selectedTaskIndex", Math.max(0, Math.min(index, taskCount - 1)));
}
function setViewMode(mode) {
  setState("viewMode", mode);
}
function setLiveTeams(liveTeams) {
  setState("liveTeams", liveTeams);
  setState("lastUpdate", new Date);
}
function updateLiveTeam(dirName, tasks, displayName, config) {
  setState(produce((s) => {
    const idx = s.liveTeams.findIndex((t) => t.dirName === dirName);
    const team = { dirName, displayName, tasks, config, lastModified: Date.now() };
    if (idx >= 0) {
      s.liveTeams[idx] = team;
    } else {
      s.liveTeams.push(team);
    }
    s.lastUpdate = new Date;
  }));
}
function removeTeam(dirName) {
  setState(produce((s) => {
    const idx = s.teams.findIndex((t) => t.dir === dirName);
    if (idx >= 0) {
      s.teams.splice(idx, 1);
      s.lastUpdate = new Date;
      const total = s.teams.length + s.liveTeams.length;
      if (s.selectedTeamIndex >= total) {
        s.selectedTeamIndex = Math.max(0, total - 1);
      }
    }
  }));
}

// src/components/TeamList.tsx
function teamOptionName(entry) {
  if (entry.kind === "live") {
    const t2 = entry.team;
    const inProgress = t2.tasks.filter((tk) => tk.status === "in_progress").length;
    const completed = t2.tasks.filter((tk) => tk.status === "completed").length;
    const total = t2.tasks.length;
    const prefix = inProgress > 0 ? "\uEB99" : completed === total && total > 0 ? "\uF058" : "\uF0E7";
    return `${prefix} ${t2.displayName}`;
  }
  const t = entry.team;
  const icon = t.meta.status === "completed" ? "\uF058" : "\uF114";
  return `${icon} ${t.dir}`;
}
function teamOptionDesc(entry) {
  if (entry.kind === "live") {
    const t2 = entry.team;
    const inProgress = t2.tasks.filter((tk) => tk.status === "in_progress").length;
    const completed = t2.tasks.filter((tk) => tk.status === "completed").length;
    return `\uF0E7 ${t2.tasks.length} tasks | ${inProgress} active | ${completed} done`;
  }
  const t = entry.team;
  return `${teamTypeLabel(t.meta.type)} | ${t.tasks.length} tasks`;
}
function TeamList(props) {
  const unified = createMemo(() => getUnifiedTeams());
  const options = createMemo(() => unified().map((entry) => ({
    name: teamOptionName(entry),
    description: teamOptionDesc(entry)
  })));
  const hasLive = createMemo(() => state.liveTeams.length > 0);
  return (() => {
    var _el$ = createElement("box"), _el$2 = createElement("box"), _el$3 = createElement("text"), _el$4 = createElement("select");
    insertNode(_el$, _el$2);
    insertNode(_el$, _el$4);
    setProp(_el$, "flexDirection", "column");
    setProp(_el$, "borderStyle", "single");
    setProp(_el$, "flexGrow", 1);
    setProp(_el$, "height", "100%");
    insertNode(_el$2, _el$3);
    setProp(_el$2, "height", 1);
    setProp(_el$2, "padding", {
      left: 1
    });
    setProp(_el$3, "bold", true);
    insert(_el$3, () => hasLive() ? "\uF0E7 Teams" : "Teams");
    setProp(_el$4, "width", "100%");
    setProp(_el$4, "flexGrow", 1);
    setProp(_el$4, "onSelect", (index) => props.onSelect(index));
    setProp(_el$4, "onChange", (index) => props.onChange?.(index));
    effect((_p$) => {
      var _v$ = props.focused ? colors.blue : colors.border, _v$2 = colors.bgDark, _v$3 = colors.cyan, _v$4 = options(), _v$5 = props.focused, _v$6 = colors.bg, _v$7 = colors.selection, _v$8 = colors.fg, _v$9 = colors.fgDark, _v$0 = colors.fgMuted;
      _v$ !== _p$.e && (_p$.e = setProp(_el$, "borderColor", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = setProp(_el$2, "backgroundColor", _v$2, _p$.t));
      _v$3 !== _p$.a && (_p$.a = setProp(_el$3, "fg", _v$3, _p$.a));
      _v$4 !== _p$.o && (_p$.o = setProp(_el$4, "options", _v$4, _p$.o));
      _v$5 !== _p$.i && (_p$.i = setProp(_el$4, "focused", _v$5, _p$.i));
      _v$6 !== _p$.n && (_p$.n = setProp(_el$4, "backgroundColor", _v$6, _p$.n));
      _v$7 !== _p$.s && (_p$.s = setProp(_el$4, "selectedBackgroundColor", _v$7, _p$.s));
      _v$8 !== _p$.h && (_p$.h = setProp(_el$4, "selectedTextColor", _v$8, _p$.h));
      _v$9 !== _p$.r && (_p$.r = setProp(_el$4, "textColor", _v$9, _p$.r));
      _v$0 !== _p$.d && (_p$.d = setProp(_el$4, "descriptionColor", _v$0, _p$.d));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined,
      o: undefined,
      i: undefined,
      n: undefined,
      s: undefined,
      h: undefined,
      r: undefined,
      d: undefined
    });
    return _el$;
  })();
}

// src/components/TaskList.tsx
function modelShort(model) {
  if (model.startsWith("claude-opus"))
    return "opus";
  if (model.startsWith("claude-sonnet"))
    return "sonnet";
  if (model.startsWith("claude-haiku"))
    return "haiku";
  return model;
}
function resolveBlockedBy(task, allTasks) {
  if (task.blockedBy.length === 0)
    return "";
  const resolved = task.blockedBy.map((id) => {
    const dep = allTasks.find((t) => t.id === id);
    return dep ? `#${id}: ${dep.subject}` : `#${id}`;
  });
  return ` [BLOCKED by ${resolved.join(", ")}]`;
}
function statusBadge(status) {
  switch (status) {
    case "in_progress":
      return "\uEB99";
    case "completed":
      return "\uF058";
    case "pending":
    default:
      return "\uF252";
  }
}
function extractRolePrefix(subject) {
  const match = subject.match(/^\[([^\]]+)\]/);
  return match ? match[1] : undefined;
}
function resolveOwner(task) {
  return task.owner || extractRolePrefix(task.subject) || `#${task.id}`;
}
function liveTaskDesc(task, allTasks) {
  const owner = resolveOwner(task);
  const blockedTag = resolveBlockedBy(task, allTasks);
  if (task.status === "in_progress" && task.activeForm) {
    return `${task.activeForm} | ${owner}${blockedTag}`;
  }
  return `${owner}${blockedTag}`;
}
function liveTaskName(task) {
  const badge = statusBadge(task.status);
  const blocked = task.blockedBy.length > 0 && task.status === "pending" ? "\uF023 " : "";
  return `${badge} ${blocked}${task.subject}`;
}
var COLUMN_LABELS = ["PENDING", "ACTIVE", "DONE"];
var COLUMN_COLORS = [colors.fgMuted, colors.yellow, colors.green];
function TaskList(props) {
  const entry = createMemo(() => {
    const unified = getUnifiedTeams();
    return unified[state.selectedTeamIndex];
  });
  const isLive = createMemo(() => entry()?.kind === "live");
  const headerName = createMemo(() => {
    const e = entry();
    if (!e)
      return "\u2014";
    return e.kind === "live" ? e.team.displayName : e.team.dir;
  });
  const headerColor = createMemo(() => {
    const e = entry();
    if (!e)
      return colors.fgDark;
    if (e.kind === "live")
      return colors.green;
    return teamTypeColors[e.team.meta.type || "unknown"];
  });
  const headerText = createMemo(() => {
    const e = entry();
    if (!e)
      return "No team selected";
    if (e.kind === "live") {
      const t2 = e.team;
      const inProgress = t2.tasks.filter((tk) => tk.status === "in_progress").length;
      const completed = t2.tasks.filter((tk) => tk.status === "completed").length;
      return `\uF0E7 ${t2.tasks.length} tasks | ${inProgress} active | ${completed} done`;
    }
    const t = e.team;
    return `${teamTypeLabel(t.meta.type)} | ${t.meta.topic || t.dir} | ${t.tasks.length} tasks`;
  });
  const teamDescription = createMemo(() => {
    const e = entry();
    if (!e || e.kind !== "live" || !e.team.config)
      return "";
    return e.team.config.description || "";
  });
  const memberRoster = createMemo(() => {
    const e = entry();
    if (!e || e.kind !== "live" || !e.team.config)
      return "";
    return e.team.config.members.map((m) => `${m.name} (${modelShort(m.model)}/${m.agentType})`).join(" | ");
  });
  const groupedTasks = createMemo(() => {
    const e = entry();
    if (!e || e.kind !== "live")
      return [[], [], []];
    const pending = [];
    const active = [];
    const done = [];
    e.team.tasks.forEach((task, i) => {
      const gt = {
        task,
        flatIndex: i
      };
      switch (task.status) {
        case "pending":
          pending.push(gt);
          break;
        case "in_progress":
          active.push(gt);
          break;
        case "completed":
          done.push(gt);
          break;
      }
    });
    const unblocked = pending.filter((gt) => gt.task.blockedBy.length === 0);
    const blocked = pending.filter((gt) => gt.task.blockedBy.length > 0);
    return [[...unblocked, ...blocked], active, done];
  });
  const columnOptions = createMemo(() => {
    const e = entry();
    const allTasks = e?.kind === "live" ? e.team.tasks : [];
    const groups = groupedTasks();
    return groups.map((col) => col.map((gt) => ({
      name: liveTaskName(gt.task),
      description: liveTaskDesc(gt.task, allTasks)
    })));
  });
  const [kanbanCol, setKanbanCol] = createSignal(0);
  const [colRows, setColRows] = createSignal([0, 0, 0]);
  createEffect(() => {
    state.selectedTeamIndex;
    setKanbanCol(0);
    setColRows([0, 0, 0]);
  });
  createEffect(() => {
    const groups = groupedTasks();
    const rows = colRows();
    const col = kanbanCol();
    const clamped = rows.map((r, i) => {
      const len = groups[i].length;
      return len > 0 ? Math.min(r, len - 1) : 0;
    });
    if (groups[col].length === 0) {
      const nonEmpty = [0, 1, 2].filter((i) => groups[i].length > 0);
      if (nonEmpty.length > 0) {
        const closest = nonEmpty.reduce((a, b) => Math.abs(b - col) < Math.abs(a - col) ? b : a);
        setKanbanCol(closest);
      }
    }
    if (clamped.some((v, i) => v !== rows[i])) {
      setColRows(clamped);
    }
  });
  useKeyboard((key) => {
    if (!props.focused || !isLive())
      return;
    if (key.name === "left" || key.name === "right") {
      const groups = groupedTasks();
      const dir = key.name === "left" ? -1 : 1;
      const col = kanbanCol();
      let next = col + dir;
      while (next >= 0 && next <= 2) {
        if (groups[next].length > 0)
          break;
        next += dir;
      }
      if (next >= 0 && next <= 2 && groups[next].length > 0) {
        setKanbanCol(next);
        const row = colRows()[next];
        const flatIndex = groups[next][row]?.flatIndex;
        if (flatIndex !== undefined) {
          props.onChange?.(flatIndex);
        }
      }
    }
  });
  function handleColumnSelect(colIndex) {
    return (rowIndex) => {
      const gt = groupedTasks()[colIndex][rowIndex];
      if (gt) {
        setColRows((prev) => {
          const next = [...prev];
          next[colIndex] = rowIndex;
          return next;
        });
        props.onSelect(gt.flatIndex);
      }
    };
  }
  function handleColumnChange(colIndex) {
    return (rowIndex) => {
      const gt = groupedTasks()[colIndex][rowIndex];
      if (gt) {
        setColRows((prev) => {
          const next = [...prev];
          next[colIndex] = rowIndex;
          return next;
        });
        props.onChange?.(gt.flatIndex);
      }
    };
  }
  const docsOptions = createMemo(() => {
    const e = entry();
    if (!e || e.kind !== "docs")
      return [];
    return e.team.tasks.map((task) => ({
      name: task.title,
      description: task.owner || task.id
    }));
  });
  return (() => {
    var _el$ = createElement("box"), _el$2 = createElement("box"), _el$3 = createElement("text"), _el$4 = createElement("box"), _el$5 = createElement("text");
    insertNode(_el$, _el$2);
    insertNode(_el$, _el$4);
    setProp(_el$, "flexDirection", "column");
    setProp(_el$, "borderStyle", "single");
    setProp(_el$, "flexGrow", 2);
    setProp(_el$, "height", "100%");
    insertNode(_el$2, _el$3);
    setProp(_el$2, "height", 1);
    setProp(_el$2, "padding", {
      left: 1
    });
    setProp(_el$3, "bold", true);
    insert(_el$3, (() => {
      var _c$ = memo2(() => entry()?.kind === "live");
      return () => _c$() ? `\uF0E7 ${headerName()}` : headerName();
    })());
    insertNode(_el$4, _el$5);
    setProp(_el$4, "height", 1);
    setProp(_el$4, "padding", {
      left: 1
    });
    insert(_el$5, headerText);
    insert(_el$, createComponent2(Show, {
      get when() {
        return teamDescription();
      },
      get children() {
        var _el$6 = createElement("box"), _el$7 = createElement("text");
        insertNode(_el$6, _el$7);
        setProp(_el$6, "height", 1);
        setProp(_el$6, "padding", {
          left: 1
        });
        insert(_el$7, teamDescription);
        effect((_$p) => setProp(_el$7, "fg", colors.fg, _$p));
        return _el$6;
      }
    }), null);
    insert(_el$, createComponent2(Show, {
      get when() {
        return memberRoster();
      },
      get children() {
        var _el$8 = createElement("box"), _el$9 = createElement("text");
        insertNode(_el$8, _el$9);
        setProp(_el$8, "height", 1);
        setProp(_el$8, "padding", {
          left: 1
        });
        insert(_el$9, memberRoster);
        effect((_$p) => setProp(_el$9, "fg", colors.purple, _$p));
        return _el$8;
      }
    }), null);
    insert(_el$, createComponent2(Show, {
      get when() {
        return isLive();
      },
      get children() {
        return createComponent2(Show, {
          get when() {
            return groupedTasks().some((col) => col.length > 0);
          },
          get fallback() {
            return (() => {
              var _el$10 = createElement("box"), _el$11 = createElement("text");
              insertNode(_el$10, _el$11);
              setProp(_el$10, "padding", 1);
              insertNode(_el$11, createTextNode(`No tasks found`));
              effect((_$p) => setProp(_el$11, "fg", colors.fgDark, _$p));
              return _el$10;
            })();
          },
          get children() {
            var _el$0 = createElement("box");
            setProp(_el$0, "flexDirection", "row");
            setProp(_el$0, "flexGrow", 1);
            insert(_el$0, () => [0, 1, 2].map((colIndex) => (() => {
              var _el$13 = createElement("box"), _el$14 = createElement("box"), _el$15 = createElement("text");
              insertNode(_el$13, _el$14);
              setProp(_el$13, "flexDirection", "column");
              setProp(_el$13, "width", colIndex === 1 ? "34%" : "33%");
              setProp(_el$13, "borderStyle", "single");
              insertNode(_el$14, _el$15);
              setProp(_el$14, "height", 1);
              setProp(_el$14, "padding", {
                left: 1
              });
              setProp(_el$15, "bold", true);
              insert(_el$15, () => `${COLUMN_LABELS[colIndex]} (${groupedTasks()[colIndex].length})`);
              insert(_el$13, createComponent2(Show, {
                get when() {
                  return columnOptions()[colIndex].length > 0;
                },
                get fallback() {
                  return (() => {
                    var _el$17 = createElement("box"), _el$18 = createElement("text");
                    insertNode(_el$17, _el$18);
                    setProp(_el$17, "padding", {
                      left: 1
                    });
                    insertNode(_el$18, createTextNode(`\u2014`));
                    effect((_$p) => setProp(_el$18, "fg", colors.fgDark, _$p));
                    return _el$17;
                  })();
                },
                get children() {
                  var _el$16 = createElement("select");
                  setProp(_el$16, "width", "100%");
                  setProp(_el$16, "flexGrow", 1);
                  effect((_p$) => {
                    var _v$10 = columnOptions()[colIndex], _v$11 = props.focused && kanbanCol() === colIndex, _v$12 = colors.bg, _v$13 = colors.selection, _v$14 = colors.fg, _v$15 = colors.fgDark, _v$16 = colors.fgMuted, _v$17 = handleColumnSelect(colIndex), _v$18 = handleColumnChange(colIndex);
                    _v$10 !== _p$.e && (_p$.e = setProp(_el$16, "options", _v$10, _p$.e));
                    _v$11 !== _p$.t && (_p$.t = setProp(_el$16, "focused", _v$11, _p$.t));
                    _v$12 !== _p$.a && (_p$.a = setProp(_el$16, "backgroundColor", _v$12, _p$.a));
                    _v$13 !== _p$.o && (_p$.o = setProp(_el$16, "selectedBackgroundColor", _v$13, _p$.o));
                    _v$14 !== _p$.i && (_p$.i = setProp(_el$16, "selectedTextColor", _v$14, _p$.i));
                    _v$15 !== _p$.n && (_p$.n = setProp(_el$16, "textColor", _v$15, _p$.n));
                    _v$16 !== _p$.s && (_p$.s = setProp(_el$16, "descriptionColor", _v$16, _p$.s));
                    _v$17 !== _p$.h && (_p$.h = setProp(_el$16, "onSelect", _v$17, _p$.h));
                    _v$18 !== _p$.r && (_p$.r = setProp(_el$16, "onChange", _v$18, _p$.r));
                    return _p$;
                  }, {
                    e: undefined,
                    t: undefined,
                    a: undefined,
                    o: undefined,
                    i: undefined,
                    n: undefined,
                    s: undefined,
                    h: undefined,
                    r: undefined
                  });
                  return _el$16;
                }
              }), null);
              effect((_p$) => {
                var _v$19 = props.focused && kanbanCol() === colIndex ? colors.blue : colors.border, _v$20 = colors.bgDark, _v$21 = COLUMN_COLORS[colIndex];
                _v$19 !== _p$.e && (_p$.e = setProp(_el$13, "borderColor", _v$19, _p$.e));
                _v$20 !== _p$.t && (_p$.t = setProp(_el$14, "backgroundColor", _v$20, _p$.t));
                _v$21 !== _p$.a && (_p$.a = setProp(_el$15, "fg", _v$21, _p$.a));
                return _p$;
              }, {
                e: undefined,
                t: undefined,
                a: undefined
              });
              return _el$13;
            })()));
            return _el$0;
          }
        });
      }
    }), null);
    insert(_el$, createComponent2(Show, {
      get when() {
        return !isLive();
      },
      get children() {
        return createComponent2(Show, {
          get when() {
            return docsOptions().length > 0;
          },
          get fallback() {
            return (() => {
              var _el$20 = createElement("box"), _el$21 = createElement("text");
              insertNode(_el$20, _el$21);
              setProp(_el$20, "padding", 1);
              insertNode(_el$21, createTextNode(`No tasks found`));
              effect((_$p) => setProp(_el$21, "fg", colors.fgDark, _$p));
              return _el$20;
            })();
          },
          get children() {
            var _el$1 = createElement("select");
            setProp(_el$1, "width", "100%");
            setProp(_el$1, "flexGrow", 1);
            setProp(_el$1, "onSelect", (index) => props.onSelect(index));
            setProp(_el$1, "onChange", (index) => props.onChange?.(index));
            effect((_p$) => {
              var _v$ = docsOptions(), _v$2 = props.focused, _v$3 = colors.bg, _v$4 = colors.selection, _v$5 = colors.fg, _v$6 = colors.fgDark, _v$7 = colors.fgMuted;
              _v$ !== _p$.e && (_p$.e = setProp(_el$1, "options", _v$, _p$.e));
              _v$2 !== _p$.t && (_p$.t = setProp(_el$1, "focused", _v$2, _p$.t));
              _v$3 !== _p$.a && (_p$.a = setProp(_el$1, "backgroundColor", _v$3, _p$.a));
              _v$4 !== _p$.o && (_p$.o = setProp(_el$1, "selectedBackgroundColor", _v$4, _p$.o));
              _v$5 !== _p$.i && (_p$.i = setProp(_el$1, "selectedTextColor", _v$5, _p$.i));
              _v$6 !== _p$.n && (_p$.n = setProp(_el$1, "textColor", _v$6, _p$.n));
              _v$7 !== _p$.s && (_p$.s = setProp(_el$1, "descriptionColor", _v$7, _p$.s));
              return _p$;
            }, {
              e: undefined,
              t: undefined,
              a: undefined,
              o: undefined,
              i: undefined,
              n: undefined,
              s: undefined
            });
            return _el$1;
          }
        });
      }
    }), null);
    effect((_p$) => {
      var _v$8 = props.focused ? colors.blue : colors.border, _v$9 = colors.bgDark, _v$0 = headerColor(), _v$1 = colors.fgMuted;
      _v$8 !== _p$.e && (_p$.e = setProp(_el$, "borderColor", _v$8, _p$.e));
      _v$9 !== _p$.t && (_p$.t = setProp(_el$2, "backgroundColor", _v$9, _p$.t));
      _v$0 !== _p$.a && (_p$.a = setProp(_el$3, "fg", _v$0, _p$.a));
      _v$1 !== _p$.o && (_p$.o = setProp(_el$5, "fg", _v$1, _p$.o));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined,
      o: undefined
    });
    return _el$;
  })();
}

// src/components/TaskDetail.tsx
function statusLabel(status) {
  switch (status) {
    case "in_progress":
      return "\uEB99 In Progress";
    case "completed":
      return "\uF058 Completed";
    case "pending":
    default:
      return "\uF252 Pending";
  }
}
function ownerColor(owner, config) {
  if (!owner || !config)
    return colors.fg;
  const member = config.members.find((m) => m.name === owner);
  return member?.color || colors.fg;
}
function depStr(label, ids, allTasks) {
  if (ids.length === 0)
    return "";
  const resolved = ids.map((id) => {
    const dep = allTasks.find((t) => t.id === id);
    return dep ? `#${id} ${dep.subject}` : `#${id}`;
  });
  return `${label}: ${resolved.join(", ")}`;
}
function TaskDetail() {
  const entry = createMemo(() => {
    const unified = getUnifiedTeams();
    return unified[state.selectedTeamIndex];
  });
  const liveTask = createMemo(() => {
    const e = entry();
    if (!e || e.kind !== "live")
      return;
    return e.team.tasks[state.selectedTaskIndex];
  });
  const docsTask = createMemo(() => {
    const e = entry();
    if (!e || e.kind !== "docs")
      return;
    return e.team.tasks[state.selectedTaskIndex];
  });
  const teamConfig = createMemo(() => {
    const e = entry();
    if (!e || e.kind !== "live")
      return;
    return e.team.config;
  });
  const headerColor = createMemo(() => {
    const e = entry();
    if (!e)
      return colors.fgDark;
    if (e.kind === "live")
      return colors.green;
    return teamTypeColors[e.team.meta.type || "unknown"];
  });
  const title = createMemo(() => {
    const lt = liveTask();
    if (lt)
      return lt.subject;
    const dt = docsTask();
    if (dt)
      return dt.title;
    return "No task selected";
  });
  const allTasks = createMemo(() => {
    const e = entry();
    if (!e || e.kind !== "live")
      return [];
    return e.team.tasks;
  });
  const depsLine = createMemo(() => {
    const lt = liveTask();
    if (!lt)
      return "";
    const tasks = allTasks();
    const parts = [];
    const blocksStr = depStr("Blocks", lt.blocks, tasks);
    const blockedByStr = depStr("Blocked by", lt.blockedBy, tasks);
    if (blocksStr)
      parts.push(blocksStr);
    if (blockedByStr)
      parts.push(blockedByStr);
    return parts.join(" | ");
  });
  const ownerFg = createMemo(() => {
    const lt = liveTask();
    return ownerColor(lt?.owner, teamConfig());
  });
  return (() => {
    var _el$ = createElement("box"), _el$2 = createElement("box"), _el$3 = createElement("text");
    insertNode(_el$, _el$2);
    setProp(_el$, "flexDirection", "column");
    setProp(_el$, "borderStyle", "single");
    setProp(_el$, "width", "100%");
    setProp(_el$, "flexGrow", 1);
    insertNode(_el$2, _el$3);
    setProp(_el$2, "height", 1);
    setProp(_el$2, "padding", {
      left: 1
    });
    setProp(_el$3, "bold", true);
    insert(_el$3, title);
    insert(_el$, createComponent2(Switch, {
      get children() {
        return [createComponent2(Match, {
          get when() {
            return liveTask();
          },
          get children() {
            return [(() => {
              var _el$4 = createElement("box"), _el$5 = createElement("text");
              insertNode(_el$4, _el$5);
              setProp(_el$4, "padding", {
                left: 1,
                right: 1
              });
              insert(_el$5, () => `${statusLabel(liveTask().status)}${liveTask().owner ? ` | ${liveTask().owner}` : ""} | #${liveTask().id}`);
              effect((_$p) => setProp(_el$5, "fg", colors.fgMuted, _$p));
              return _el$4;
            })(), createComponent2(Show, {
              get when() {
                return memo2(() => liveTask().status === "in_progress")() && liveTask().activeForm;
              },
              get children() {
                var _el$6 = createElement("box"), _el$7 = createElement("text");
                insertNode(_el$6, _el$7);
                setProp(_el$6, "padding", {
                  left: 1,
                  right: 1
                });
                insert(_el$7, () => liveTask().activeForm);
                effect((_$p) => setProp(_el$7, "fg", colors.yellow, _$p));
                return _el$6;
              }
            }), createComponent2(Show, {
              get when() {
                return depsLine();
              },
              get children() {
                var _el$8 = createElement("box"), _el$9 = createElement("text");
                insertNode(_el$8, _el$9);
                setProp(_el$8, "padding", {
                  left: 1,
                  right: 1
                });
                insert(_el$9, depsLine);
                effect((_$p) => setProp(_el$9, "fg", colors.orange, _$p));
                return _el$8;
              }
            }), createComponent2(Show, {
              get when() {
                return liveTask().description;
              },
              get children() {
                var _el$0 = createElement("scrollbox"), _el$1 = createElement("box"), _el$10 = createElement("text");
                insertNode(_el$0, _el$1);
                setProp(_el$0, "flexGrow", 1);
                setProp(_el$0, "width", "100%");
                insertNode(_el$1, _el$10);
                setProp(_el$1, "padding", {
                  left: 1,
                  right: 1
                });
                insert(_el$10, () => liveTask().description);
                effect((_$p) => setProp(_el$10, "fg", colors.fg, _$p));
                return _el$0;
              }
            }), createComponent2(Show, {
              get when() {
                return !liveTask().description;
              },
              get children() {
                var _el$11 = createElement("box"), _el$12 = createElement("text");
                insertNode(_el$11, _el$12);
                setProp(_el$11, "padding", 1);
                insertNode(_el$12, createTextNode(`No description`));
                effect((_$p) => setProp(_el$12, "fg", colors.fgDark, _$p));
                return _el$11;
              }
            })];
          }
        }), createComponent2(Match, {
          get when() {
            return docsTask();
          },
          get children() {
            return [(() => {
              var _el$14 = createElement("box"), _el$15 = createElement("text");
              insertNode(_el$14, _el$15);
              setProp(_el$14, "padding", {
                left: 1,
                right: 1
              });
              insert(_el$15, () => docsTask().filename, null);
              insert(_el$15, (() => {
                var _c$ = memo2(() => !!docsTask().owner);
                return () => _c$() ? ` | ${docsTask().owner}` : "";
              })(), null);
              insert(_el$15, (() => {
                var _c$2 = memo2(() => !!docsTask().date);
                return () => _c$2() ? ` | ${docsTask().date}` : "";
              })(), null);
              effect((_$p) => setProp(_el$15, "fg", colors.fgMuted, _$p));
              return _el$14;
            })(), (() => {
              var _el$16 = createElement("scrollbox"), _el$17 = createElement("markdown");
              insertNode(_el$16, _el$17);
              setProp(_el$16, "flexGrow", 1);
              setProp(_el$16, "width", "100%");
              insert(_el$17, () => docsTask().content);
              return _el$16;
            })()];
          }
        }), createComponent2(Match, {
          when: true,
          get children() {
            var _el$18 = createElement("box"), _el$19 = createElement("text");
            insertNode(_el$18, _el$19);
            setProp(_el$18, "padding", 1);
            insertNode(_el$19, createTextNode(`Select a task to view details`));
            effect((_$p) => setProp(_el$19, "fg", colors.fgDark, _$p));
            return _el$18;
          }
        })];
      }
    }), null);
    effect((_p$) => {
      var _v$ = colors.blue, _v$2 = colors.bgDark, _v$3 = headerColor();
      _v$ !== _p$.e && (_p$.e = setProp(_el$, "borderColor", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = setProp(_el$2, "backgroundColor", _v$2, _p$.t));
      _v$3 !== _p$.a && (_p$.a = setProp(_el$3, "fg", _v$3, _p$.a));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined
    });
    return _el$;
  })();
}

// src/components/StatusBar.tsx
function StatusBar(props) {
  const timeStr = createMemo(() => {
    const d = state.lastUpdate;
    if (!d)
      return "\u2014";
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  });
  const shortPath = createMemo(() => {
    const p = state.watchPath;
    const parts = p.split("/").filter(Boolean);
    if (parts.length <= 2)
      return p;
    return ".../" + parts.slice(-2).join("/");
  });
  return (() => {
    var _el$ = createElement("box"), _el$2 = createElement("text"), _el$3 = createTextNode(` | `), _el$4 = createTextNode(` teams`), _el$5 = createTextNode(` | `), _el$6 = createTextNode(` | focus:`), _el$7 = createTextNode(` | `);
    insertNode(_el$, _el$2);
    setProp(_el$, "width", "100%");
    setProp(_el$, "height", 1);
    setProp(_el$, "flexDirection", "row");
    setProp(_el$, "padding", {
      left: 1,
      right: 1
    });
    insertNode(_el$2, _el$3);
    insertNode(_el$2, _el$4);
    insertNode(_el$2, _el$5);
    insertNode(_el$2, _el$6);
    insertNode(_el$2, _el$7);
    insert(_el$2, shortPath, _el$3);
    insert(_el$2, () => state.teams.length + state.liveTeams.length, _el$4);
    insert(_el$2, (() => {
      var _c$ = memo2(() => state.liveTeams.length > 0);
      return () => _c$() ? ` (${state.liveTeams.length} live)` : "";
    })(), _el$5);
    insert(_el$2, timeStr, _el$6);
    insert(_el$2, () => props.panelFocus || "?", _el$7);
    insert(_el$2, () => props.lastKey || "j/k:nav enter:select q:quit", null);
    insert(_el$2, () => {
      const entry = getUnifiedTeams()[state.selectedTeamIndex];
      return entry?.kind === "docs" ? " \uF187 a:archive" : "";
    }, null);
    effect((_p$) => {
      var _v$ = colors.bgDark, _v$2 = colors.fgMuted;
      _v$ !== _p$.e && (_p$.e = setProp(_el$, "backgroundColor", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = setProp(_el$2, "fg", _v$2, _p$.t));
      return _p$;
    }, {
      e: undefined,
      t: undefined
    });
    return _el$;
  })();
}

// src/data/archive.ts
import { mkdir, rename } from "fs/promises";
import { resolve, join } from "path";
async function archiveDocsTeam(watchPath, dirName) {
  const archivePath = resolve(watchPath, "..", "teams-archived");
  await mkdir(archivePath, { recursive: true });
  await rename(join(watchPath, dirName), join(archivePath, dirName));
}

// src/App.tsx
function App(props) {
  const renderer = useRenderer();
  const dimensions = useTerminalDimensions();
  const isWide = createMemo(() => dimensions().width >= 80);
  const [panelFocus, setPanelFocus] = createSignal("left");
  const [lastKey, setLastKey] = createSignal("");
  const [archiveConfirm, setArchiveConfirm] = createSignal(null);
  function handleTeamChange(index) {
    setLastKey(`onChange:team[${index}]`);
    selectTeam(index);
  }
  function handleTeamSelect(index) {
    setLastKey(`select:team[${index}]`);
    selectTeam(index);
    if (isWide()) {
      setPanelFocus("right");
    } else {
      setViewMode("tasks");
    }
  }
  function handleTaskChange(index) {
    setLastKey(`onChange:task[${index}]`);
    selectTask(index);
  }
  function handleTaskSelect(index) {
    setLastKey(`select:task[${index}]`);
    selectTask(index);
    setViewMode("detail");
  }
  useKeyboard((key) => {
    setLastKey(`key:${key.name}`);
    const confirming = archiveConfirm();
    if (confirming) {
      if (key.name === "y") {
        const dir = confirming;
        setArchiveConfirm(null);
        archiveDocsTeam(state.watchPath, dir).then(() => removeTeam(dir));
      } else if (key.name === "n" || key.name === "escape") {
        setArchiveConfirm(null);
      }
      return;
    }
    if (key.name === "q" || key.ctrl && key.name === "c") {
      renderer.destroy();
      process.exit(0);
    }
    if (key.name === "a") {
      const unified = getUnifiedTeams();
      const entry = unified[state.selectedTeamIndex];
      if (entry && entry.kind === "docs") {
        setArchiveConfirm(entry.team.dir);
      }
    }
    if (key.name === "escape") {
      if (state.viewMode === "detail") {
        setViewMode("tasks");
        if (isWide())
          setPanelFocus("right");
      } else if (state.viewMode === "tasks" && !isWide()) {
        setViewMode("teams");
      } else if (isWide() && panelFocus() === "right") {
        setPanelFocus("left");
      }
    }
    if (key.name === "tab") {
      if (isWide() && state.viewMode !== "detail") {
        setPanelFocus((f) => f === "left" ? "right" : "left");
      }
    }
  });
  return (() => {
    var _el$ = createElement("box");
    setProp(_el$, "flexDirection", "column");
    setProp(_el$, "width", "100%");
    setProp(_el$, "height", "100%");
    insert(_el$, createComponent2(Header, {}), null);
    insert(_el$, createComponent2(Switch, {
      get children() {
        return [createComponent2(Match, {
          get when() {
            return state.viewMode === "detail";
          },
          get children() {
            return createComponent2(TaskDetail, {});
          }
        }), createComponent2(Match, {
          get when() {
            return isWide();
          },
          get children() {
            var _el$2 = createElement("box"), _el$3 = createElement("box"), _el$4 = createElement("box");
            insertNode(_el$2, _el$3);
            insertNode(_el$2, _el$4);
            setProp(_el$2, "flexDirection", "row");
            setProp(_el$2, "flexGrow", 1);
            setProp(_el$3, "width", "30%");
            insert(_el$3, createComponent2(TeamList, {
              get focused() {
                return panelFocus() === "left";
              },
              onSelect: handleTeamSelect,
              onChange: handleTeamChange
            }));
            setProp(_el$4, "flexGrow", 1);
            insert(_el$4, createComponent2(TaskList, {
              get focused() {
                return panelFocus() === "right";
              },
              onSelect: handleTaskSelect,
              onChange: handleTaskChange
            }));
            return _el$2;
          }
        }), createComponent2(Match, {
          get when() {
            return state.viewMode === "tasks";
          },
          get children() {
            return createComponent2(TaskList, {
              focused: true,
              onSelect: handleTaskSelect,
              onChange: handleTaskChange
            });
          }
        }), createComponent2(Match, {
          get when() {
            return state.viewMode === "teams";
          },
          get children() {
            return createComponent2(TeamList, {
              focused: true,
              onSelect: handleTeamSelect,
              onChange: handleTeamChange
            });
          }
        })];
      }
    }), null);
    insert(_el$, createComponent2(Show, {
      get when() {
        return archiveConfirm();
      },
      children: (dir) => (() => {
        var _el$5 = createElement("box"), _el$6 = createElement("text"), _el$7 = createTextNode(`Archive `), _el$8 = createTextNode(`? (y/n)`);
        insertNode(_el$5, _el$6);
        setProp(_el$5, "width", "100%");
        setProp(_el$5, "height", 1);
        setProp(_el$5, "padding", {
          left: 1,
          right: 1
        });
        insertNode(_el$6, _el$7);
        insertNode(_el$6, _el$8);
        insert(_el$6, dir, _el$8);
        effect((_p$) => {
          var _v$ = colors.bgDark, _v$2 = colors.yellow;
          _v$ !== _p$.e && (_p$.e = setProp(_el$5, "backgroundColor", _v$, _p$.e));
          _v$2 !== _p$.t && (_p$.t = setProp(_el$6, "fg", _v$2, _p$.t));
          return _p$;
        }, {
          e: undefined,
          t: undefined
        });
        return _el$5;
      })()
    }), null);
    insert(_el$, createComponent2(StatusBar, {
      get lastKey() {
        return lastKey();
      },
      get panelFocus() {
        return panelFocus();
      }
    }), null);
    effect((_$p) => setProp(_el$, "backgroundColor", colors.bg, _$p));
    return _el$;
  })();
}

// src/data/parser.ts
import { readdir, readFile, mkdir as mkdir2, stat } from "fs/promises";
import { join as join2, basename } from "path";
import matter from "gray-matter";
var TYPE_PREFIXES = [
  ["review", "review"],
  ["feature", "feature"],
  ["plan", "planning"],
  ["research", "research"],
  ["brainstorm", "brainstorm"]
];
function inferType(dirName) {
  for (const [prefix, type] of TYPE_PREFIXES) {
    if (dirName.startsWith(prefix))
      return type;
  }
  return "unknown";
}
function formatDate(val) {
  if (!val)
    return;
  if (val instanceof Date)
    return val.toISOString().slice(0, 10);
  return String(val);
}
function normalizeMode(mode) {
  if (typeof mode !== "string")
    return;
  if (mode === "\u2014" || mode === "\u2014")
    return;
  return mode;
}
function extractTitleFromContent(content, filename) {
  const match = content.match(/^#\s+(.+)$/m);
  if (match)
    return match[1].trim();
  return basename(filename, ".md").replace(/-/g, " ");
}
function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}
async function parseReadme(dirPath, dirName) {
  try {
    const readmePath = join2(dirPath, "README.md");
    const raw = await readFile(readmePath, "utf-8");
    const { data } = matter(raw);
    return {
      team: data.team || dirName,
      type: data.type || inferType(dirName),
      mode: normalizeMode(data.mode),
      topic: data.topic,
      date: formatDate(data.date),
      status: data.status,
      teammates: data.teammates,
      pipeline: data.pipeline
    };
  } catch {
    return {
      team: dirName,
      type: inferType(dirName)
    };
  }
}
async function parseTask(filePath) {
  const filename = basename(filePath, ".md");
  const raw = await readFile(filePath, "utf-8");
  const { data, content } = matter(raw);
  const title = data.title || extractTitleFromContent(raw, filePath);
  return {
    id: filename,
    title,
    filename: basename(filePath),
    owner: data.owner,
    date: formatDate(data.date),
    content
  };
}
async function parseTasks(dirPath) {
  const tasksDir = join2(dirPath, "tasks");
  try {
    const entries = await readdir(tasksDir);
    const mdFiles = entries.filter((f) => f.endsWith(".md")).sort(naturalSort);
    const tasks = await Promise.all(mdFiles.map((f) => parseTask(join2(tasksDir, f))));
    return tasks;
  } catch {
    return [];
  }
}
async function getDirMtime(dirPath) {
  try {
    const s = await stat(dirPath);
    return s.mtimeMs;
  } catch {
    return 0;
  }
}
async function parseTeam(dirPath) {
  const dirName = basename(dirPath);
  const [meta, tasks, lastModified] = await Promise.all([
    parseReadme(dirPath, dirName),
    parseTasks(dirPath),
    getDirMtime(dirPath)
  ]);
  return { dir: dirName, meta, tasks, lastModified };
}
async function parseAllTeams(watchPath) {
  await mkdir2(watchPath, { recursive: true });
  const entries = await readdir(watchPath, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  const teams = await Promise.all(dirs.map((d) => parseTeam(join2(watchPath, d))));
  return teams.sort((a, b) => b.lastModified - a.lastModified);
}

// src/data/json-parser.ts
import { readFile as readFile2, readdir as readdir2, mkdir as mkdir3, stat as stat2 } from "fs/promises";
import { join as join3, basename as basename2 } from "path";
var VALID_STATUSES = new Set(["pending", "in_progress", "completed"]);
function asString(val) {
  return typeof val === "string" ? val : undefined;
}
function asStringArray(val) {
  if (!Array.isArray(val))
    return [];
  return val.filter((v) => typeof v === "string");
}
function parseJsonTask(raw, fileId) {
  try {
    const data = JSON.parse(raw);
    if (typeof data !== "object" || data === null)
      return null;
    const subject = asString(data.subject);
    if (!subject)
      return null;
    const status = VALID_STATUSES.has(data.status) ? data.status : "pending";
    return {
      id: asString(data.id) || fileId,
      subject,
      description: asString(data.description),
      activeForm: asString(data.activeForm),
      owner: asString(data.owner),
      status,
      blocks: asStringArray(data.blocks),
      blockedBy: asStringArray(data.blockedBy)
    };
  } catch {
    return null;
  }
}
async function parseTaskFile(filePath) {
  try {
    const raw = await readFile2(filePath, "utf-8");
    const fileId = basename2(filePath, ".json");
    return parseJsonTask(raw, fileId);
  } catch {
    return null;
  }
}
function naturalSort2(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}
async function parseTeamTasks(teamDirPath) {
  try {
    const entries = await readdir2(teamDirPath);
    const jsonFiles = entries.filter((f) => f.endsWith(".json")).sort(naturalSort2);
    const results = await Promise.all(jsonFiles.map((f) => parseTaskFile(join3(teamDirPath, f))));
    return results.filter((t) => t !== null);
  } catch {
    return [];
  }
}
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUUID(s) {
  return UUID_RE.test(s);
}
async function getDirMtime2(dirPath) {
  try {
    const entries = await readdir2(dirPath);
    if (entries.length === 0) {
      const s = await stat2(dirPath);
      return s.mtimeMs;
    }
    const mtimes = await Promise.all(entries.map(async (f) => {
      try {
        const s = await stat2(join3(dirPath, f));
        return s.mtimeMs;
      } catch {
        return 0;
      }
    }));
    return Math.max(...mtimes);
  } catch {
    return 0;
  }
}
async function parseAllLiveTeams(tasksPath) {
  await mkdir3(tasksPath, { recursive: true });
  const entries = await readdir2(tasksPath, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory() && !isUUID(e.name)).map((e) => e.name);
  const teams = await Promise.all(dirs.map(async (dirName) => {
    const dirPath = join3(tasksPath, dirName);
    const [tasks, lastModified] = await Promise.all([
      parseTeamTasks(dirPath),
      getDirMtime2(dirPath)
    ]);
    return { dirName, displayName: dirName, tasks, lastModified };
  }));
  return teams.sort((a, b) => b.lastModified - a.lastModified);
}

// src/data/watcher.ts
import { watch } from "chokidar";
import { join as join4, relative, sep } from "path";
var debounceTimer = null;
var pendingDirs = new Set;
function getTeamDir(watchPath, changedPath) {
  const rel = relative(watchPath, changedPath);
  const parts = rel.split(sep);
  if (parts.length >= 1 && parts[0] !== "." && parts[0] !== "..") {
    return parts[0];
  }
  return null;
}
function startFileWatcher(watchPath) {
  const watcher = watch(watchPath, {
    ignoreInitial: true,
    depth: 3,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50
    }
  });
  const scheduleUpdate = (filePath) => {
    if (!filePath.endsWith(".md"))
      return;
    const teamDir = getTeamDir(watchPath, filePath);
    if (!teamDir)
      return;
    pendingDirs.add(teamDir);
    if (debounceTimer)
      clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const dirs = [...pendingDirs];
      pendingDirs.clear();
      for (const dir of dirs) {
        try {
          const team = await parseTeam(join4(watchPath, dir));
          updateTeam(dir, team);
        } catch {}
      }
    }, 200);
  };
  watcher.on("add", scheduleUpdate);
  watcher.on("change", scheduleUpdate);
  watcher.on("unlink", scheduleUpdate);
  return watcher;
}

// src/data/json-watcher.ts
import { watch as watch2 } from "chokidar";
import { join as join6, relative as relative2, sep as sep2 } from "path";
import { mkdir as mkdir4 } from "fs/promises";

// src/data/config-reader.ts
import { readdir as readdir3, readFile as readFile3 } from "fs/promises";
import { join as join5 } from "path";
import { homedir } from "os";
function asString2(val) {
  return typeof val === "string" ? val : undefined;
}
function parseMember(m) {
  if (typeof m !== "object" || m === null)
    return null;
  const obj = m;
  const name = asString2(obj.name);
  if (!name)
    return null;
  return {
    name,
    agentType: asString2(obj.agentType) || "unknown",
    model: asString2(obj.model) || "unknown",
    color: asString2(obj.color) || "white"
  };
}
function parseConfig(raw) {
  try {
    const data = JSON.parse(raw);
    if (typeof data !== "object" || data === null)
      return null;
    const name = asString2(data.name);
    if (!name)
      return null;
    const members = [];
    if (Array.isArray(data.members)) {
      for (const m of data.members) {
        const parsed = parseMember(m);
        if (parsed)
          members.push(parsed);
      }
    }
    return {
      name,
      description: asString2(data.description) || "",
      members
    };
  } catch {
    return null;
  }
}
function getTeamsDir() {
  return join5(homedir(), ".claude", "teams");
}
function getTasksDir() {
  return join5(homedir(), ".claude", "tasks");
}
async function scanTeamConfigs() {
  const configs = new Map;
  const teamsDir = getTeamsDir();
  try {
    const entries = await readdir3(teamsDir, { withFileTypes: true });
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    await Promise.all(dirs.map(async (dirName) => {
      try {
        const raw = await readFile3(join5(teamsDir, dirName, "config.json"), "utf-8");
        const config = parseConfig(raw);
        if (config) {
          configs.set(dirName, config);
          if (config.name !== dirName) {
            configs.set(config.name, config);
          }
        }
      } catch {}
    }));
  } catch {}
  return configs;
}
var UUID_RE2 = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUUID2(s) {
  return UUID_RE2.test(s);
}
function resolveDisplayName(dirName, configs) {
  const config = configs.get(dirName);
  if (config)
    return config.name;
  if (isUUID2(dirName))
    return dirName.slice(0, 8);
  return dirName;
}

// src/data/json-watcher.ts
var debounceTimer2 = null;
var pendingDirs2 = new Set;
var configCache = new Map;
function getTeamDir2(watchPath, changedPath) {
  const rel = relative2(watchPath, changedPath);
  const parts = rel.split(sep2);
  if (parts.length >= 2 && parts[0] !== "." && parts[0] !== "..") {
    return parts[0];
  }
  return null;
}
var IGNORED_EXTENSIONS = new Set([".lock", ".highwatermark"]);
function shouldIgnore(filePath) {
  for (const ext of IGNORED_EXTENSIONS) {
    if (filePath.endsWith(ext))
      return true;
  }
  return !filePath.endsWith(".json");
}
function setConfigCache(configs) {
  configCache = configs;
}
async function startJsonWatcher(tasksPath) {
  await mkdir4(tasksPath, { recursive: true });
  const watcher = watch2(tasksPath, {
    ignoreInitial: true,
    depth: 1,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50
    }
  });
  const scheduleUpdate = (filePath) => {
    if (shouldIgnore(filePath))
      return;
    const teamDir = getTeamDir2(tasksPath, filePath);
    if (!teamDir || isUUID(teamDir))
      return;
    pendingDirs2.add(teamDir);
    if (debounceTimer2)
      clearTimeout(debounceTimer2);
    debounceTimer2 = setTimeout(async () => {
      const dirs = [...pendingDirs2];
      pendingDirs2.clear();
      for (const dir of dirs) {
        try {
          const tasks = await parseTeamTasks(join6(tasksPath, dir));
          const displayName = resolveDisplayName(dir, configCache);
          const config = configCache.get(dir);
          updateLiveTeam(dir, tasks, displayName, config);
        } catch {}
      }
    }, 200);
  };
  watcher.on("add", scheduleUpdate);
  watcher.on("change", scheduleUpdate);
  watcher.on("unlink", scheduleUpdate);
  return watcher;
}

// index.tsx
var watchPath = resolve2(process.argv[2] || "docs/teams");
var tasksPath = getTasksDir();
var [teams, configs, liveTeams] = await Promise.all([parseAllTeams(watchPath), scanTeamConfigs(), parseAllLiveTeams(tasksPath)]);
for (const lt of liveTeams) {
  const config = configs.get(lt.dirName);
  if (config) {
    lt.displayName = config.name;
    lt.config = config;
  }
}
setWatchPath(watchPath);
setTeams(teams);
setLiveTeams(liveTeams);
setConfigCache(configs);
startFileWatcher(watchPath);
startJsonWatcher(tasksPath);
render(() => createComponent2(App, {
  watchPath
}));
