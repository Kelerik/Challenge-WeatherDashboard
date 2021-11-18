var apiKey = "6a5355d562381f240b2e68c6e7e42b99";

function fetchWeather(cityName) {
   // fetch coordinates of the city
   fetch(
      "http://api.openweathermap.org/geo/1.0/direct?q=" +
         cityName +
         "&limit=1&appid=" +
         apiKey
   )
      .then(function (response) {
         response.json().then(function (data) {
            // validate length, because errors with this call "succeed" and return empty array
            if (data.length > 0) {
               var cityLat = data[0].lat;
               var cityLon = data[0].lon;
               // fetch data using the fetched coordinates
               fetch(
                  "https://api.openweathermap.org/data/2.5/onecall?lat=" +
                     cityLat +
                     "&lon=" +
                     cityLon +
                     "&exclude=minutely,hourly,alerts&appid=" +
                     apiKey
               )
                  .then(function (response) {
                     response.json().then(function (data) {
                        if (response.ok) {
                           // SUCCESS: EXECUTE FUNCTION
                           console.log(data);
                           updateWeather(data);
                        } else {
                           alert("Error: " + data.message);
                        }
                     });
                  })
                  .catch(function (error) {
                     alert("Error: Unable to connect to OpenWeather");
                  });
            }
            // city name input error
            else {
               alert(
                  "Error looking up '" +
                     cityName +
                     "'. Please check your spelling and try again."
               );
            }
         });
      })
      .catch(function (error) {
         alert("Error: Unable to connect to OpenWeather");
      });
}

function updateWeather(dataObject) {
   // IMPORTANT use the dates returned by the call instead of assuming the local system's date is correct
   // start with current day
   var dateArray = [dataObject.current.dt];
   // add forecasted dates
   // NOTE: start at index 1 (tomorrow's date), because 0 is the current day forecast
   for (var i = 1; dateArray.length <= 5; i++) {
      dateArray.push(dataObject.daily[i].dt);
   }
   console.log(dateArray);
   // update all the date elements
   $("*[data-date]").each(function (index) {
      // use momentJS to convert from unix time
      $(this).text(moment(dateArray[index], "X").format("MM/DD/YYYY HH:MM:SS"));
   });
}
