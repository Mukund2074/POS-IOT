export const distanceFormat = (distance) => {
    // Convert to number and format to 2 decimal places
    const formattedDistance = Number(distance).toFixed(2);
    // Replace the first occurrence of '.' with ','
    return formattedDistance.replace('.', ',');
};
