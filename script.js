// Refrences to HTML elements
const resultDisplay = document.getElementById("result");
const detailsDisplay = document.getElementById("details");

// Don't need too much precision for weather, caching should be fine too
const locationOptions = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 60000,
};

// Got users location, now make API request.
// Using https://open-meteo.com/
// License: https://creativecommons.org/licenses/by/4.0/
function LocationSuccess(pos) {
    const crd = pos.coords;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${crd.latitude}&longitude=${crd.longitude}&daily=precipitation_probability_max&forecast_days=1`

    detailsDisplay.innerHTML = "Getting weather";

    fetch(url)
        .then(response => {
            if (!response.ok) {
                DisplayError(`Got HTTP error ${response.statusText} (${response.status})`)
            } else {
                detailsDisplay.innerHTML = "Processing weather"
                return response.json();
            }
        })
        .then(data => {
            DisplayWeatherResult(data);
        })
        .catch(error => {
            DisplayError(error);
        });
}

// Use GeolocationError codes and make them human readable (kinda)
function LocationError(err) {
    resultDisplay.className = "";

    if (err.code == 1) {
        DisplayError(`Please grant permission to access your location, then refresh the page.`);
    } else if (err.code == 2) {
        DisplayError(`Internal error getting location.`);
    } else if (err.code == 3) {
        DisplayError(`Took too long getting location. Try refreshing the page.`);
    }
}

// Get probability of precipitation from weather api result. Show on an informal yeah/nah scale and also show the percentages.
function DisplayWeatherResult(data) {
    const p = data["daily"]["precipitation_probability_max"][0];

    resultDisplay.className = "";

    // Weird result: ???
    // 0 - 5: No!
    // 5 - 20: No
    // 20 - 30: Nah
    // 30 - 70: Maybe
    // 70 - 80: Yeah
    // 80 - 95: Yes
    // 95 - 100: Yes!
    if (isNaN(p) || !isFinite(p)) {
        resultDisplay.innerHTML = "???"
    } else if (p <= 5) {
        resultDisplay.innerHTML = "No!";
    } else if (p <= 20) {
        resultDisplay.innerHTML = "No"
    } else if (p <= 30) {
        resultDisplay.innerHTML = "Nah"
    } else if (p <= 70) {
        resultDisplay.innerHTML = "Maybe";
    } else if (p <= 80) {
        resultDisplay.innerHTML = "Yeah";
    } else if (p < 95) {
        resultDisplay.innerHTML = "Yes";
    } else if (p <= 100) {
        resultDisplay.innerHTML = "Yes!";
    } else {
        //Over 100% somehow
        resultDisplay.innerHTML = "Yes!!";
    }
    detailsDisplay.innerHTML = `Approximately <b>${p}%</b> chance of rain.`;
}

// Show something went wrong
function DisplayError(message) {
    resultDisplay.className = "";

    resultDisplay.innerHTML = "Dunno";
    detailsDisplay.innerHTML = "<b>Error:</b> " + message;
}


// When page loads, see if location is supported or not
if ("geolocation" in navigator) {
    // Get users location, on success this will make the API request
    resultDisplay.className = "loading";
    resultDisplay.innerHTML = "Loading";
    detailsDisplay.innerHTML = "Getting location"

    navigator.geolocation.getCurrentPosition(LocationSuccess, LocationError, locationOptions);

} else {
    DisplayError("Your browser does not support getting location information.")
}