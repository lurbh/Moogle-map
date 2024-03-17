// File that contains Constant Variable that are used in other files
const CENTER_OF_SG = {
    Lat: '1.3684618391459316',
    Lng: '103.81458257755074'
}; 
const RADUIS_OF_SG = 30;

const CORS_URL = "http://localhost:8989/";

const sectors = {
    "North": { // 1.444034532117583, 103.81750086987618
        Lat: '1.444034532117583',
        Lng: '103.81750086987618'
    },
    "South": { // 1.2946081215427323, 103.82732559787262
        Lat: '1.2946081215427323',
        Lng: '103.82732559787262'
    },
    "East": { // 1.3511467984398517, 103.93209041140906
        Lat: '1.3511467984398517',
        Lng: '103.93209041140906'
    },
    "West": { // 1.3426398865923097, 103.74046885867914
        Lat: '1.3426398865923097',
        Lng: '103.74046885867914'
    },
    "Central": {
        Lat: '1.3684618391459316',
        Lng: '103.81458257755074'
    },
};

const lotType = {
    'C' : "Cars",
    'H' : "Heavy Vehicles",
    'y' : "Motorcycles"
};

const BusLoad = {
    "SEA" : "#66f542",
    "SDA" : "#f5cb42",
    "LSD" : "#de1010"
};

const BusType = {
    "SD" : "Single",
    "DD" : "Double",
    "BD" : "Bendy"
};

const MarkerType = {
    "STD" : "img/pin.png",
    "FROM" : "img/start.png",
    "TO" : "img/end.png",
    "accommodation" : "img/accommodation.png",
    "attractions" : "img/attractions.png",
    "bars_clubs" : "img/bars_clubs.png",
    "food_beverages" : "img/restaurant.png",
    "shops" : "img/shops.png",
    "venues" : "img/venues.png"
};

const DirectionType = {
    "BLANK" : "",
    "HEAD" : "img/up-straight-arrow.png",
    "LEFT" : "img/turn-left.png",
    "RIGHT" : "img/turn-right.png",
    "STRAIGHT" : "img/up-straight-arrow.png",
    "DESTINATION" : "img/flag.png",
    "RAMP" : "img/u-turn.png",
    "U-TURN" : "img/u-turn.png",
}

const PTTransitMode = {
    "WALK" : "midnightblue",
    "BUS" : "darkolivegreen",
    "SUBWAY" : {
        "NS" : "red",
        "EW" : "green",
        "CG" : "green",
        "DT" : "blue",
        "CC" : "orange",
        "NE" : "purple",
        "SE" : "grey",
        "BP" : "grey"
    }
}
