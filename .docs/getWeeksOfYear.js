function getWeeksOfYear(year) {
  const weeks = [];
  let startDate = new Date(year, 0, 1); // Comenzamos con el 1 de enero del año dado

  // Ajustamos la fecha al lunes de la primera semana del año
  const dayOfWeek = startDate.getDay(); // Obtiene el día de la semana (0 = domingo, 1 = lunes, ...)
  const diffToSunday = 0 - dayOfWeek;
  startDate.setDate(startDate.getDate() + diffToSunday);

  console.log('startDate', startDate);

  // Generar las semanas del año
  while (
    startDate.getFullYear() === year || 
    (startDate.getFullYear() === year + 1 && startDate.getDate() === 1) ||
    startDate.getFullYear() === year-1
  ) {
    const weekStart = new Date(startDate);
    const weekEnd = new Date(startDate);
    weekEnd.setDate(weekEnd.getDate() + 6); // El domingo de la semana

    // Añadir la semana (inicio y fin)
    weeks.push({
      start: new Date(weekStart),
      end: new Date(weekEnd)
    });

    // Avanzamos al lunes de la siguiente semana
    startDate.setDate(startDate.getDate() + 7);
  }

  return weeks;
}

let weeksOfYear = getWeeksOfYear(2024);
console.log(weeksOfYear);
console.log(weeksOfYear.length);
let MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

let formatDate = (date) => MONTHS[date.getMonth()] +' '+ date.getDate();
console.log({
  start: formatDate(weeksOfYear[0].start),
  end: formatDate(weeksOfYear[0].end),
});
