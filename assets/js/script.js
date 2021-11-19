var searchHistory = [];
var apiKey = "6a5355d562381f240b2e68c6e7e42b99";

// save localstorage
function saveLocalStorage() {
   localStorage.setItem(
      "weatherDashboardHistory",
      JSON.stringify(searchHistory)
   );
}

// load localstorage
function loadLocalStorage() {
   var loadedData = JSON.parse(localStorage.getItem("weatherDashboardHistory"));
   if (loadedData != null) {
      console.log(loadedData);
      // loop backwards because items get prepended to the list
      loadedData.reverse().forEach(function (item) {
         addHistory(item);
      });
   }
}

// fetch data from the OpenWeather API
// uses nested fetch calls to convert city name to coordinates, then search weather for the coordinates
function fetchWeather(cityInput) {
   // fetch coordinates of the city
   fetch(
      "https://api.openweathermap.org/geo/1.0/direct?q=" +
         cityInput +
         "&limit=1&appid=" +
         apiKey
   )
      .then(function (response) {
         response.json().then(function (data) {
            // validate length, because errors with this call "succeed" and return empty array
            if (data.length > 0) {
               // get name. use this as an autocorrect feature
               var cityName = data[0].name;
               // get coordinates
               var cityLat = data[0].lat;
               var cityLon = data[0].lon;
               // fetch data using the fetched coordinates
               fetch(
                  "https://api.openweathermap.org/data/2.5/onecall?lat=" +
                     cityLat +
                     "&lon=" +
                     cityLon +
                     "&exclude=minutely,hourly,alerts&units=metric&appid=" +
                     apiKey
               )
                  .then(function (response) {
                     response.json().then(function (data) {
                        if (response.ok) {
                           // SUCCESS: EXECUTE FUNCTION
                           console.log(data);
                           addHistory(cityName);
                           updateWeather(cityName, data);
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
                     cityInput +
                     "'. Please check your spelling and try again."
               );
            }
         });
      })
      .catch(function (error) {
         alert("Error: Unable to connect to OpenWeather");
      });
}

// add to search history
function addHistory(name) {
   // check if not already in history
   if ($("button[data-search='" + name + "']").length === 0) {
      // add button element to page
      $("#history").prepend(
         $(
            "<button data-search='" +
               name +
               "' class='btn btn-secondary mb-0'>" +
               name +
               "</button>"
         )
      );
      // if search history is maxed, remove the oldest item
      if (searchHistory.length >= 10) {
         $("button[data-search]").last().remove();
      }
   }

   // if already in history, move it to top
   else {
      $("#history").prepend($("button[data-search='" + name + "']"));
   }

   // rebuild array of search history
   searchHistory = [];
   $("button[data-search]").each(function () {
      searchHistory.push($(this).text());
   });

   // save
   saveLocalStorage();
}

// update the elements on the page
function updateWeather(name, dataObject) {
   // get "current" UV Index  (not displaying daily forecast for this)
   var uvi = [dataObject.current.uvi];
   // build the arrays, the first item being the "current" weather data
   var dateArray = [dataObject.current.dt];
   var iconArray = [dataObject.current.weather[0].icon];
   var descArray = [dataObject.current.weather[0].description];
   var tempArray = [dataObject.current.temp];
   var windArray = [dataObject.current.wind_speed];
   var humidityArray = [dataObject.current.humidity];
   // add forecasted "daily" data using loop
   // NOTE: start at index 1 (tomorrow's date), because 0 is the current day forecast
   for (var i = 1; dateArray.length <= 5; i++) {
      dateArray.push(dataObject.daily[i].dt);
      iconArray.push(dataObject.daily[i].weather[0].icon);
      descArray.push(dataObject.daily[i].weather[0].description);
      tempArray.push(dataObject.daily[i].temp.day);
      windArray.push(dataObject.daily[i].wind_speed);
      humidityArray.push(dataObject.daily[i].humidity);
   }

   // update ALL THE ELEMENTS
   // city name
   $("#current-city").text(name);
   // UV index (current day only)
   $("#uv").text(uvi);
   if (uvi < 2) {
      $("#uv").css("background-color", "var(--bs-green)");
   } else if (uvi < 5) {
      $("#uv").css("background-color", "var(--bs-yellow)");
   } else if (uvi < 7) {
      $("#uv").css("background-color", "var(--bs-orange)");
   } else if (uvi < 10) {
      $("#uv").css("background-color", "var(--bs-red)");
   } else {
      $("#uv").css("background-color", "var(--bs-purple)");
   }
   // dates
   $("*[data-text='date']").each(function (index) {
      // use momentJS to convert from unix time
      $(this).text(moment(dateArray[index], "X").format("MM/DD/YYYY"));
   });
   // weather icons
   $("*[data-text='icon']").each(function (index) {
      $(this).html(
         "<img src='http://openweathermap.org/img/wn/" +
            iconArray[index] +
            ".png' alt='" +
            descArray[index] +
            "'/>"
      );
   });
   // temperatures
   $("*[data-text='temp']").each(function (index) {
      $(this).text(tempArray[index]);
   });
   // winds
   $("*[data-text='wind']").each(function (index) {
      $(this).text(windArray[index]);
   });
   // humidities
   $("*[data-text='humidity']").each(function (index) {
      $(this).text(humidityArray[index]);
   });
}

// form submit listener
$("#city-input").on("submit", function (event) {
   event.preventDefault();
   var formInput = $(this).find("input").val();
   $(this).find("input").val("");
   fetchWeather(formInput);
});

// search history button listener
$("#history").on("click", "button", function () {
   fetchWeather($(this).attr("data-search"));
   $("input").trigger("focus");
});

// load
loadLocalStorage();
