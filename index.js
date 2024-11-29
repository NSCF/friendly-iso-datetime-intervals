import { romanNumeralMonths } from "./romanNumeralMonths.js"

/**
 * Function to generate ISO8601 date/time ranges from start and end dates/times. Note this will throw for empty strings as input.
 * @param {string} startDate A partial or full ISO date string, e.g. '2024-07-19', or '2024-07'; backslashes also acceptable as separators
 * @param {string} [endDate] A partial or full ISO date string, must be equal or after startDate
 * @param {string} [startTime] A time string, as hrs:minutes[:seconds]; periods also acceptable as separators
 * @param {string} [endTime] The end time, same format as startTime; endDate is required
 * @param {boolean} [useSlashesNotDashes] A flag for whether to swap dashes and slashes, which means the result is no longer a valid ISO string, but is more user friendly IMO
 * @param {boolean} [useRomanNumeralMonths] F flag to use roman numberal months in dates, but only works with useSlashesNotDashes == true
 * @returns {string} A formatted ISO datetime interval string. You may want to replace T's with a space to make the result more user friendly 
 */
export default function getISODateRange(startDate, endDate, startTime, endTime, useSlashesNotDashes, useRomanNumeralMonths) {
  
  // lots of validation first...

  try {
    validateDateString(startDate)
  }
  catch {
    throw new Error('invalid start date, a valid start date is required')
  }

  let timeZoneString = false
  if (startDate.endsWith('Z')) {
    startDate = startDate.replace('Z', '')
    timeZoneString = true
  }
  
  const startDateParts = startDate.trim().split(/[-\/\.:T]/)
  //makes sure months and days are padded
  for (let i = 0; i < startDateParts.length; i++) {
    if (i > 0) {
      if (startDateParts[i].length < 2) {
        startDateParts[i] = startDateParts[i].padStart(2, '0')
      }
    }
  }

  if (useSlashesNotDashes && useRomanNumeralMonths && startDateParts.length >=2 ) {
    startDateParts[1] = romanNumeralMonths[startDateParts[1]]
  }

  let endDateParts
  if (endDate) {

    try {
      validateDateString(endDate)
    }
    catch {
      throw new Error('invalid end date')
      
    }

    if (endDate.endsWith('Z')) {
      endDate = endDate.replace('Z', '')
    }

    endDateParts = endDate.split(/[-\/\.:T]/)
    //makes sure months and days are padded
    for (let i = 0; i < endDateParts.length; i++) {
      if (i > 0) {
        if (endDateParts[i].length < 2) {
          endDateParts[i] = endDateParts[i].padStart(2, '0')
        }
      }
    }

    if (useSlashesNotDashes && useRomanNumeralMonths && endDateParts.length >=2 ) {
      endDateParts[1] = romanNumeralMonths[endDateParts[1]]
    }

    if (startDateParts.length != endDateParts.length) {
      throw new Error('start date and end date formats do not match')
    }

  }

  let startTimeParts
  if (startTime) {
    try {
      startTimeParts = validateTimeString(startTime)
    }
    catch {
      throw new Error('invalid start time')
    }

    //we may have a start time but only a partial date...
    if (startDateParts.length < 3) {
      throw new Error('start time not valid for partial start date')
    }

    //we may have a full ISO datetime string, in which case we shouldn't have a startTime also
    if (startDateParts.length > 3) {
      throw new Error('cannot have start time for full ISO datetime string')
    }

  }

  let endTimeParts
  if (endTime) {

    if (!endDateParts) {
      throw new Error('no end date for end time')
    }

    if (!startTimeParts) {
      throw new Error('no start time for end time')
    }

    try {
      endTimeParts = validateTimeString(endTime)
    }
    catch {
      throw new Error('invalid end time')
    }

    if (endDateParts.length < 3) {
      throw new Error('end time not valid for partial end date')
    }

    if (endDateParts.length > 3) {
      throw new Error('cannot have end time for full ISO datetime string')
    }

    if (startTimeParts.length != endTimeParts.length) {
      throw new Error('start time and end time formats do not match')
    }
  }

  let result 

  if (!endDateParts) {
    result = startDateParts.join('-')
    if (startTimeParts) {
      result += 'T' + startTimeParts.join(':')
    }
  }
  else {
    
    //make sure startdate is before enddate
    const startDateTimeParts = startDateParts.concat(startTimeParts).filter(x => x)
    const startDateObject = new Date(...startDateTimeParts)
    const endDateTimeParts = endDateParts.concat(endTimeParts).filter(x => x)
    const endDateObject = new Date(...endDateTimeParts)

    if (endDateObject < startDateObject) {
      throw new Error('end date is before start date')
    }

    //iterate over the arrays and build the result
    let isoStringParts = []
    for (let i = 0; i < startDateTimeParts.length; i++) {
      //as soon as something change we just concat the rest together
      if (startDateTimeParts[i] != endDateTimeParts[i]) {
        // just push everything in!
        let secondParts = []
        for (let j = i; j < startDateTimeParts.length; j++) {
          isoStringParts.push(startDateTimeParts[j])
          secondParts.push(endDateTimeParts[j])

          if (j < 2) {
            isoStringParts.push('-')
            secondParts.push('-')
          }
          else if (j == 2) {
            isoStringParts.push('T')
            secondParts.push('T')
          }
          else {
            isoStringParts.push(':')
            secondParts.push(':')
          }
        }

        isoStringParts.pop() //get rid of last separator
        //secondParts.pop() //get rid of last separator
        isoStringParts.push('/')
        isoStringParts = [...isoStringParts, ...secondParts]

        break
      }
      else {
        isoStringParts.push(startDateTimeParts[i])
        
        //the relevant separators
        if (i < 2) {
          isoStringParts.push('-')
        }
        else if (i == 2) {
          isoStringParts.push('T')
        }
        else {
          isoStringParts.push(':')
        }
      }
    }

    isoStringParts.pop() //get rid of the last separator
    result = isoStringParts.join('') 

  }

  if (timeZoneString) {
    result += 'Z'
  }

  if (useSlashesNotDashes) {
    result = result.replace('/', '|').replace(/-/g, '/').replace('|', '-').replace(/T/g, ' ').replace('Z', '')
  }

  return result

}

// helpers

/**
 * 
 * @param {string} dateString 
 * @returns Nothing! But throws if there is a problem
 */
function validateDateString(dateString) {

  if (!dateString || !dateString.trim || !dateString.trim()) {
    throw new Error()
  }

  // check that we have a valid date
  const d = new Date(dateString)
  if (isNaN(d.getTime())) {
    throw new Error()
  }

  // we only accept UTC ISO datetime strings
  if (dateString.includes('±')) {
    throw new Error('invalid start date, only UTC ISO strings permitted')
  }
  const dateStringTimeZone = dateString.match(/([a-zA-Z]+)$/)
  if (dateStringTimeZone) {
    if (dateStringTimeZone[1] != 'Z') {
      throw new Error('invalid start date, only UTC ISO strings permitted')
    }
  }

}

/**
 * 
 * @param {string} timeString 
 * @returns {string[]} An array of the time parts after splitting
 */
function validateTimeString(timeString) {
  if (!timeString.trim || !timeString.trim()) {
    throw new Error()
  }

  const timeStringParts = timeString.split(/[:\.]/)
  if (timeStringParts.length < 2 || timeStringParts.length > 3) {
    throw new Error()
  }

  const st = new Date()
  st.setHours(timeStringParts[0])
  st.setMinutes(timeStringParts[1])
  if (timeStringParts.length == 3) {
    st.setSeconds(timeStringParts[2]) 
  }
  if (isNaN(st.getTime())) {
    throw new Error()
  }

  return timeStringParts
}