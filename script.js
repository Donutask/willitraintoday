const resultDisplay = document.getElementById("result");
const detailsDisplay = document.getElementById("details");

const locationOptions = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 60000, // One min cache
};

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

function DisplayWeatherResult(data) {
    const p = data["daily"]["precipitation_probability_max"][0];
    console.log(data);

    resultDisplay.className = "";

    if (isNaN(p)) {
        resultDisplay.innerHTML = "???"
    } else if (!isFinite(p)) {
        resultDisplay.innerHTML = "YES!!!";
    } else if (p <= 0) {
        resultDisplay.innerHTML = "Not At All";
    } else if (p < 10) {
        resultDisplay.innerHTML = "No"
    } else if (p < 40) {
        resultDisplay.innerHTML = "Probably Not";
    } else if (p < 50) {
        resultDisplay.innerHTML = "Maybe";
    } else if (p < 75) {
        resultDisplay.innerHTML = "Probably";
    } else if (p < 80) {
        resultDisplay.innerHTML = "Quite Likely";
    } else if (p < 90) {
        resultDisplay.innerHTML = "Very Likely";
    } else if (p < 100) {
        resultDisplay.innerHTML = "Yes";
    } else if (p >= 100) {
        resultDisplay.innerHTML = "Definitely";
    }
    detailsDisplay.innerHTML = `Approximately <b>${p}%</b> chance of rain.`;
}

function DisplayError(message) {
    resultDisplay.innerHTML = "Dunno";
    detailsDisplay.innerHTML = "Error: " + message;
}


function Main() {
    if ("geolocation" in navigator) {
        resultDisplay.className = "loading";
        resultDisplay.innerHTML = "Loading";
        detailsDisplay.innerHTML = "Getting location"

        navigator.geolocation.getCurrentPosition(LocationSuccess, LocationError, locationOptions);

    } else {
        DisplayError("Your browser does not support getting location information.")
    }
}

Main();

