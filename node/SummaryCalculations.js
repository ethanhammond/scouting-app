
"use strict";

class SummaryCalculations {
  constructor() {

  }

  static getResults(matches, calculationSpec, gamemode) {
    let getTime = (timeString) => {
      let timeMultipliers = [60000, 1000, 1];
      // console.log("getTime time string: " + timeString);
      let timeArray = timeString.split(':').map((val, i) => {
        return Number(val) * timeMultipliers[i];
      });
      let time = timeArray.reduce((a, b) => a+b, 0);
      return time;
    };

		let getTimeString = (time) => {
      // console.log("time to convert: " + time);
			const second = 1000;
			const minute = second * 60;

			let minutes = Math.floor(time / minute);
			let seconds = Math.floor((time % minute) / second);
			let milliseconds = Math.floor(time % second);
			let timeString = `${minutes}:${seconds}:${milliseconds}`;
      if (timeString == "NaN:NaN:NaN") {
        timeString = "0:0:0";
      }
			return timeString;
		}

    let makeEventLookup = (lookupType) => {
      let getSortedKeys = (match) => {
				let times = [];
				let timeEvents = [];
        for (let timeString in match) {
          if (match.hasOwnProperty(timeString)) {
            timeEvents.push(timeString);
          }
        }
        timeEvents.sort((a, b) => {
          return getTime(a) - getTime(b);
        });
				return timeEvents;
      };
      if (lookupType == "time") {
        let eventLookup = (match, event) => {
					let times = [];
          let timeEvents = getSortedKeys(match);
          // console.log("time events2: " + timeEvents);
          for (let timeString of timeEvents) {
            if(match[timeString] == event){
              let time = getTime(timeString);
              times.push(time);
            }
          }
          return times;
        };
        return eventLookup;
      } else if (lookupType == "amount") {
        let amounts = [];
        let eventLookup = (match, event) => {
          let timeEvents = getSortedKeys(match);
          for (let timeString of timeEvents) {
            if (typeof match[timeString] === 'object') {
              if (match[timeString].hasOwnProperty(event)) {
                let amount = match[timeString];
                amount.time = getTime(timeString);
                amounts.push(amount);
              }
            }
          }
          return amounts;
        };
        return eventLookup;
      }
    };

    let getTimesByEvent = makeEventLookup("time");
    let getAmountsByEvent = makeEventLookup("amount");

    let getKeyByValue = (obj, val) => {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] == val) {
            return key;
          }
        }
      }
    };


    let calculators = {
      median: (values) => {
				// console.log("values: " + values);
				values.sort((a, b) => {
					return a - b;
				});
				// console.log("sorted values: " + values);
				// console.log("length: " + values.length);
				let lowMiddle = Math.floor((values.length - 1) / 2);
				let highMiddle = Math.ceil((values.length - 1) / 2);
				// console.log("low middle: " + lowMiddle);
				// console.log("high middle: " + highMiddle);
				let median = (Number(values[lowMiddle]) + Number(values[highMiddle])) / 2.0;
				// console.log("median: " + median);
        return getTimeString(median);
      },
      mean: (values) => {
        values.sort((a,b) => {
          return a - b;
        });
        let sum = values.reduce((a, b) => a+b, 0);
        let mean = sum / values.length;
        return getTimeString(mean);
      },
      numPerMatch: (matchCount, eventCount) => {
				console.log("time length: " + eventCount);
				console.log("matches length: " + matchCount);
        return eventCount / matchCount;
      }
    };
    calculators.duration = calculators.mean;
    let calculationTypes = ["median", "mean", "numPerMatch", "duration"];

    let getDurations = (startTimes, endTimes) => {
      let shortLength = startTimes.length <= endTimes.length ? startTimes.length : endTimes.length;
      let durations = [];
      for (let i = 0; i < shortLength; i++) {
        durations.push(endTimes[i] - startTimes[i]);
      }
      return durations;
    }

    let results = {};
    let result = 0;
    let event = calculationSpec.event;
    console.log("EVENT: " + event);
    // console.log(`${event} calculation types: ${JSON.stringify(calculationSpec.calculations)}`);
		if (true) {
			for (let calculationType of calculationSpec.calculations) {
				if (calculationTypes.indexOf(calculationType) >= 0) {
					// console.log("calculation type: " + calculationType);
					if (calculationSpec.value == "time") {
						let times = [];
						for (let match of matches) {
							match = match[gamemode];
							// console.log("matches: " + JSON.stringify(matches, null, 2));
							// console.log("times: " + times);
							if (!calculationSpec.hasOwnProperty("locations")) {
								// console.log("adding times: " + getTimesByEvent(match, event));
								times.push.apply(times, getTimesByEvent(match, event));
							} else {
								let locations = calculationSpec.locations;
								for (let location of locations) {
									// console.log("location: " + event + " " + location);
									times.push.apply(times, getTimesByEvent(match, event + " " + location));
								}
							}
							// console.log("times: " + times);
						}
						let calculator = calculators[calculationType];
						if (calculator.length == 1) {
							result = calculator(times);
						} else if (calculator.length == 2) {
							let eventCount = 0;
							// console.log("times: " + times);
							times.forEach((time) => {
								if (time !== null) {
									eventCount++;
								}
							});
							let matchCount = matches.length;
							result = calculator(matchCount, eventCount);
						} else {
							result = -1;
						}
					} else if (calculationSpec.value == "duration") {
						let startTimes = [];
						let endTimes = [];
						let durations = [];
						for (let match of matches) {
							match = match[gamemode];
							if (calculationSpec.start.constructor === Array) {
								for (let startType of calculationSpec.start) {
                  // console.log("start: " + startType);
                  // console.log("adding times: " + getTimesByEvent(match, startType));
									startTimes.push.apply(startTimes, getTimesByEvent(match, startType));
								}
							} else {
                // console.log("start: " + calculationSpec.start);
                // console.log("adding times: " + calculationSpec.start);
								startTimes.push.apply(startTimes, getTimesByEvent(match, calculationSpec.start));
							}
							if (calculationSpec.end.constructor === Array) {
								for (let endType of calculationSpec.end) {
									endTimes.push.apply(endTimes, getTimesByEvent(match, endType));
								}
							} else {
								endTimes.push.apply(endTimes, getTimesByEvent(match, calculationSpec.end));
							}
							durations.push.apply(durations, getDurations(startTimes, endTimes));
						}
            // console.log("start times: " + startTimes);
            // console.log("end times: " + endTimes);
            // console.log("durations: " + durations);
						let calculator = calculators[calculationType];
						result = calculator(durations);
					} else if (calculationSpec.value == "amount") {
						let startTimes = [];
						let endTimes = [];
						let durations = [];
						let amounts = [];
						for (let match of matches) {
							match = match[gamemode];
							startTimes.push.apply(startTimes, getTimesByEvent(match, calculationSpec.start));
							let amountObjects = getAmountsByEvent(match, calculationSpec.end);
							for (let amountObject of amountObjects) {
								amounts.push(amountObject[calculationSpec.end]);
								endTimes.push(amountObject.time);
							}
							durations.push.apply(durations, getDurations(startTimes, endTimes));
						}
						let calculator = calculators[calculationType];
            if (amounts.length > 0) {
              if (calculationType == "mean") {
                result = calculator(amounts);
              } else if (calculationType == "rate") {
                result = calculator(amounts, duration);
              } else if (calculationType == "durations") {
                result = calculator(durations);
              }
            }
					}
					results[calculationType] = result;
				}
			}
		}
    return results;
  }
}

module.exports = SummaryCalculations;
