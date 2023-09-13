const list_country = ["Thailand","Myanmar","Malaysia","Singapore","Vietnam","Laos","Cambodia","Indonesia","Philippines",
"Brunei","Timor-Leste"]
const myColor = d3.scaleOrdinal().domain(list_country)
.range(d3.schemeSet2);

d3.csv('https://gist.githubusercontent.com/puripant/857f1981667e8b42da2c72328ba94ead/raw/3950015ce671792bc9756d55f140b71079315279/medals.csv')
.then(function(data) {
    createChart(data);
    createCheckbox(list_country,data);
    var head = d3.select("#head_1").append("h1").style("text-align","center").style("font-family","verdana")
    .style("color","#424242");
    head.html(`Gold Medals in Southeast Asian Games ${d3.min(data, function(d) { return +d.year;})} - ${d3.max(data, function(d) { return +d.year;})}`);
})
.catch(function(error) {
    console.error(error);
});

function createChart(data){
    var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    // console.log(data_raw)
    var countries =  Array.from(new Set(data.map(function(d) {return d.name;})));
    var year_list =  Array.from(new Set(data.map(function(d) {return d.year;})));
    var total_gold =  Array.from(new Set(data.map(function(d) {return d.gold;})));
    var groupedData = data.reduce((result, entry) => {
    var country = entry.name;
    if (!result[country]) {
        result[country] = [];
    }
    result[country].push(entry);
    return result;
    }, {});
    
    var margin = {top: 10, right: 10, bottom: 50, left: 50},
    width = 1120 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    //   console.log(myColor)
    var svg = d3.select("#my_dataviz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    // Create scales for X and Y axes
    var x = d3.scaleBand()
    .domain(year_list)
    .range([ 0, width])
    .padding(0.1);

    var y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return +d.gold; })])
    .range([height, 0]);

    // Add X axis
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    // Add Y axis
    svg.append("g")
    .call(d3.axisLeft(y));

    // Create line generator
    var line = d3.line()
    .x(function(d) { return x(d.year) + x.bandwidth() / 2; })
    .y(function(d) { return y(+d.gold); });

    // Draw the lines
    svg.selectAll(".line")
    .data(countries)
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", function(d) { return myColor(d); })
    .attr("stroke-width", 2)
    .attr("d", function(d) { return line(groupedData[d]); });

    svg.selectAll(".point")
    .data(data)
    .enter()
    .append("path")
    .attr("class", "point")
    .attr("d", function(d) {
      if (d.host === 'y') {
        return d3.symbol().type(d3.symbolStar).size(70)();
      } else {
        return d3.symbol().type(d3.symbolCircle).size(20)();
      }
    })
    .attr("transform", (d) => `translate(${x(d.year)+ x.bandwidth() / 2},${y(d.gold)})`)
    .style("fill", function(d) { return myColor(d.name); })
    .on('mouseover', function (d, i) {
    d3.select(this).transition()
    .duration('100')
    .attr("d", function(d) {if (d.host === 'y') {
        return d3.symbol().type(d3.symbolStar).size(200)();
      } else {
        return d3.symbol().type(d3.symbolCircle).size(100)();
      }
    }
    )
    tooltip.transition().duration(200).style("opacity", 1);
    tooltip.html(`Country : ${i.name}&nbsp;${i.gold}&nbsp;Medals`)
    .style("left", (d.pageX + 10) + "px")
    .style("top", (d.pageY - 15) + "px");
    ;})
    .on('mouseout', function (d, i) {
    d3.select(this).transition()
    .duration('200')
    .attr("d", function(d) {if (d.host === 'y') {
        return d3.symbol().type(d3.symbolStar).size(50)();
      } else {
        return d3.symbol().type(d3.symbolCircle).size(20)();
      }
    }
    )
    tooltip.transition().duration('200').style("opacity", 0);
    })
    ;
    
    // y title 
    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left+12)
    .attr("x", -margin.top-height/2 -50)
    .text("Total Gold Medals");

    // x title
    svg.append("text")
    .attr("x", width/2 -50)
    .attr("y", height + margin.bottom-10)
    .text("SEA Games Years.");
    // var legendSvg = d3.select("#legend")
    // .append("svg")
    // .attr("width", 200)
    // .attr("height", countries.length * 20);
    // var legends = legendSvg.selectAll(".legend")
    // .data(countries)
    // .enter()
    // .append("g")
    // .attr("class", "legend")
    // .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // legends.append("rect")
    // .attr("x", 10)
    // .attr("width", 10)
    // .attr("height", 10)
    // .attr("fill", function(d) { return myColor(d); });

    // legends.append("text")
    // .attr("x", 30)
    // .attr("y", 5)
    // .attr("dy", ".35em")
    // .style("text-anchor", "start")
    // .text(function(d) { return d; });
};

function createCheckbox(countries,data){
    const checkboxContainer = d3.select("#checkbox_1");
    const checkboxes = checkboxContainer.selectAll("label")
    .data(countries)
    .enter()
    .append("label")
    .style("display", "block"); // Set display property to "block" for vertical arrangement

    checkboxes.append("input")
    .attr("type", "checkbox")
    .attr("class", "checkbox")
    .attr("value", d => d)
    .attr("checked", true)
    .on("change", function (event, d) {
        var selectedCountries = getCheckedCheckboxValues()
        updateChart(selectedCountries,data);
        console.log(selectedCountries)
        
    });
    checkboxes.append("div")
    .style("display", "inline-block")
    .style("width","10px")
    .style("height","10px")
    .style("margin-left","5px")
    .style("margin-right","10px")
    .style("background-color",function(d) { return myColor(d);});
    
    checkboxes.append("span").text((d) => d);
}

function getCheckedCheckboxValues() {
    // Create an array to store the values of checked checkboxes
    var checkedValues = [];
    // Get all checkboxes using a CSS selector
    var checkboxes = document.querySelectorAll('.checkbox');
    // Loop through each checkbox
    checkboxes.forEach(function(checkbox) {
        // Check if the checkbox is checked
        if (checkbox.checked) {
        // If checked, add its value to the array
        checkedValues.push(checkbox.value);
        }
    });
    // Return the array of checked values
    return checkedValues;
}

function updateChart(selectedCountries,data) { 
    var filteredData = data.filter(d => selectedCountries.includes(d.name));
    d3.selectAll("svg").remove();
    createChart(filteredData)
};

function checkAll() {
    let inputs = document.querySelectorAll('.checkbox');
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].checked = true;
    }
    d3.csv('https://gist.githubusercontent.com/puripant/857f1981667e8b42da2c72328ba94ead/raw/3950015ce671792bc9756d55f140b71079315279/medals.csv')
    .then(function(data) {
    d3.selectAll("svg").remove();
    createChart(data)
    })
    .catch(function(error) {
    console.error(error);
    });
}
    // Create uncheckall function
function uncheckAll() {
    let inputs = document.querySelectorAll('.checkbox');
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].checked = false;
    }
    d3.csv('https://gist.githubusercontent.com/puripant/857f1981667e8b42da2c72328ba94ead/raw/3950015ce671792bc9756d55f140b71079315279/medals.csv')
    .then(function(data) {
    let selectedCountries = []
    updateChart(selectedCountries,data)
    })
    .catch(function(error) {
    console.error(error);
    });
};
