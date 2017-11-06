# react-class-validator

A opinionated helper library for binding class-validator error messages to a react form.

See examples/wired-to-react.tsx for an example usage.

This method handles all of the following:

- 2-way binding model values to form inputs, even deeply nested objects.
- validating model on input change and passing errors to rendered inputs
- distinguishing between 'immediate' errors which should always be shown and 'non-immediate' which should appear on blur.
- all features supported by `class-validator`

## Explanation of the 'Element-Mixins' style

If you think of a JSX element literal like `<div/>` as a constructor call, then it is natural
to apply the factory pattern to this code. Unfortunately, the jsx syntax does not support things like `<Model.Input(args...) />`,
so we are forced to call that method *somewhere else* and reference the result inline in the jsx.
In many cases, this is exactly what we should do, but in the case of form inputs, there tend to be a large amount of properties
which are predictable and boring.
This leads to low cohesion and generally complex code. Instead, if we bundle up the props for a given component in an object
and pass them down using the spread (`...`) operator, we can get the best of both worlds: declarative and DRY markup.
Other attempts to solve this problem use react's context to _inject_ props deep into the component hierarchy.
This is spooky action at a distance and should be avoided whenever possible.
