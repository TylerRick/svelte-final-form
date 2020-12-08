import { setContext, getContext } from 'svelte';
import { formSubscriptionItems, createForm as createForm$1, fieldSubscriptionItems, ARRAY_ERROR } from 'final-form';
import { SvelteComponent, init, safe_not_equal as safe_not_equal$1, create_slot, update_slot, transition_in, transition_out, compute_rest_props, component_subscribe, assign, exclude_internal_props, empty, insert, group_outros, check_outros, detach, bubble, create_component, mount_component, get_spread_update, get_spread_object, destroy_component, add_flush_callback, binding_callbacks, bind, element, set_attributes, select_options, listen, is_function as is_function$1, run_all as run_all$1, noop as noop$1 } from 'svelte/internal';

const key = {};

// Simple setter/getter

const setForm = context => {
  setContext(key, context);
};

// Just a simple wrapper for getContext(key), in order to provide a single, easy [entrypoint] for any component/consumer needing to get this context value
// TODO: ... in order to provide an API matching react-final-form
// for those migrating from it.
// react-final-form is inconsistent:
// - createForm (which simply gets) is very unlike useField (which subscribes); therefore we rename it to getForm in this library to be internally consistent
// - Field is simply a trivial wrapper for useField
// - but Form is not simply a wrapper for createForm!!! in this library, it is!
// Also: useWhatever seems to be a svelte convention for returning a "whatever" store that you can subscribe to
const getForm = () => {
  const form = getContext(key);

  if (!form) {
    throw new Error(
      "Could not find svelte-final-form context value. Please ensure that your Field is inside the Form component (or that you have used createForm directly).",
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

function whenValueChanges(init, callback, isEqual = (a, b) => a === b) {
  let prev = init;
  return (value) => {
    // console.log('whenValueChanges:', prev, "?==", value, !isEqual(prev, value))
    if (!isEqual(prev, value)) {
      callback(value);
      prev = value;
    }
  };
}

// Based on:

/**
 * Returns a store containing the form state
 * @param {config} param0 
 */
const useFormState = ({
  onChange = undefined,
  subscription = all,
} = {}) => {
  const form = getForm();
  const state = readable({}, set => {
    let unsubscribe;

    const subscriber = (formState) => {
      // Docs: https://final-form.org/docs/final-form/types/FormState
      onChange && onChange(formState);
      set(formState);
    };

    // Docs: https://final-form.org/docs/final-form/types/FormApi#subscribe
    unsubscribe = form.subscribe(subscriber, subscription);

    const unsubscriptions = [
      unsubscribe,

    ];
    return () => {
      form.pauseValidation(); // pause validation so we don't revalidate on every field deregistration
      unsubscriptions.reverse().forEach(unsubscribe => unsubscribe());
    }
  });

  // TODO:
  // const lazyState = {}
  // addLazyFormState(lazyState, state)

  return state
};

// Creates *and subscribes to!!* a final-form form.

const all = formSubscriptionItems.reduce((result, key) => {
  result[key] = true;
  return result
}, {});

/**
 * @param {*} param0 
 * @returns [form, state]. state is a store.
 */
const createForm = ({
  decorators = [],
  subscription = all,
  initialValues,
  ...restProps
}) => {
  // Docs: https://final-form.org/docs/final-form/api#createform
  // Docs: https://final-form.org/docs/final-form/types/Config
  const form = createForm$1({
    initialValues,
    ...restProps
  });
  setForm(form);

  // Subscribe to form's state
  const stateStore = useFormState(subscription);

  // Wrap the state store so that we can use its unsubscribe callback to unsubscribe all decorators.
  const state = readable(undefined, set => {
    const unsubscriptions = [
      // Pass through the main state store
      stateStore.subscribe(value => set(value)),

      ...decorators.map(decorator =>
        decorator(form)
      )
    ];

    return () => {
      form.pauseValidation(); // Pause validation so we don't revalidate on every field deregistration
      unsubscriptions.reverse().forEach(unsubscribe => unsubscribe());
    }
  });

  return [form, state]
};

const getSelectedValues = options => {
  const result = [];
  if (options) {
    for (let index = 0; index < options.length; index++) {
      const option = options[index];
      if (option.selected) {
        result.push(option.value);
      }
    }
  }
  return result
};

const getValue = (
  event,
  currentValue,
  valueProp,
) => {
  const { target: { type, value, checked } } = event;
  switch (type) {
    case 'checkbox':
      if (valueProp !== undefined) {
        // we are maintaining an array, not just a boolean
        if (checked) {
          // add value to current array value
          return Array.isArray(currentValue)
            ? currentValue.concat(valueProp)
            : [valueProp]
        } else {
          // remove value from current array value
          if (!Array.isArray(currentValue)) {
            return currentValue
          }
          const index = currentValue.indexOf(valueProp);
          if (index < 0) {
            return currentValue
          } else {
            return currentValue
              .slice(0, index)
              .concat(currentValue.slice(index + 1))
          }
        }
      } else {
        // it's just a boolean
        return !!checked
      }
    case 'select-multiple':
      return getSelectedValues(event.target.options)
    default:
      return value
  }
};

// TODO: import { addLazyFieldMetaState } from './getters'

const all$1 = fieldSubscriptionItems.reduce((result, key) => {
  result[key] = true;
  return result
}, {});

const defaultFormat = (value) => value === undefined ? '' : value;
const defaultParse = (value) => value === '' ? undefined : value;

// const defaultIsEqual = (a, b) => a === b

/**
 * Caveat: you can't change config after you've subscribed to the field using useField.
 * If you need a dynamic validate behavior, you have to extract the dynamicness out to a function, and statically pass that same function as the initial and immutable value of validate.
 * Example:
 *   $: maybeRequired = (value) => isRequired && required(value)
 * TODO: does react-final-form's field-level validate have the same limitation? seems like it would because registerField only called once with the initial value for validate.
 * TODO: demonstrate in example
 * @param {*} name 
 * @param {*} config 
 */
const useField = (
  name,
  config = {},
) => {
  // Docs: https://final-form.org/docs/react-final-form/types/FieldProps
  const {
    // TODO: use all these options that react-final-form has:
    // afterSubmit,
    allowNull,
    component,
    // data,
    // defaultValue,
    format = defaultFormat,
    formatOnBlur,
    // initialValue,
    multiple,
    parse = defaultParse,
    subscription = all$1,
    type,
    // validateFields,
    value: staticValue,  // Static value used for 'checkbox' and 'radio'

    validate,

    // TODO: rename to idFromName (boolean or function)
    setIdToName,
    // TODO: rename to idFrom
    // eslint-disable-next-line no-shadow
    getId = setIdToName ? ({ name }) => name : undefined,
    ...restProps  // Passed through to field.input
  } = config;

  if (!name) {
    throw new Error('useField: name cannot be undefined')
  }
  if (type === 'radio' && staticValue === undefined) {
    throw new Error('useField: for type="radio", value cannot be undefined')
  }

  const form = getForm();

  let store = readable({}, set => {
    let unsubscribe;

    const subscriber = (state) => {
      // Docs: https://final-form.org/docs/final-form/types/FieldState
      const {
        blur,
        change,
        focus,
        // eslint-disable-next-line no-shadow
        name,
        value,
        ...meta
      } = state;
      // console.log(`useField: new state for ${name}`, state)

      // This allows us to more easily pass <label for={id}> so that we don't have to do extra work or disable this warning:
      //   <!-- svelte-ignore a11y-label-has-associated-control -->
      const id = restProps.id !== undefined
        ? restProps.id
        : getId ? getId(state) : undefined;

      const input = {
        ...restProps,
        name,
        id,
        get value() {
          let formattedValue = value;
          if (formatOnBlur) {
            if (component === 'input') {
              formattedValue = defaultFormat(formattedValue);
            }
          } else {
            formattedValue = format(formattedValue, name);
          }
          if (formattedValue === null && !allowNull) {
            formattedValue = '';
          }
          if (type === 'checkbox' || type === 'radio') {
            return staticValue
          } else if (component === 'select' && multiple) {
            return formattedValue || []
          }
          return formattedValue
        },
        get checked() {
          if (type === 'checkbox') {
            if (staticValue === undefined) {
              return !!state.value
            } else {
              return !!(Array.isArray(state.value) && ~state.value.indexOf(staticValue))
            }
          } else if (type === 'radio') {
            return state.value === staticValue
          }
          return undefined
        },
      };
      if (multiple) {
        input.multiple = multiple;
      }
      if (type !== undefined) {
        input.type = type;
      }

      const handlers = {
        blur,
        focus,
        change: (event) => {
          // eslint-disable-next-line no-shadow
          const value = event && event.target
            ? getValue(event, state.value, staticValue)
            : event;
          change(parse(value, name));
        },
      };
      set({
        config,
        input,
        handlers,
        meta,
        state,
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
        getValidator: () => {
          // console.log(`getValidator for ${name}:`, validate)
          return validate
        },
      },
    );

    return () => {
      unsubscribe();
    }
  });


  store = Object.assign(store, {
    config: derived(store, $store => $store.config),
    input: derived(store, $store => $store.input),
    handlers: derived(store, $store => $store.handlers),
    meta: derived(store, $store => $store.meta),
    state: derived(store, $store => $store.state),
  });
  return store
};

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

/* src/Form.svelte generated by Svelte v3.29.0 */
const get_default_slot_changes = dirty => ({ state: dirty & /*$state*/ 1 });

const get_default_slot_context = ctx => ({
	form: /*form*/ ctx[1],
	state: /*$state*/ ctx[0]
});

function create_fragment(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[8].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context);

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
				if (default_slot.p && dirty & /*$$scope, $state*/ 129) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, get_default_slot_changes, get_default_slot_context);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	const omit_props_names = ["subscription","initialValues","initialValuesEqual","keepDirtyOnReinitialize"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let $state;
	let { $$slots: slots = {}, $$scope } = $$props;
	let { subscription = undefined } = $$props;
	let { initialValues = undefined } = $$props;
	let { initialValuesEqual = shallowEqual } = $$props;
	let { keepDirtyOnReinitialize = undefined } = $$props;

	const [form, state] = createForm({
		subscription,
		initialValues,
		keepDirtyOnReinitialize,
		...$$restProps
	});

	component_subscribe($$self, state, value => $$invalidate(0, $state = value));

	// TODO: Add more whenValueChanges calls for all config options like in react-final-form/src/ReactFinalForm.js
	const whenInitialValuesChanges = whenValueChanges(initialValues, () => form.setConfig("initialValues", initialValues), initialValuesEqual);

	const whenKeepDirtyOnReinitializeChanges = whenValueChanges(keepDirtyOnReinitialize, () => form.setConfig("keepDirtyOnReinitialize", keepDirtyOnReinitialize));

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
		if ("subscription" in $$new_props) $$invalidate(3, subscription = $$new_props.subscription);
		if ("initialValues" in $$new_props) $$invalidate(4, initialValues = $$new_props.initialValues);
		if ("initialValuesEqual" in $$new_props) $$invalidate(5, initialValuesEqual = $$new_props.initialValuesEqual);
		if ("keepDirtyOnReinitialize" in $$new_props) $$invalidate(6, keepDirtyOnReinitialize = $$new_props.keepDirtyOnReinitialize);
		if ("$$scope" in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*initialValues*/ 16) {
			 whenInitialValuesChanges(initialValues);
		}

		if ($$self.$$.dirty & /*keepDirtyOnReinitialize*/ 64) {
			 whenKeepDirtyOnReinitializeChanges(keepDirtyOnReinitialize);
		}
	};

	return [
		$state,
		form,
		state,
		subscription,
		initialValues,
		initialValuesEqual,
		keepDirtyOnReinitialize,
		$$scope,
		slots
	];
}

class Form extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance, create_fragment, safe_not_equal$1, {
			subscription: 3,
			initialValues: 4,
			initialValuesEqual: 5,
			keepDirtyOnReinitialize: 6
		});
	}
}

/* src/FormSpy.svelte generated by Svelte v3.29.0 */
const get_default_slot_changes$1 = dirty => ({ state: dirty & /*$state*/ 1 });

const get_default_slot_context$1 = ctx => ({
	form: /*form*/ ctx[1],
	state: /*$state*/ ctx[0]
});

function create_fragment$1(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[8].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$1);

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
				if (default_slot.p && dirty & /*$$scope, $state*/ 129) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$1, get_default_slot_context$1);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	const omit_props_names = ["subscription","initialValues","initialValuesEqual","keepDirtyOnReinitialize"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let $state;
	let { $$slots: slots = {}, $$scope } = $$props;
	let { subscription = undefined } = $$props;
	let { initialValues = undefined } = $$props;
	let { initialValuesEqual = shallowEqual } = $$props;
	let { keepDirtyOnReinitialize = undefined } = $$props;
	const form = getForm();

	const state = useFormState({
		subscription,
		initialValues,
		keepDirtyOnReinitialize,
		...$$restProps
	});

	component_subscribe($$self, state, value => $$invalidate(0, $state = value));

	// TODO: Add more whenValueChanges calls for all config options like in react-final-form/src/ReactFinalForm.js
	const whenInitialValuesChanges = whenValueChanges(initialValues, () => form.setConfig("initialValues", initialValues), initialValuesEqual);

	const whenKeepDirtyOnReinitializeChanges = whenValueChanges(keepDirtyOnReinitialize, () => form.setConfig("keepDirtyOnReinitialize", keepDirtyOnReinitialize));

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
		if ("subscription" in $$new_props) $$invalidate(3, subscription = $$new_props.subscription);
		if ("initialValues" in $$new_props) $$invalidate(4, initialValues = $$new_props.initialValues);
		if ("initialValuesEqual" in $$new_props) $$invalidate(5, initialValuesEqual = $$new_props.initialValuesEqual);
		if ("keepDirtyOnReinitialize" in $$new_props) $$invalidate(6, keepDirtyOnReinitialize = $$new_props.keepDirtyOnReinitialize);
		if ("$$scope" in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*initialValues*/ 16) {
			 whenInitialValuesChanges(initialValues);
		}

		if ($$self.$$.dirty & /*keepDirtyOnReinitialize*/ 64) {
			 whenKeepDirtyOnReinitializeChanges(keepDirtyOnReinitialize);
		}
	};

	return [
		$state,
		form,
		state,
		subscription,
		initialValues,
		initialValuesEqual,
		keepDirtyOnReinitialize,
		$$scope,
		slots
	];
}

class FormSpy extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$1, create_fragment$1, safe_not_equal$1, {
			subscription: 3,
			initialValues: 4,
			initialValuesEqual: 5,
			keepDirtyOnReinitialize: 6
		});
	}
}

/* src/Field.svelte generated by Svelte v3.29.0 */
const get_default_slot_changes_2 = dirty => ({ field: dirty & /*field*/ 4 });
const get_default_slot_context_2 = ctx => ({ field: /*field*/ ctx[2] });
const get_default_slot_changes_1 = dirty => ({ field: dirty & /*field*/ 4 });
const get_default_slot_context_1 = ctx => ({ field: /*field*/ ctx[2] });
const get_component_slot_changes = dirty => ({ field: dirty & /*field*/ 4 });
const get_component_slot_context = ctx => ({ field: /*field*/ ctx[2] });
const get_default_slot_changes$2 = dirty => ({ field: dirty & /*field*/ 4 });
const get_default_slot_context$2 = ctx => ({ field: /*field*/ ctx[2] });

// (48:0) {:else}
function create_else_block(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[8].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], get_default_slot_context_2);

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
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope, field*/ 524292) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[19], dirty, get_default_slot_changes_2, get_default_slot_context_2);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};
}

// (46:20) 
function create_if_block_2(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;
	const switch_instance_spread_levels = [{ field: /*field*/ ctx[2] }, /*$$restProps*/ ctx[4]];
	var switch_value = /*component*/ ctx[1];

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return { props: switch_instance_props };
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props());
	}

	return {
		c() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert(target, switch_instance_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const switch_instance_changes = (dirty & /*field, $$restProps*/ 20)
			? get_spread_update(switch_instance_spread_levels, [
					dirty & /*field*/ 4 && { field: /*field*/ ctx[2] },
					dirty & /*$$restProps*/ 16 && get_spread_object(/*$$restProps*/ ctx[4])
				])
			: {};

			if (switch_value !== (switch_value = /*component*/ ctx[1])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

// (34:33) 
function create_if_block_1(ctx) {
	let current;
	const component_slot_template = /*#slots*/ ctx[8].component;
	const component_slot = create_slot(component_slot_template, ctx, /*$$scope*/ ctx[19], get_component_slot_context);
	const component_slot_or_fallback = component_slot || fallback_block_1(ctx);

	return {
		c() {
			if (component_slot_or_fallback) component_slot_or_fallback.c();
		},
		m(target, anchor) {
			if (component_slot_or_fallback) {
				component_slot_or_fallback.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (component_slot) {
				if (component_slot.p && dirty & /*$$scope, field*/ 524292) {
					update_slot(component_slot, component_slot_template, ctx, /*$$scope*/ ctx[19], dirty, get_component_slot_changes, get_component_slot_context);
				}
			} else {
				if (component_slot_or_fallback && component_slot_or_fallback.p && dirty & /*component, field, $$restProps, element, $$scope*/ 524311) {
					component_slot_or_fallback.p(ctx, dirty);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(component_slot_or_fallback, local);
			current = true;
		},
		o(local) {
			transition_out(component_slot_or_fallback, local);
			current = false;
		},
		d(detaching) {
			if (component_slot_or_fallback) component_slot_or_fallback.d(detaching);
		}
	};
}

// (24:0) {#if component === 'input' || component === 'textarea'}
function create_if_block(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[8].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], get_default_slot_context$2);
	const default_slot_or_fallback = default_slot || fallback_block(ctx);

	return {
		c() {
			if (default_slot_or_fallback) default_slot_or_fallback.c();
		},
		m(target, anchor) {
			if (default_slot_or_fallback) {
				default_slot_or_fallback.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope, field*/ 524292) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[19], dirty, get_default_slot_changes$2, get_default_slot_context$2);
				}
			} else {
				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*component, field, $$restProps, element*/ 23) {
					default_slot_or_fallback.p(ctx, dirty);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot_or_fallback, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot_or_fallback, local);
			current = false;
		},
		d(detaching) {
			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
		}
	};
}

// (36:4) <Input       {component}       {field}       {...$$restProps}       on:input on:change on:focus on:blur       bind:element     >
function create_default_slot(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[8].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], get_default_slot_context_1);

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
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope, field*/ 524292) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[19], dirty, get_default_slot_changes_1, get_default_slot_context_1);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};
}

// (35:33)      
function fallback_block_1(ctx) {
	let input;
	let updating_element;
	let current;

	const input_spread_levels = [
		{ component: /*component*/ ctx[1] },
		{ field: /*field*/ ctx[2] },
		/*$$restProps*/ ctx[4]
	];

	function input_element_binding_1(value) {
		/*input_element_binding_1*/ ctx[14].call(null, value);
	}

	let input_props = {
		$$slots: { default: [create_default_slot] },
		$$scope: { ctx }
	};

	for (let i = 0; i < input_spread_levels.length; i += 1) {
		input_props = assign(input_props, input_spread_levels[i]);
	}

	if (/*element*/ ctx[0] !== void 0) {
		input_props.element = /*element*/ ctx[0];
	}

	input = new Input({ props: input_props });
	binding_callbacks.push(() => bind(input, "element", input_element_binding_1));
	input.$on("input", /*input_handler_1*/ ctx[15]);
	input.$on("change", /*change_handler_1*/ ctx[16]);
	input.$on("focus", /*focus_handler_1*/ ctx[17]);
	input.$on("blur", /*blur_handler_1*/ ctx[18]);

	return {
		c() {
			create_component(input.$$.fragment);
		},
		m(target, anchor) {
			mount_component(input, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const input_changes = (dirty & /*component, field, $$restProps*/ 22)
			? get_spread_update(input_spread_levels, [
					dirty & /*component*/ 2 && { component: /*component*/ ctx[1] },
					dirty & /*field*/ 4 && { field: /*field*/ ctx[2] },
					dirty & /*$$restProps*/ 16 && get_spread_object(/*$$restProps*/ ctx[4])
				])
			: {};

			if (dirty & /*$$scope, field*/ 524292) {
				input_changes.$$scope = { dirty, ctx };
			}

			if (!updating_element && dirty & /*element*/ 1) {
				updating_element = true;
				input_changes.element = /*element*/ ctx[0];
				add_flush_callback(() => updating_element = false);
			}

			input.$set(input_changes);
		},
		i(local) {
			if (current) return;
			transition_in(input.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(input.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(input, detaching);
		}
	};
}

// (25:16)      
function fallback_block(ctx) {
	let input;
	let updating_element;
	let current;

	const input_spread_levels = [
		{ component: /*component*/ ctx[1] },
		{ field: /*field*/ ctx[2] },
		/*$$restProps*/ ctx[4]
	];

	function input_element_binding(value) {
		/*input_element_binding*/ ctx[9].call(null, value);
	}

	let input_props = {};

	for (let i = 0; i < input_spread_levels.length; i += 1) {
		input_props = assign(input_props, input_spread_levels[i]);
	}

	if (/*element*/ ctx[0] !== void 0) {
		input_props.element = /*element*/ ctx[0];
	}

	input = new Input({ props: input_props });
	binding_callbacks.push(() => bind(input, "element", input_element_binding));
	input.$on("input", /*input_handler*/ ctx[10]);
	input.$on("change", /*change_handler*/ ctx[11]);
	input.$on("focus", /*focus_handler*/ ctx[12]);
	input.$on("blur", /*blur_handler*/ ctx[13]);

	return {
		c() {
			create_component(input.$$.fragment);
		},
		m(target, anchor) {
			mount_component(input, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const input_changes = (dirty & /*component, field, $$restProps*/ 22)
			? get_spread_update(input_spread_levels, [
					dirty & /*component*/ 2 && { component: /*component*/ ctx[1] },
					dirty & /*field*/ 4 && { field: /*field*/ ctx[2] },
					dirty & /*$$restProps*/ 16 && get_spread_object(/*$$restProps*/ ctx[4])
				])
			: {};

			if (!updating_element && dirty & /*element*/ 1) {
				updating_element = true;
				input_changes.element = /*element*/ ctx[0];
				add_flush_callback(() => updating_element = false);
			}

			input.$set(input_changes);
		},
		i(local) {
			if (current) return;
			transition_in(input.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(input.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(input, detaching);
		}
	};
}

function create_fragment$2(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*component*/ ctx[1] === "input" || /*component*/ ctx[1] === "textarea") return 0;
		if (/*component*/ ctx[1] === "select") return 1;
		if (/*component*/ ctx[1]) return 2;
		return 3;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	const omit_props_names = ["name","subscription","validate","component","element"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let $fieldStore;
	let { $$slots: slots = {}, $$scope } = $$props;
	let { name } = $$props;
	let { subscription = undefined } = $$props;
	let { validate = undefined } = $$props;
	let { component = "input" } = $$props;
	let { element = undefined } = $$props;

	// console.log('Field', name, $$restProps)
	const fieldStore = useField(name, {
		subscription,
		validate,
		component,
		...$$restProps
	});

	component_subscribe($$self, fieldStore, value => $$invalidate(20, $fieldStore = value));

	function input_element_binding(value) {
		element = value;
		$$invalidate(0, element);
	}

	function input_handler(event) {
		bubble($$self, event);
	}

	function change_handler(event) {
		bubble($$self, event);
	}

	function focus_handler(event) {
		bubble($$self, event);
	}

	function blur_handler(event) {
		bubble($$self, event);
	}

	function input_element_binding_1(value) {
		element = value;
		$$invalidate(0, element);
	}

	function input_handler_1(event) {
		bubble($$self, event);
	}

	function change_handler_1(event) {
		bubble($$self, event);
	}

	function focus_handler_1(event) {
		bubble($$self, event);
	}

	function blur_handler_1(event) {
		bubble($$self, event);
	}

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(4, $$restProps = compute_rest_props($$props, omit_props_names));
		if ("name" in $$new_props) $$invalidate(5, name = $$new_props.name);
		if ("subscription" in $$new_props) $$invalidate(6, subscription = $$new_props.subscription);
		if ("validate" in $$new_props) $$invalidate(7, validate = $$new_props.validate);
		if ("component" in $$new_props) $$invalidate(1, component = $$new_props.component);
		if ("element" in $$new_props) $$invalidate(0, element = $$new_props.element);
		if ("$$scope" in $$new_props) $$invalidate(19, $$scope = $$new_props.$$scope);
	};

	let field;

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$fieldStore*/ 1048576) {
			 $$invalidate(2, field = $fieldStore);
		}
	};

	return [
		element,
		component,
		field,
		fieldStore,
		$$restProps,
		name,
		subscription,
		validate,
		slots,
		input_element_binding,
		input_handler,
		change_handler,
		focus_handler,
		blur_handler,
		input_element_binding_1,
		input_handler_1,
		change_handler_1,
		focus_handler_1,
		blur_handler_1,
		$$scope
	];
}

class Field extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$2, create_fragment$2, safe_not_equal$1, {
			name: 5,
			subscription: 6,
			validate: 7,
			component: 1,
			element: 0
		});
	}
}

/* src/Input.svelte generated by Svelte v3.29.0 */

const get_default_slot_changes$3 = dirty => ({ field: dirty & /*field*/ 2 });
const get_default_slot_context$3 = ctx => ({ field: /*field*/ ctx[1] });

// (38:33) 
function create_if_block_2$1(ctx) {
	let select;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[7].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], get_default_slot_context$3);
	let select_levels = [/*$$restProps*/ ctx[5], /*input*/ ctx[3]];
	let select_data = {};

	for (let i = 0; i < select_levels.length; i += 1) {
		select_data = assign(select_data, select_levels[i]);
	}

	return {
		c() {
			select = element("select");
			if (default_slot) default_slot.c();
			set_attributes(select, select_data);
		},
		m(target, anchor) {
			insert(target, select, anchor);

			if (default_slot) {
				default_slot.m(select, null);
			}

			if (select_data.multiple) select_options(select, select_data.value);
			/*select_binding*/ ctx[16](select);
			current = true;

			if (!mounted) {
				dispose = [
					listen(select, "blur", function () {
						if (is_function$1(/*handlers*/ ctx[4].blur)) /*handlers*/ ctx[4].blur.apply(this, arguments);
					}),
					listen(select, "focus", function () {
						if (is_function$1(/*handlers*/ ctx[4].focus)) /*handlers*/ ctx[4].focus.apply(this, arguments);
					}),
					listen(select, "input", function () {
						if (is_function$1(/*handlers*/ ctx[4].change)) /*handlers*/ ctx[4].change.apply(this, arguments);
					}),
					listen(select, "input", /*input_handler_2*/ ctx[12]),
					listen(select, "change", /*change_handler_2*/ ctx[13])
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope, field*/ 66) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, get_default_slot_changes$3, get_default_slot_context$3);
				}
			}

			set_attributes(select, select_data = get_spread_update(select_levels, [
				dirty & /*$$restProps*/ 32 && /*$$restProps*/ ctx[5],
				dirty & /*input*/ 8 && /*input*/ ctx[3]
			]));

			if (dirty & /*$$restProps, input*/ 40 && select_data.multiple) select_options(select, select_data.value);
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(select);
			if (default_slot) default_slot.d(detaching);
			/*select_binding*/ ctx[16](null);
			mounted = false;
			run_all$1(dispose);
		}
	};
}

// (27:35) 
function create_if_block_1$1(ctx) {
	let textarea;
	let mounted;
	let dispose;
	let textarea_levels = [/*input*/ ctx[3], /*$$restProps*/ ctx[5]];
	let textarea_data = {};

	for (let i = 0; i < textarea_levels.length; i += 1) {
		textarea_data = assign(textarea_data, textarea_levels[i]);
	}

	return {
		c() {
			textarea = element("textarea");
			set_attributes(textarea, textarea_data);
		},
		m(target, anchor) {
			insert(target, textarea, anchor);
			/*textarea_binding*/ ctx[15](textarea);

			if (!mounted) {
				dispose = [
					listen(textarea, "blur", function () {
						if (is_function$1(/*handlers*/ ctx[4].blur)) /*handlers*/ ctx[4].blur.apply(this, arguments);
					}),
					listen(textarea, "focus", function () {
						if (is_function$1(/*handlers*/ ctx[4].focus)) /*handlers*/ ctx[4].focus.apply(this, arguments);
					}),
					listen(textarea, "input", function () {
						if (is_function$1(/*handlers*/ ctx[4].change)) /*handlers*/ ctx[4].change.apply(this, arguments);
					}),
					listen(textarea, "input", /*input_handler_1*/ ctx[10]),
					listen(textarea, "change", /*change_handler_1*/ ctx[11])
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			set_attributes(textarea, textarea_data = get_spread_update(textarea_levels, [
				dirty & /*input*/ 8 && /*input*/ ctx[3],
				dirty & /*$$restProps*/ 32 && /*$$restProps*/ ctx[5]
			]));
		},
		i: noop$1,
		o: noop$1,
		d(detaching) {
			if (detaching) detach(textarea);
			/*textarea_binding*/ ctx[15](null);
			mounted = false;
			run_all$1(dispose);
		}
	};
}

// (16:0) {#if component === 'input'}
function create_if_block$1(ctx) {
	let input_1;
	let mounted;
	let dispose;
	let input_1_levels = [/*input*/ ctx[3], /*$$restProps*/ ctx[5]];
	let input_1_data = {};

	for (let i = 0; i < input_1_levels.length; i += 1) {
		input_1_data = assign(input_1_data, input_1_levels[i]);
	}

	return {
		c() {
			input_1 = element("input");
			set_attributes(input_1, input_1_data);
		},
		m(target, anchor) {
			insert(target, input_1, anchor);
			/*input_1_binding*/ ctx[14](input_1);

			if (!mounted) {
				dispose = [
					listen(input_1, "blur", function () {
						if (is_function$1(/*handlers*/ ctx[4].blur)) /*handlers*/ ctx[4].blur.apply(this, arguments);
					}),
					listen(input_1, "focus", function () {
						if (is_function$1(/*handlers*/ ctx[4].focus)) /*handlers*/ ctx[4].focus.apply(this, arguments);
					}),
					listen(input_1, "input", function () {
						if (is_function$1(/*handlers*/ ctx[4].change)) /*handlers*/ ctx[4].change.apply(this, arguments);
					}),
					listen(input_1, "input", /*input_handler*/ ctx[8]),
					listen(input_1, "change", /*change_handler*/ ctx[9])
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
				dirty & /*input*/ 8 && /*input*/ ctx[3],
				dirty & /*$$restProps*/ 32 && /*$$restProps*/ ctx[5]
			]));
		},
		i: noop$1,
		o: noop$1,
		d(detaching) {
			if (detaching) detach(input_1);
			/*input_1_binding*/ ctx[14](null);
			mounted = false;
			run_all$1(dispose);
		}
	};
}

function create_fragment$3(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$1, create_if_block_1$1, create_if_block_2$1];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*component*/ ctx[2] === "input") return 0;
		if (/*component*/ ctx[2] === "textarea") return 1;
		if (/*component*/ ctx[2] === "select") return 2;
		return -1;
	}

	if (~(current_block_type_index = select_block_type(ctx))) {
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(target, anchor);
			}

			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				} else {
					if_block = null;
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d(detaching);
			}

			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	const omit_props_names = ["field","component","element"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { field } = $$props;
	let { component = "input" } = $$props;
	let { element = undefined } = $$props;
	let input, meta, handlers;

	function input_handler(event) {
		bubble($$self, event);
	}

	function change_handler(event) {
		bubble($$self, event);
	}

	function input_handler_1(event) {
		bubble($$self, event);
	}

	function change_handler_1(event) {
		bubble($$self, event);
	}

	function input_handler_2(event) {
		bubble($$self, event);
	}

	function change_handler_2(event) {
		bubble($$self, event);
	}

	function input_1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			element = $$value;
			$$invalidate(0, element);
		});
	}

	function textarea_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			element = $$value;
			$$invalidate(0, element);
		});
	}

	function select_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			element = $$value;
			$$invalidate(0, element);
		});
	}

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
		if ("field" in $$new_props) $$invalidate(1, field = $$new_props.field);
		if ("component" in $$new_props) $$invalidate(2, component = $$new_props.component);
		if ("element" in $$new_props) $$invalidate(0, element = $$new_props.element);
		if ("$$scope" in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*field*/ 2) {
			 $$invalidate(3, { input, meta, handlers } = field, input, ($$invalidate(4, handlers), $$invalidate(1, field)));
		}
	};

	return [
		element,
		field,
		component,
		input,
		handlers,
		$$restProps,
		$$scope,
		slots,
		input_handler,
		change_handler,
		input_handler_1,
		change_handler_1,
		input_handler_2,
		change_handler_2,
		input_1_binding,
		textarea_binding,
		select_binding
	];
}

class Input extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$3, create_fragment$3, safe_not_equal$1, { field: 1, component: 2, element: 0 });
	}
}

// Based on https://github.com/devongovett/svelte-hooks/blob/master/attrs.js

// Adds listeners for the given handlers.
// use:useHandlers
function useHandlers(element, handlers) {
  let apply = (newHandlers) => {
    for (let key in newHandlers) {
      let event = key;
      let capture = false;
      if (key.endsWith('Capture')) {
        capture = true;
        event = event.slice(0, -7);
      }

      if (handlers[key] != null && (newHandlers[key] == null || newHandlers[key] !== handlers[key])) {
        element.removeEventListener(event, handlers[key], capture);
      }

      if (newHandlers[key] != null) {
        element.addEventListener(event, newHandlers[key], capture);
      }
    }
  };

  apply(handlers);

  return {
    update(newHandlers) {
      let update = {};
      for (let key in newHandlers) {
        if (newHandlers[key] != null && newHandlers[key] !== handlers[key]) {
          // The handler for a given event name has been changed to a new function.
          update[key] = newHandlers[key];
        }
      }

      for (let key in handlers) {
        if (handlers[key] != null && !(key in newHandlers)) {
          // The handler for a given event name has been removed.
          update[key] = undefined;
        }
      }

      apply(update);
      handlers = newHandlers;
    },
    destroy() {
      for (let event in handlers) {
        element.removeEventListener(event, handlers[event]);
      }
    },
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

const all$2 = fieldSubscriptionItems.reduce((result, key) => {
  result[key] = true;
  return result
}, {});

/**
 * @param {*} name 
 * @param {*} config 
 * @returns a store whose value contains {fields, meta}; It also provides separate derived fields, meta stores if you want to destructure directly as {fields, meta} = useFieldArray
 */
const useFieldArray = (
  name,
  config = {},
) => {
  const {
    subscription = all$2,
    defaultValue,
    initialValue,
    isEqual = defaultIsEqual,
    validate: validateProp
  } = config;

  const form = getForm();

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
      ((arrayError))[ARRAY_ERROR] = error;
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

  const store = derived(
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
      // TODO: that seems silly and over-optimized. Let's just make this simple and return names as an array instead of a function.
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

      // console.log(`FieldArray fieldState for ${name}:`, fields.names())
      return {
        fields,
        meta,
      }
    }
  );

  store.fields = derived(store, $store => $store.fields);
  store.meta = derived(store, $store => $store.meta);
  // TODO: Return [fields, meta] to be consistent with createForm ?
  return store
};

/* src/arrays/FieldArray.svelte generated by Svelte v3.29.0 */

const get_default_slot_changes$4 = dirty => ({
	fields: dirty & /*fields*/ 1,
	meta: dirty & /*meta*/ 2
});

const get_default_slot_context$4 = ctx => ({
	fields: /*fields*/ ctx[0],
	meta: /*meta*/ ctx[1]
});

function create_fragment$4(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[10].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context$4);

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
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes$4, get_default_slot_context$4);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function instance$4($$self, $$props, $$invalidate) {
	const omit_props_names = ["name","subscription","defaultValue","initialValue","isEqual","validate"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let $fieldsStore;
	let { $$slots: slots = {}, $$scope } = $$props;
	let { name } = $$props;
	let { subscription = undefined } = $$props;
	let { defaultValue = undefined } = $$props;
	let { initialValue = undefined } = $$props;
	let { isEqual = undefined } = $$props;
	let { validate = undefined } = $$props;

	const fieldsStore = useFieldArray(name, {
		subscription,
		defaultValue,
		initialValue,
		isEqual,
		validate,
		...$$restProps
	});

	component_subscribe($$self, fieldsStore, value => $$invalidate(11, $fieldsStore = value));
	let fields, meta;

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(12, $$restProps = compute_rest_props($$props, omit_props_names));
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

class FieldArray extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$4, create_fragment$4, safe_not_equal$1, {
			name: 3,
			subscription: 4,
			defaultValue: 5,
			initialValue: 6,
			isEqual: 7,
			validate: 8
		});
	}
}

export { Field, FieldArray, Form, FormSpy, Input, key as contextKey, createForm, all$1 as fieldAllSubscription, all as formAllSubscription, getForm, getValue, setForm, useField, useFieldArray, useFormState, useHandlers, whenValueChanges };
