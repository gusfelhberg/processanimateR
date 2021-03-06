% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/renderer.R
\name{renderer_graphviz}
\alias{renderer_graphviz}
\title{Render as a plain graph

This renderer uses viz.js to render the process map using the DOT layout.}
\usage{
renderer_graphviz()
}
\value{
A rendering function to be used with \code{\link{animate_process}}
}
\description{
Render as a plain graph

This renderer uses viz.js to render the process map using the DOT layout.
}
\examples{
data(example_log)

# Animate the process with the default GraphViz DOT renderer
animate_process(example_log, renderer = renderer_graphviz())

}
\seealso{
animate_process
}
