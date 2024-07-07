# Friendly ISO date/time interval strings

ISO8601 specifies how date/time ranges can be represented in an abbreviated form, e.g. 2024-02-05 to 2024-04-08 is presented as 2024-02-05/04-08.

It doesn't seem like commonly used datetime libraries such as [date-fns](https://www.npmjs.com/package/date-fns) support this however, so this small library attempts to fill the gap. 

## Install
`npm install friendly-iso-datetime-intervals`

## Usage
```
// yourScript.js

import getISODateRange from 'friendly-iso-datetime-intervals'

try {
  getISODateRange('2024-02-05', '2024-04-08') // -> 2024-02-05/04-08
}
catch(err) {
  // throws if formats are inconsistent, values missing, etc
  // handle errors here
}
```

or
```
try {
  getISODateRange('2024', '2025', null, null, true) // -> 2024-2025
}
catch(err) {
  // throws if formats are inconsistent, values missing, etc
  // handle errors here
}
```
So date ranges can be formed from a range of different, partial date formats in a dataset.

Note that formats of startDate and endDate are compared and must be the consistent. A startDate is also required, otherwise the function throws, so test first if you have a value before using the function.

`getISODateRange` can also take start time and end time values, e.g. '12.15' or '12:15'. Again these must be consistent.

You can also use the parameters `useSlashesNotDashes` and `useRomanNumeralMonths` to get more user friendly, although no longer ISO8601 compliant, output. 

Please log any issues at the GitHub repo.

