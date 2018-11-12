// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 120
};


var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var stateAreaGroup = chartGroup.append("g")

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";


// function used for updating x-scale var upon click on axis label
function xScale(masterData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(masterData, d => d[chosenXAxis]) * 0.8,
        d3.max(masterData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }


// function used for updating y-scale var upon click on axis label
function yScale(masterData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(masterData, d => d[chosenYAxis]) * 0.8,
         d3.max(masterData, d => d[chosenYAxis]) * 1.2
        ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }


// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }


// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }


// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }


  // function used for updating state group with a transition to
// new circles
function renderStates(stateGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  stateGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis])-7)
    .attr("y", d => newYScale(d[chosenYAxis])+5.5);

  return stateGroup;
}



// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
      var labelX = "Poverty:";
    }
    else if (chosenXAxis === "age") {
      var labelX = "Age:";
    }
    else {
      var labelX = "Income:"  
    }

    
    if (chosenYAxis === "healthcare") {
      var labelY = "Healthcare:";
    }
    else if (chosenYAxis === "smokes") {
      var labelY = "Smokes:";
      }
    else {
      var labelY = "Obese:"  
    }
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }



// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(masterData) {
    
    // parse data
    masterData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.smokes = +data.smokes;
      data.obesity = +data.obesity;
    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(masterData, chosenXAxis);
  
    // yLinearScale function above csv import
    var yLinearScale = yScale(masterData, chosenYAxis);
  

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(masterData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10)
      .attr("fill", "blue")
      .attr("opacity", ".5");
      
    var stateGroup = stateAreaGroup.selectAll("text")  
      .data(masterData)
      .enter()
      .append("text")
      .attr("class", "stateText")
      .attr("x", d => xLinearScale(d[chosenXAxis])-7)
      .attr("y", d => yLinearScale(d[chosenYAxis])+5.5)
      .text(d => d.abbr);

    
    // Create group for  3 x- axis labels
    var labelsGroupX = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = labelsGroupX.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    var ageLabel = labelsGroupX.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");
  
    var incomeLabel = labelsGroupX.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
 

    // append y axis labels
    var labelsGroupY = chartGroup.append("g");

    var healthcareLabel = labelsGroupY.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - (margin.left / 3 + 10))
      .attr("x", 0 - (height / 2 + 20))
      .attr("value", "healthcare") // value to grab for event listener
      .attr("dy", "1em")
      .classed("active", true)
      .text("Lacks Healthcare (%)");
  
    var smokesLabel = labelsGroupY.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - (margin.left / 3 * 2 + 5))
      .attr("x", 0 - (height / 2 + 10))
      .attr("value", "smokes") // value to grab for event listener
      .attr("dy", "1em")
      .classed("inactive", true)
      .text("Smokes (%)");

    var obeseLabel = labelsGroupY.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - (margin.left / 3 * 3))
      .attr("x", 0 - (height / 2))
      .attr("value", "obesity") // value to grab for event listener
      .attr("dy", "1em")
      .classed("inactive", true)
      .text("Obese (%)");
  
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
    // x axis labels event listener
    labelsGroupX.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
  
          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(masterData, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
     
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
          // updates state group with new info
          stateGroup = renderStates(stateGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          // changes classes to change bold text for X Axis
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }

          else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }

          else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

    // y axis labels event listener
    labelsGroupY.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
  
          // replaces chosenXAxis with value
          chosenYAxis = value;
  
          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          yLinearScale = yScale(masterData, chosenYAxis);
  
          // updates x axis with transition
          yAxis = renderYAxes(yLinearScale, yAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
          // updates state group with new info
          stateGroup = renderStates(stateGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          // changes classes to change bold text for X Axis
          if (chosenYAxis === "healthcare") {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
          }

          else if (chosenYAxis === "smokes") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
          }

          else {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obeseLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

});
