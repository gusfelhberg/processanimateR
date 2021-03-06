/*
processanimateR 1.0.0
Copyright (c) 2018 Felix Mannhardt
Licensed under MIT license
*/
function Tokens(el, data, scales) {

  var colorScale = scales.colorScale;
  var sizeScale = scales.sizeScale;
  var opacityScale = scales.opacityScale;
  var imageScale = scales.imageScale;

  function safeNumber(x) {
    return (parseFloat(x) || 0).toFixed(6);
  }

  function generateEdgeId(id) {
    return el.id+"-edge" + id + "-path";
  }

  function insertAnimation(svg, group, shape, caseTokens, customAttrs) {

    // group is moving
    var motions = group.selectAll("animateMotion")
                       .data(caseTokens).enter();

    motions.append("animateMotion")
    	.attr("begin", function(d) { return safeNumber(d.token_start) + "s"; })
    	.attr("dur", function(d) { return safeNumber(d.token_duration) + "s"; })
    	.attr("fill", "freeze")
    	.attr("rotate", "auto")
      .append("mpath")
        .attr("href", function(d) { return "#"+generateEdgeId(d.edge_id); });

    var startNode = svg.querySelector("#node"+data.start_activity+" * ellipse");
    var endNode = svg.querySelector("#node"+data.end_activity+" * ellipse");

    function getEdgePoint(id, length) {
      var edge = svg.querySelector("#"+ generateEdgeId(id));
      var point;
      if (length === Infinity) {
        point = edge.getPointAtLength(edge.getTotalLength());
      } else {
        point = edge.getPointAtLength(length);
      }
      return point.x + "," + point.y;
    }

    motions.append("animateMotion")
      .attr("begin", function(d) {
          return safeNumber(d.token_start + d.token_duration) + "s";
      })
    	.attr("dur", function(d) {
    	    return safeNumber(d.activity_duration) + "s";
    	})
      .attr("fill", "freeze")
    	.attr("from", function(d) {
    	    return getEdgePoint(d.edge_id, Infinity);
    	})
    	.attr("to", function(d, i) {
    	    if (i == caseTokens.length-1) { // last node
    	      if (endNode) {
    	        return endNode.cx.animVal.value + "," + endNode.cy.animVal.value;
    	      } else {
    	        // no specific end node
              return getEdgePoint(d.edge_id, Infinity);
    	      }
    	    } else {
    	      return getEdgePoint(caseTokens[i+1].edge_id, 0);
    	    }
    	});

    // Reveal token
    if (caseTokens[0].token_start === 0) {
      group.attr("display", "block");
    } else {
      group.append('set')
        .attr("attributeName", "display")
        .attr("to", "block")
        .attr("begin", safeNumber(caseTokens[0].token_start) + "s")
        .attr("fill", "freeze");
    }

    // Hide token after reaching end
    var hideTime = caseTokens[caseTokens.length-1].token_start +
                   caseTokens[caseTokens.length-1].token_duration +
                   caseTokens[caseTokens.length-1].activity_duration + 0.5;
    group.append('set')
      .attr("attributeName", "display")
      .attr("to", "none")
      .attr("begin", safeNumber(hideTime) + "s")
      .attr("fill", "freeze");

    // Improve the rendering performance by avoiding animations if not necessary
    function isSingle(attr) {
      return attr.length === 1;
    }

    if (isSingle(customAttrs.colors)) {
      group.attr("fill", colorScale(customAttrs.colors[0].value));
    } else {
      customAttrs.colors.forEach(function(d){
        group.append('set')
          .attr("attributeName", "fill")
          .attr("to", colorScale(d.value) )
          .attr("begin", safeNumber(d.time) + "s" )
          .attr("fill", "freeze");
      });
    }

    if (isSingle(customAttrs.opacities)) {
      group.attr("fill-opacity", opacityScale(customAttrs.opacities[0].value));
    } else {
      customAttrs.opacities.forEach(function(d){
        group.append('set')
          .attr("attributeName", "fill-opacity")
          .attr("to", opacityScale(d.value))
          .attr("begin", safeNumber(d.time) + "s" )
          .attr("fill", "freeze");
      });
    }

    if (data.shape === "circle") {
      if (isSingle(customAttrs.sizes)) {
        shape.attr("r", sizeScale(customAttrs.sizes[0].value));
      } else {
        customAttrs.sizes.forEach(function(d){
          shape.append('set')
            .attr("attributeName", "r")
            .attr("to", sizeScale(d.value))
            .attr("begin", safeNumber(d.time) + "s")
            .attr("fill", "freeze");
        });
      }
    } else if (data.shape === "rect" || data.shape === "image") {
      if (isSingle(customAttrs.sizes)) {
        shape.attr("height", sizeScale(customAttrs.sizes[0].value));
        shape.attr("width", sizeScale(customAttrs.sizes[0].value));
      } else {
        customAttrs.sizes.forEach(function(d){
          shape.append('set')
            .attr("attributeName", "height")
            .attr("to", sizeScale(d.value))
            .attr("begin", safeNumber(d.time) + "s")
            .attr("fill", "freeze");
        });
        customAttrs.sizes.forEach(function(d){
          shape.append('set')
            .attr("attributeName", "width")
            .attr("to", sizeScale(d.value))
            .attr("begin", safeNumber(d.time) + "s")
            .attr("dur", "0")
            .attr("fill", "freeze");
        });
      }
    }

    if (isSingle(customAttrs.images)) {
      shape.attr("href", imageScale(customAttrs.images[0].value));
    } else {
      customAttrs.images.forEach(function(d){
        shape.append('set')
          .attr("attributeName", "href")
          .attr("to", imageScale(d.value))
          .attr("begin", safeNumber(d.time) + "s" )
          .attr("fill", "freeze");
      });
    }

  }

  this.insertTokens = function(svg) {

    // Create detached from the DOM
    var tokenGroup = d3.create("svg")
                       .append("g")
                       .attr("class", "tokens");

    var tokens = HTMLWidgets.dataframeToD3(data.tokens);
    var cases = tokens.reduce(function (a, e) {
                                 if (a.indexOf(e.case) === -1) {
                                   a.push(e.case);
                                 }
                                 return a;
                              }, []);

    var sizes = HTMLWidgets.dataframeToD3(data.sizes);
    var colors = HTMLWidgets.dataframeToD3(data.colors);
    var images = HTMLWidgets.dataframeToD3(data.images);
    var opacities = HTMLWidgets.dataframeToD3(data.opacities);

    var tokenShapes = tokenGroup.selectAll("g")
      .data(cases)
      .enter()
      .append("g")
      .attr("display", "none")
      .attr("class", "token")
      .attr("stroke", "black")
      .attr("fill", "white");

    if (data.shape === "image") {
      tokenShapes = tokenShapes.append(data.shape)
          		     .attr("width", 0)
          		     .attr("height", 0)
                   .attr("href", function(d) {
                      var imgValue = images.filter(function(image) {
                        return(image.case == d);
                      })[0].value;
                      return imageScale(imgValue);
                   })
                   .attr("preserveAspectRatio", "xMinYMin");
    } else if (data.shape === "rect") {
      tokenShapes = tokenShapes.append(data.shape);
    } else if (data.shape === "circle") {
      tokenShapes = tokenShapes.append(data.shape);
    } else {
      tokenShapes = tokenShapes.append("g")
                    .html(data.shape);
    }

    // Tooltip
    tokenShapes.append("title").text(function(d) { return d; });

    // User defined attributes
    if (data.attributes !== null) {
      tokenShapes.attrs(data.attributes);
    }

    // Transform for jitter and images
    var transform = d3.transform()
      .translate(function(d) {
        var translateX = 0;
        var translateY = 0;

        if (data.jitter) {
          translateY = (Math.random() - 0.5) * data.jitter;
        }

        if (data.shape !== "circle") {
          var size = sizeScale(sizes.filter(function(size) {
            return(size.case == d);
          })[0].value);
          translateX -= size/2;
          translateY -= size/2;
        }

        return [translateX, translateY];

      });

    tokenShapes.attr("transform", transform);

    tokenShapes.each(function(d, i) {

        var group = d3.select(this.parentNode);
        var tokenShape = d3.select(this);
        var caseTokens = tokens.filter(function(token) {
          return(token.case == d);
        });

        var customAttrs = {
          sizes: sizes.filter(function(x) { return(x.case === d); }),
          colors: colors.filter(function(x) { return(x.case === d); }),
          images: images.filter(function(x) { return(x.case === d); }),
          opacities: opacities.filter(function(x) { return(x.case === d); })
        };
        insertAnimation(svg, group, tokenShape, caseTokens, customAttrs);

    });


    // Add to DOM at once to avoid artefacts in Chrome
    d3.select(svg)
      .select(".graph")
      .node()
      .appendChild(tokenGroup.node());

    return tokenGroup;
  };

  this.attachEventListeners = function(svg, tokenGroup) {

    function toggleSelection(element) {
      if (!element.dataset.selected || element.dataset.selected === "false") {
        element.dataset.selected = "true";
      } else {
        element.dataset.selected = "false";
      }
    }

    function deselectAll(tokenElements, nodeElements) {
      tokenElements.each(function() {
        this.dataset.selected = "false";
        data.onclick_token_select(d3.select(this), false);
      });
      nodeElements.each(function() {
        this.dataset.selected = "false";
        data.onclick_activity_select(d3.select(this).select("path"), false);
      });
    }

    function isSelected(element) {
      return "selected" in element.dataset && element.dataset.selected === "true";
    }

    var tokenElements = tokenGroup.selectAll(".token");
    var nodeElements = d3.select(svg)
      .selectAll(".node")
      .filter(function() {
        return this.id !== "node"+data.start_activity && this.id !== "node"+data.end_activity;
      });

    function notifyShinyTokenInput(tokenElements) {
      if ('Shiny' in window) {
        var selectedTokens = tokenElements.filter(function(d) { return(isSelected(this)); });
        Shiny.onInputChange(el.id + "_tokens", selectedTokens.data());
      }
    }

    function notifyShinyNodeInput(nodeElements, activities) {
      if ('Shiny' in window) {
        var sel = nodeElements.filter(function(d) { return(isSelected(this)); })
          .nodes().map(function(activity) {
              // javascript is zero-based
              var id = Number(activity.id.replace(/.*?(\d+)/,"$1"));
              return {id: activity.id, activity: activities.act[id-1]};
            });

        Shiny.onInputChange(el.id + "_activities", JSON.stringify(sel));
      }
    }

    // Token listener

    tokenElements.on("click", function(d) {

      var evt = d3.event;

      if (!evt.ctrlKey) {
        // Single selection mode
        deselectAll(tokenElements, nodeElements);
      }

      toggleSelection(this);

      tokenElements.each(function(){
        data.onclick_token_select(d3.select(this), isSelected(this));
      });

      notifyShinyTokenInput(tokenElements);

      if (data.onclick_token_callback) {
        data.onclick_token_callback(svg, d3.select(this), d);
      }

      evt.stopPropagation();
    });

    // Node listener

    nodeElements.on("click", function() {

      var evt = d3.event;

      if (!evt.ctrlKey) {
        // Single selection mode
        deselectAll(tokenElements, nodeElements);
      }

      toggleSelection(this);

      nodeElements.each(function() {
        data.onclick_activity_select(d3.select(this).select("path"), isSelected(this));
      });

      notifyShinyNodeInput(nodeElements, data.activities);

      if (data.onclick_activity_callback) {
        data.onclick_activity_callback(svg, d3.select(this));
      }

       evt.stopPropagation();
    });

    // Deselect when clicking on white space

    var mousePos = [];

    d3.select(svg).on("mousedown", function() {
      mousePos = d3.mouse(this);
    });

    d3.select(svg).on("mouseup", function() {
      var mouseDelta = 5;
      var curPos = d3.mouse(this);

      if (d3.event.target === svg && // check whether the click was on blank space
          Math.abs(mousePos[0] - curPos[0]) < mouseDelta &&
          Math.abs(mousePos[1] - curPos[1]) < mouseDelta) {

        deselectAll(tokenElements, nodeElements);
        notifyShinyTokenInput(tokenElements);
        notifyShinyNodeInput(nodeElements, data.activities);

      }
    });

  };

}
