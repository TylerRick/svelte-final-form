(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('svelte'), require('final-form'), require('svelte/internal')) :
  typeof define === 'function' && define.amd ? define(['exports', 'svelte', 'final-form', 'svelte/internal'], factory) :
  (global = global || self, factory(global['svelte-final-form'] = {}, global.svelte, global.finalForm, global.internal));
}(this, (function (exports, svelte, finalForm, internal) { 'use strict';

  const key = {};

  // Simple setter/getter
  const setFormContext = context => {
    svelte.setContext(key, context);
  };
  const getFormContext = () => {
    return svelte.getContext(key)
  };

  // This simply wraps the upstream (final-form) createForm and provides the created form via context

  function createFormContext({
    initialValues,
    ...restProps
  }) {
    const form = finalForm.createForm({ initialValues, ...restProps });

    setFormContext(form);

    return form
  }

  function whenValueChanges(init, callback, isEqual = (a, b) => a === b) {
    let prev = init;
    return (value) => {
      if (!isEqual(prev, value)) {
        callback();
        prev = value;
      }
    };
  }

  const shallowEqual = (a, b) => {
    if (a === b) {
      return true;
    }
    if (typeof a !== "object" || !a || typeof b !== "object" || !b) {
      return false;
    }
    var keysA = Object.keys(a);
    var keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
      return false;
    }
    var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(b);
    for (var idx = 0; idx < keysA.length; idx++) {
      var key = keysA[idx];
      if (!bHasOwnProperty(key) || a[key] !== b[key]) {
        return false;
      }
    }
    return true;
  };

  // This is the equivalent of useForm from react-final-form.

  // TODO rename to just all like useField
  const allSubscription = () => {
    return finalForm.formSubscriptionItems.reduce((result, key) => {
      result[key] = true;
      return result
    }, {})
  };

  function useForm({
    subscription = allSubscription(),
    initialValues,
    ...restProps
  }, onUpdateState) {

    let state = {};
    let unsubscribe;

    const form = finalForm.createForm({
      initialValues,
      ...restProps
    });

    setFormContext(form);

    svelte.onMount(() => {
      unsubscribe = form.subscribe(onUpdateState, subscription);
    });

    svelte.onDestroy(() => {
      unsubscribe && unsubscribe();
    });

    return [form, state]
  }

  // Just a simple wrapper for getFormContext, in order to provide an API matching react-final-form

  const useForm$1 = () => {
    const form = getFormContext();

    if (process.env.NODE_ENV !== "production" && !form) {
      throw new Error(
        "Could not find svelte-final-form context value. Please ensure that your Field is inside the Form component.",
      )
    }

    return form
  };

  function noop() { }
  function run(fn) {
      return fn();
  }
  function run_all(fns) {
      fns.forEach(run);
  }
  function is_function(thing) {
      return typeof thing === 'function';
  }
  function safe_not_equal(a, b) {
      return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
  }
  function subscribe(store, ...callbacks) {
      if (store == null) {
          return noop;
      }
      const unsub = store.subscribe(...callbacks);
      return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
  }

  const subscriber_queue = [];
  /**
   * Creates a `Readable` store that allows reading by subscription.
   * @param value initial value
   * @param {StartStopNotifier}start start and stop notifications for subscriptions
   */
  function readable(value, start) {
      return {
          subscribe: writable(value, start).subscribe
      };
  }
  /**
   * Create a `Writable` store that allows both updating and reading by subscription.
   * @param {*=}value initial value
   * @param {StartStopNotifier=}start start and stop notifications for subscriptions
   */
  function writable(value, start = noop) {
      let stop;
      const subscribers = [];
      function set(new_value) {
          if (safe_not_equal(value, new_value)) {
              value = new_value;
              if (stop) { // store is ready
                  const run_queue = !subscriber_queue.length;
                  for (let i = 0; i < subscribers.length; i += 1) {
                      const s = subscribers[i];
                      s[1]();
                      subscriber_queue.push(s, value);
                  }
                  if (run_queue) {
                      for (let i = 0; i < subscriber_queue.length; i += 2) {
                          subscriber_queue[i][0](subscriber_queue[i + 1]);
                      }
                      subscriber_queue.length = 0;
                  }
              }
          }
      }
      function update(fn) {
          set(fn(value));
      }
      function subscribe(run, invalidate = noop) {
          const subscriber = [run, invalidate];
          subscribers.push(subscriber);
          if (subscribers.length === 1) {
              stop = start(set) || noop;
          }
          run(value);
          return () => {
              const index = subscribers.indexOf(subscriber);
              if (index !== -1) {
                  subscribers.splice(index, 1);
              }
              if (subscribers.length === 0) {
                  stop();
                  stop = null;
              }
          };
      }
      return { set, update, subscribe };
  }
  function derived(stores, fn, initial_value) {
      const single = !Array.isArray(stores);
      const stores_array = single
          ? [stores]
          : stores;
      const auto = fn.length < 2;
      return readable(initial_value, (set) => {
          let inited = false;
          const values = [];
          let pending = 0;
          let cleanup = noop;
          const sync = () => {
              if (pending) {
                  return;
              }
              cleanup();
              const result = fn(single ? values[0] : values, set);
              if (auto) {
                  set(result);
              }
              else {
                  cleanup = is_function(result) ? result : noop;
              }
          };
          const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
              values[i] = value;
              pending &= ~(1 << i);
              if (inited) {
                  sync();
              }
          }, () => {
              pending |= (1 << i);
          }));
          inited = true;
          sync();
          return function stop() {
              run_all(unsubscribers);
              cleanup();
          };
      });
  }

  // import { addLazyFieldMetaState } from './getters'

  const all = finalForm.fieldSubscriptionItems.reduce((result, key) => {
    result[key] = true;
    return result
  }, {});

  const defaultFormat = (value) => value === undefined ? '' : value;
  const defaultParse = (value) => value === '' ? undefined : value;

  // const defaultIsEqual = (a, b) => a === b

  const useField = (
    name,
    config = {},
  ) => {
    // Docs: https://final-form.org/docs/react-final-form/types/FieldProps
    const {
      afterSubmit,
      allowNull,
      component,
      data,
      defaultValue,
      format = defaultFormat,
      formatOnBlur,
      initialValue,
      multiple,
      parse = defaultParse,
      subscription = all,
      type,
      validateFields,
      value: _value,

      validate,
    } = config;

    const form = useForm$1();
    if (process.env.NODE_ENV !== "production" && !form) {
      throw new Error(
        "Could not find svelte-final-form context value. Please ensure that your Field is inside the Form component.",
      )
    }

    const store = readable({}, set => {
      let unsubscribe;

      const subscriber = (fieldState) => {
        // Docs: https://final-form.org/docs/final-form/types/FieldState
        const {
          blur,
          change,
          focus,
          // eslint-disable-next-line no-shadow
          name,
          value,
          ...meta
        } = fieldState;
        // console.log(`useField: new fieldState for ${name}`, fieldState)

        const input = {
          name,
          onBlur: blur,
          onChange: (val) => {
            change(parse(val, name));
          },
          onFocus: focus,
          value: format(value),
        };
        set({
          input,
          meta,
        });
      };

      // Docs: https://final-form.org/docs/final-form/types/FormApi#registerfield
      // console.log('useField: form.registerField', name)
      unsubscribe = form.registerField(
        name,
        subscriber,
        subscription,
        // Docs: https://final-form.org/docs/final-form/types/FieldConfig
        {
          getValidator: () => validate,
        },
      );

      return () => {
        unsubscribe();
      }
    });

    return store
  };

  /* src/Form.svelte generated by Svelte v3.29.0 */
  const get_default_slot_changes = dirty => ({ state: dirty & /*state*/ 1 });

  const get_default_slot_context = ctx => ({
  	form: /*form*/ ctx[1],
  	state: /*state*/ ctx[0]
  });

  function create_fragment(ctx) {
  	let current;
  	const default_slot_template = /*#slots*/ ctx[6].default;
  	const default_slot = internal.create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], get_default_slot_context);

  	return {
  		c() {
  			if (default_slot) default_slot.c();
  		},
  		m(target, anchor) {
  			if (default_slot) {
  				default_slot.m(target, anchor);
  			}

  			current = true;
  		},
  		p(ctx, [dirty]) {
  			if (default_slot) {
  				if (default_slot.p && dirty & /*$$scope, state*/ 33) {
  					internal.update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, get_default_slot_changes, get_default_slot_context);
  				}
  			}
  		},
  		i(local) {
  			if (current) return;
  			internal.transition_in(default_slot, local);
  			current = true;
  		},
  		o(local) {
  			internal.transition_out(default_slot, local);
  			current = false;
  		},
  		d(detaching) {
  			if (default_slot) default_slot.d(detaching);
  		}
  	};
  }

  function instance($$self, $$props, $$invalidate) {
  	const omit_props_names = ["subscription","initialValues","initialValuesEqual"];
  	let $$restProps = internal.compute_rest_props($$props, omit_props_names);
  	let { $$slots: slots = {}, $$scope } = $$props;
  	let { subscription = undefined } = $$props;
  	let { initialValues } = $$props;
  	let { initialValuesEqual } = $$props;
  	let state = {};

  	const form = useForm(
  		{
  			subscription,
  			initialValues,
  			...$$restProps
  		},
  		newState => {
  			$$invalidate(0, state = newState);
  		}
  	);

  	const whenInitialValuesChanges = whenValueChanges(initialValues, () => form.setConfig("initialValues", initialValues), initialValuesEqual || shallowEqual);

  	$$self.$$set = $$new_props => {
  		$$props = internal.assign(internal.assign({}, $$props), internal.exclude_internal_props($$new_props));
  		$$invalidate(8, $$restProps = internal.compute_rest_props($$props, omit_props_names));
  		if ("subscription" in $$new_props) $$invalidate(2, subscription = $$new_props.subscription);
  		if ("initialValues" in $$new_props) $$invalidate(3, initialValues = $$new_props.initialValues);
  		if ("initialValuesEqual" in $$new_props) $$invalidate(4, initialValuesEqual = $$new_props.initialValuesEqual);
  		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
  	};

  	$$self.$$.update = () => {
  		if ($$self.$$.dirty & /*initialValues*/ 8) {
  			 whenInitialValuesChanges(initialValues);
  		}
  	};

  	return [state, form, subscription, initialValues, initialValuesEqual, $$scope, slots];
  }

  class Form extends internal.SvelteComponent {
  	constructor(options) {
  		super();

  		internal.init(this, options, instance, create_fragment, internal.safe_not_equal, {
  			subscription: 2,
  			initialValues: 3,
  			initialValuesEqual: 4
  		});
  	}
  }

  /* src/Field.svelte generated by Svelte v3.29.0 */

  const get_default_slot_changes$1 = dirty => ({
  	input: dirty & /*input*/ 1,
  	meta: dirty & /*meta*/ 2
  });

  const get_default_slot_context$1 = ctx => ({
  	input: /*input*/ ctx[0],
  	meta: /*meta*/ ctx[1]
  });

  function create_fragment$1(ctx) {
  	let current;
  	const default_slot_template = /*#slots*/ ctx[7].default;
  	const default_slot = internal.create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], get_default_slot_context$1);

  	return {
  		c() {
  			if (default_slot) default_slot.c();
  		},
  		m(target, anchor) {
  			if (default_slot) {
  				default_slot.m(target, anchor);
  			}

  			current = true;
  		},
  		p(ctx, [dirty]) {
  			if (default_slot) {
  				if (default_slot.p && dirty & /*$$scope, input, meta*/ 67) {
  					internal.update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, get_default_slot_changes$1, get_default_slot_context$1);
  				}
  			}
  		},
  		i(local) {
  			if (current) return;
  			internal.transition_in(default_slot, local);
  			current = true;
  		},
  		o(local) {
  			internal.transition_out(default_slot, local);
  			current = false;
  		},
  		d(detaching) {
  			if (default_slot) default_slot.d(detaching);
  		}
  	};
  }

  function instance$1($$self, $$props, $$invalidate) {
  	const omit_props_names = ["name","subscription","validate"];
  	let $$restProps = internal.compute_rest_props($$props, omit_props_names);
  	let $field;
  	let { $$slots: slots = {}, $$scope } = $$props;
  	let { name } = $$props;
  	let { subscription = undefined } = $$props;
  	let { validate = undefined } = $$props;
  	const field = useField(name, { subscription, validate, ...$$restProps });
  	internal.component_subscribe($$self, field, value => $$invalidate(8, $field = value));
  	let input, meta;

  	$$self.$$set = $$new_props => {
  		$$props = internal.assign(internal.assign({}, $$props), internal.exclude_internal_props($$new_props));
  		$$invalidate(9, $$restProps = internal.compute_rest_props($$props, omit_props_names));
  		if ("name" in $$new_props) $$invalidate(3, name = $$new_props.name);
  		if ("subscription" in $$new_props) $$invalidate(4, subscription = $$new_props.subscription);
  		if ("validate" in $$new_props) $$invalidate(5, validate = $$new_props.validate);
  		if ("$$scope" in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
  	};

  	$$self.$$.update = () => {
  		if ($$self.$$.dirty & /*$field*/ 256) {
  			 $$invalidate(0, { input, meta } = $field, input, ($$invalidate(1, meta), $$invalidate(8, $field)));
  		}
  	};

  	return [input, meta, field, name, subscription, validate, $$scope, slots];
  }

  class Field extends internal.SvelteComponent {
  	constructor(options) {
  		super();
  		internal.init(this, options, instance$1, create_fragment$1, internal.safe_not_equal, { name: 3, subscription: 4, validate: 5 });
  	}
  }

  const defaultIsEqual = (aArray, bArray) =>
    aArray === bArray ||
    (Array.isArray(aArray) &&
      Array.isArray(bArray) &&
      aArray.length === bArray.length &&
      !aArray.some((a, index) => a !== bArray[index]));

  /* eslint-disable no-shadow */

  // This is a port of useFieldArray from react-final-form-arrays
  // Compare to/reference:
  // - react-final-form-arrays/src/useFieldArray.js
  // - react-final-form-arrays/src/FieldArray.js

  const all$1 = finalForm.fieldSubscriptionItems.reduce((result, key) => {
    result[key] = true;
    return result
  }, {});

  const useFieldArray = (
    name,
    config = {},
  ) => {
    const {
      subscription = all$1,
      defaultValue,
      initialValue,
      isEqual = defaultIsEqual,
      validate: validateProp
    } = config;

    const form = useForm$1();

    const formMutators = form.mutators;
    const hasMutators = !!(formMutators && formMutators.push && formMutators.pop);
    if (!hasMutators) {
      throw new Error(
        'Array mutators not found. You need to provide the mutators from final-form-arrays to your form'
      )
    }
    const mutators =
      // curry the field name onto all mutator calls
      Object.keys(formMutators).reduce((result, key) => {
        result[key] = (...args) => formMutators[key](name, ...args);
        return result
      }, {});

    // https://final-form.org/docs/final-form/types/FieldConfig#getvalidator
    const validate = (value, allValues, meta) => {
      if (!validateProp) return undefined
      const error = validateProp(value, allValues, meta);
      if (!error || Array.isArray(error)) {
        return error
      } else {
        const arrayError = [];
        ((arrayError))[finalForm.ARRAY_ERROR] = error;
        return arrayError
      }
    };

    const field = useField(
      name,
      {
        subscription: {
          ...subscription,
          length: true
        },
        defaultValue,
        initialValue,
        isEqual,
        validate,
        format: v => v
      }
    );

    const fieldsStore = derived(
      field,
      $field => {
        const {
          input,
          meta: origMeta,
        } = $field;

        const {
          length,
          error,
          invalid,
          valid,
        } = origMeta;
        // Only include the meta props that are actually useful. Some props of origMeta, such as active, don't really apply to array fields. See https://codesandbox.io/s/react-final-form-field-arrays-forked-7nire?file=/index.js
        const meta = {
          length,
          error,
          invalid,
          valid,
        };

        // This allows us to "use" the field array (and get meta about it) without incurring the cost of
        // iteration unless we actually want to iterate.
        const forEach = (iterator) => {
          const len = length || 0;
          for (let i = 0; i < len; i++) {
            iterator(`${name}[${i}]`, i);
          }
        };

        const map = (iterator) => {
          const len = length || 0;
          const results = [];
          for (let i = 0; i < len; i++) {
            results.push(iterator(`${name}[${i}]`, i));
          }
          return results
        };

        const fields = {
          name,
          forEach,
          length: meta.length || 0,
          map,
          ...mutators,
          // ...fieldState,
          // value: input.value,
          value: input.value,

          // Needs to be an array so that we can use {#each}
          // fields.names = () => ['a', 'b']
          names: () => map((name, _i) => name),
        };

        console.log(`FieldArray fieldState for ${name}:`, fields.names());
        return {
          fields,
          meta,
        }
      }
    );
    return fieldsStore
  };

  /* src/arrays/FieldArray.svelte generated by Svelte v3.29.0 */

  const get_default_slot_changes$2 = dirty => ({
  	fields: dirty & /*fields*/ 1,
  	meta: dirty & /*meta*/ 2
  });

  const get_default_slot_context$2 = ctx => ({
  	fields: /*fields*/ ctx[0],
  	meta: /*meta*/ ctx[1]
  });

  function create_fragment$2(ctx) {
  	let current;
  	const default_slot_template = /*#slots*/ ctx[10].default;
  	const default_slot = internal.create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context$2);

  	return {
  		c() {
  			if (default_slot) default_slot.c();
  		},
  		m(target, anchor) {
  			if (default_slot) {
  				default_slot.m(target, anchor);
  			}

  			current = true;
  		},
  		p(ctx, [dirty]) {
  			if (default_slot) {
  				if (default_slot.p && dirty & /*$$scope, fields, meta*/ 515) {
  					internal.update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes$2, get_default_slot_context$2);
  				}
  			}
  		},
  		i(local) {
  			if (current) return;
  			internal.transition_in(default_slot, local);
  			current = true;
  		},
  		o(local) {
  			internal.transition_out(default_slot, local);
  			current = false;
  		},
  		d(detaching) {
  			if (default_slot) default_slot.d(detaching);
  		}
  	};
  }

  function instance$2($$self, $$props, $$invalidate) {
  	const omit_props_names = ["name","subscription","defaultValue","initialValue","isEqual","validate"];
  	let $$restProps = internal.compute_rest_props($$props, omit_props_names);
  	let $fieldsStore;
  	let { $$slots: slots = {}, $$scope } = $$props;
  	let { name } = $$props;
  	let { subscription = undefined } = $$props;
  	let { defaultValue } = $$props;
  	let { initialValue } = $$props;
  	let { isEqual = undefined } = $$props;
  	let { validate } = $$props;

  	const fieldsStore = useFieldArray(name, {
  		subscription,
  		defaultValue,
  		initialValue,
  		isEqual,
  		validate,
  		...$$restProps
  	});

  	internal.component_subscribe($$self, fieldsStore, value => $$invalidate(11, $fieldsStore = value));
  	let fields, meta;

  	$$self.$$set = $$new_props => {
  		$$props = internal.assign(internal.assign({}, $$props), internal.exclude_internal_props($$new_props));
  		$$invalidate(12, $$restProps = internal.compute_rest_props($$props, omit_props_names));
  		if ("name" in $$new_props) $$invalidate(3, name = $$new_props.name);
  		if ("subscription" in $$new_props) $$invalidate(4, subscription = $$new_props.subscription);
  		if ("defaultValue" in $$new_props) $$invalidate(5, defaultValue = $$new_props.defaultValue);
  		if ("initialValue" in $$new_props) $$invalidate(6, initialValue = $$new_props.initialValue);
  		if ("isEqual" in $$new_props) $$invalidate(7, isEqual = $$new_props.isEqual);
  		if ("validate" in $$new_props) $$invalidate(8, validate = $$new_props.validate);
  		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
  	};

  	$$self.$$.update = () => {
  		if ($$self.$$.dirty & /*$fieldsStore*/ 2048) {
  			 $$invalidate(0, { fields, meta } = $fieldsStore, fields, ($$invalidate(1, meta), $$invalidate(11, $fieldsStore)));
  		}
  	};

  	return [
  		fields,
  		meta,
  		fieldsStore,
  		name,
  		subscription,
  		defaultValue,
  		initialValue,
  		isEqual,
  		validate,
  		$$scope,
  		slots
  	];
  }

  class FieldArray extends internal.SvelteComponent {
  	constructor(options) {
  		super();

  		internal.init(this, options, instance$2, create_fragment$2, internal.safe_not_equal, {
  			name: 3,
  			subscription: 4,
  			defaultValue: 5,
  			initialValue: 6,
  			isEqual: 7,
  			validate: 8
  		});
  	}
  }

  exports.Field = Field;
  exports.FieldArray = FieldArray;
  exports.Form = Form;
  exports.allSubscription = allSubscription;
  exports.contextKey = key;
  exports.createForm = useForm;
  exports.createFormContext = createFormContext;
  exports.getFormContext = getFormContext;
  exports.useField = useField;
  exports.useFieldArray = useFieldArray;
  exports.useForm = useForm$1;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
