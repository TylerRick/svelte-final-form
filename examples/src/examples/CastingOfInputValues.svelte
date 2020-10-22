all values will be cast to strings 
if you need to use a number or boolean or other type as a value, you can work around by using bind to get the actual value
<Field bind:value={myVar} />
This appears to be a limitation of final-form ? 
can we change('field', true) or does that cast too?
