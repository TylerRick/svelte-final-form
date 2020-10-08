(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('svelte/internal'), require('svelte'), require('final-form')) :
  typeof define === 'function' && define.amd ? define(['exports', 'svelte/internal', 'svelte', 'final-form'], factory) :
  (global = global || self, factory(global['svelte-final-form'] = {}, global.internal, global.svelte, global.finalForm));
}(this, (function (exports, internal, svelte, finalForm) { 'use strict';

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

  const FORM = {};

  function instance($$self, $$props, $$invalidate) {
  	const omit_props_names = ["subscription","initialValues","initialValuesEqual"];
  	let $$restProps = internal.compute_rest_props($$props, omit_props_names);
  	let { $$slots: slots = {}, $$scope } = $$props;
  	let { subscription = getFormSubscriptionItems() } = $$props;
  	let { initialValues } = $$props;
  	let { initialValuesEqual } = $$props;
  	let state = {};
  	let unsubscribe;
  	const form = finalForm.createForm({ initialValues, ...$$restProps });
  	svelte.setContext(FORM, form);

  	svelte.onMount(() => {
  		unsubscribe = form.subscribe(
  			newState => {
  				$$invalidate(0, state = newState);
  			},
  			subscription
  		);
  	});

  	svelte.onDestroy(() => {
  		unsubscribe && unsubscribe();
  	});

  	function getFormSubscriptionItems() {
  		return finalForm.formSubscriptionItems.reduce(
  			(result, key) => {
  				result[key] = true;
  				return result;
  			},
  			{}
  		);
  	}

  	const whenInitialValuesChanges = whenValueChanges(initialValues, () => form.setConfig("initialValues", initialValues), initialValuesEqual || shallowEqual);

  	$$self.$$set = $$new_props => {
  		$$props = internal.assign(internal.assign({}, $$props), internal.exclude_internal_props($$new_props));
  		$$invalidate(10, $$restProps = internal.compute_rest_props($$props, omit_props_names));
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
  	meta: dirty & /*meta*/ 1,
  	input: dirty & /*input*/ 2
  });

  const get_default_slot_context$1 = ctx => ({
  	meta: /*meta*/ ctx[0],
  	input: /*input*/ ctx[1]
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
  				if (default_slot.p && dirty & /*$$scope, meta, input*/ 67) {
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
  	let { $$slots: slots = {}, $$scope } = $$props;
  	const defaultParse = value => value === "" ? undefined : value;

  	let { name } = $$props,
  		{ subscription = getFieldSubscriptionItems() } = $$props,
  		{ validate = undefined } = $$props,
  		{ parse = defaultParse } = $$props;

  	let meta = {};
  	let input = {};
  	let unsubscribe;
  	const form = svelte.getContext(FORM);

  	if (!form) {
  		throw new Error("Could not find svelte-final-form context value. Please ensure that your Field is inside the Form component.");
  	}

  	svelte.onMount(() => {
  		unsubscribe = form.registerField(
  			name,
  			fieldState => {
  				const { blur, change, focus, value, ...fieldMeta } = fieldState;
  				$$invalidate(0, meta = fieldMeta);

  				$$invalidate(1, input = {
  					name,
  					onBlur: blur,
  					onChange: val => {
  						change(parse(val, name));
  					},
  					onFocus: focus,
  					value: value === undefined ? "" : value
  				});
  			},
  			subscription,
  			{ getValidator: () => validate }
  		);
  	});

  	svelte.onDestroy(() => {
  		unsubscribe && unsubscribe();
  	});

  	function getFieldSubscriptionItems() {
  		return finalForm.fieldSubscriptionItems.reduce(
  			(result, key) => {
  				result[key] = true;
  				return result;
  			},
  			{}
  		);
  	}

  	$$self.$$set = $$props => {
  		if ("name" in $$props) $$invalidate(2, name = $$props.name);
  		if ("subscription" in $$props) $$invalidate(3, subscription = $$props.subscription);
  		if ("validate" in $$props) $$invalidate(4, validate = $$props.validate);
  		if ("parse" in $$props) $$invalidate(5, parse = $$props.parse);
  		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
  	};

  	return [meta, input, name, subscription, validate, parse, $$scope, slots];
  }

  class Field extends internal.SvelteComponent {
  	constructor(options) {
  		super();

  		internal.init(this, options, instance$1, create_fragment$1, internal.safe_not_equal, {
  			name: 2,
  			subscription: 3,
  			validate: 4,
  			parse: 5
  		});
  	}
  }

  exports.Field = Field;
  exports.Form = Form;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
