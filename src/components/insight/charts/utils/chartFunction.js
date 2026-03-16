export function drawCustomLabel(chart, totalValue) {
    const {
      ctx,
      chartArea: { left, right, top, bottom },
    } = chart;
  
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
  
    ctx.save();
  
    if (chart._active && chart._active.length > 0) {
      const activeElement = chart._active[0];
      const datasetIndex = activeElement.datasetIndex;
      const dataIndex = activeElement.index;
  
      const valueLabel = chart.config.data.datasets[datasetIndex].data[dataIndex];
  
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#000";
      ctx.fillText(`${valueLabel}%`, centerX, centerY);
    } else {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#000";
      ctx.fillText("100%", centerX, centerY);
    }
  
    // Display "No Data" if totalValue is 0
    // if (totalValue === 0) {
    //   ctx.textAlign = "center";
    //   ctx.textBaseline = "middle";
    //   ctx.font = "bold 20px Arial";
    //   ctx.fillStyle = "#000";
    //   ctx.fillText("No Data", centerX, centerY);
    // }
  
    ctx.restore();
  }