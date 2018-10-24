## processanimateR 1.0.0

There are breaking changes in the API between v0.3.0 and v1.0.0. The old API was not maintainable and to avoid the list of parameters growing even more, the decision to move to a new API was made.

### Backwards incompatible changes

* TBD

### New features

* TBD

## processanimateR 0.3.0

* Added legend using d3-legend
* Added Shiny selection event handlers
* Added animation_mode `off` to support use cases without animation but selection features.
* Changed to use d3-scales to support auto generation of legends. The use of the ggplot scales is deprecated and will be removed.
* Bugfix: Play/Pause button did not work with multiple widgets on one page
* Bugfix: 0 duration animation caused issues on Firefox and Safari

## processanimateR 0.2.0

* Timeline slider
* Jitter option
* Opacity option
* Shape option
* Pass-through options to processmapR
* Re-use processmapR calculations (thanks for @gertjanssenswillen)