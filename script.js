/* global d3 */

const width = 800;
const height = 400;
const barWidth = width / 275;

// Tooltip div for displaying information on hover
const tooltip = d3
  .select('.visHolder')
  .append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0);

// Overlay for highlighting the bar on hover
const overlay = d3
  .select('.visHolder')
  .append('div')
  .attr('class', 'overlay')
  .style('opacity', 0);

// SVG container for the bar chart
const svgContainer = d3
  .select('.visHolder')
  .append('svg')
  .attr('width', width + 100)
  .attr('height', height + 60);

// Load the GDP data
d3.json(
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'
)
  .then(data => {
    // Append y-axis label
    svgContainer
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -200)
      .attr('y', 80)
      .text('Gross Domestic Product');

    // Append additional information text
    svgContainer
      .append('text')
      .attr('x', width / 2 + 120)
      .attr('y', height + 50)
      .text('More Information: http://www.bea.gov/national/pdf/nipaguid.pdf')
      .attr('class', 'info');

    // Parse the data to extract years and quarters
    const years = data.data.map((item) => {
      const quarter = {
        '01': 'Q1',
        '04': 'Q2',
        '07': 'Q3',
        '10': 'Q4',
      }[item[0].substring(5, 7)];

      return item[0].substring(0, 4) + ' ' + quarter;
    });

    // Convert date strings to Date objects
    const yearsDate = data.data.map(item => new Date(item[0]));

    // Set up the x-axis scale
    let xMax = new Date(d3.max(yearsDate));
    xMax.setMonth(xMax.getMonth() + 3);
    const xScale = d3
      .scaleTime()
      .domain([d3.min(yearsDate), xMax])
      .range([0, width]);

    // Create the x-axis
    const xAxis = d3.axisBottom().scale(xScale);

    // Append the x-axis to the SVG container
    svgContainer
      .append('g')
      .call(xAxis)
      .attr('id', 'x-axis')
      .attr('transform', `translate(60, ${height})`);

    // Extract GDP values from the data
    const GDP = data.data.map(item => item[1]);

    // Scale the GDP values to fit within the chart height
    const gdpMax = d3.max(GDP);
    const linearScale = d3.scaleLinear().domain([0, gdpMax]).range([0, height]);
    const scaledGDP = GDP.map(item => linearScale(item));

    // Set up the y-axis scale
    const yAxisScale = d3.scaleLinear().domain([0, gdpMax]).range([height, 0]);

    // Create the y-axis
    const yAxis = d3.axisLeft(yAxisScale);

    // Append the y-axis to the SVG container
    svgContainer
      .append('g')
      .call(yAxis)
      .attr('id', 'y-axis')
      .attr('transform', 'translate(60, 0)');

    // Create the bars for the chart
    svgContainer.selectAll('rect')
      .data(scaledGDP)
      .enter()
      .append('rect')
      .attr('data-date', (d, i) => data.data[i][0])
      .attr('data-gdp', (d, i) => data.data[i][1])
      .attr('class', 'bar')
      .attr('x', (d, i) => xScale(yearsDate[i]))
      .attr('y', d => height - d)
      .attr('width', barWidth)
      .attr('height', d => d)
      .attr('index', (d, i) => i)
      .style('fill', '#33adff')
      .attr('transform', 'translate(60, 0)')
      .on('mouseover', (event, d) => {
        const i = event.target.getAttribute('index');

        // Show overlay on hover
        overlay
          .transition()
          .duration(0)
          .style('height', d + 'px')
          .style('width', barWidth + 'px')
          .style('opacity', 0.9)
          .style('left', i * barWidth + 'px')
          .style('top', height - d + 'px')
          .style('transform', 'translateX(60px)');

        // Show tooltip on hover
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip
          .html(
            years[i] +
            '<br>' +
            '$' +
            GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') +
            ' Billion'
          )
          .attr('data-date', data.data[i][0])
          .style('left', i * barWidth + 30 + 'px')
          .style('top', height - 100 + 'px')
          .style('transform', 'translateX(60px)');
      })
      .on('mouseout', () => {
        // Hide tooltip and overlay on mouseout
        tooltip.transition().duration(200).style('opacity', 0);
        overlay.transition().duration(200).style('opacity', 0);
      });
  })
  .catch(e => console.log(e));
