import * as all from './all'

import Simple from './Simple.svelte'
import FieldLevelValidation from './FieldLevelValidation.svelte'
import FieldLevelValidation_Conditional from './FieldLevelValidation_Conditional.svelte'
import FieldLevelValidation_ConditionalOnOtherField from './FieldLevelValidation_ConditionalOnOtherField.svelte'
import UseForm, { description } from './UseForm.svelte'
import ChangeInitialValues from './ChangeInitialValues.svelte'

import Arrays from './arrays/Arrays.svelte'
import Arrays_UseFieldArray from './arrays/Arrays_UseFieldArray.svelte'

export default {
  Simple,
  FieldLevelValidation,
  FieldLevelValidation_ConditionalOnOtherField,
  UseForm,
  ChangeInitialValues,

  Arrays,
  Arrays_UseFieldArray,
}

export const descriptions = {
  Simple: '',
  FieldLevelValidation: '',
  FieldLevelValidation_ConditionalOnOtherField: '',
  UseForm: description,
  ChangeInitialValues: '',

  Arrays: '',
  Arrays_UseFieldArray: '',
}
