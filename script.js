/**
 * DOM Function to be called when DOM Content is Loaded
 */
document.addEventListener("DOMContentLoaded", async function () {
    
    // Loading of Data and location Settings
    Loading();
    let bustopdata = [];
    let bicycleparkingdata = [];
    let carparkdata = [];
    
    while (true)
    {
        const busdataPromise = LoadBusData(bustopdata.length);
        const rowdata = await busdataPromise;
        bustopdata = bustopdata.concat(rowdata.value);
        if (rowdata.value.length < 500)
            break;
    }
    const parksdataPromise = LoadParks();
    const parkconnectorsdataPromise = LoadParkConnectors();
    const taxistandsdataPromise = LoadTaxiStands();
    const mrtdataPromise = LoadMRTGEOJSON();

    const parksdata = await parksdataPromise;
    const parkconnectorsdata = await parkconnectorsdataPromise;
    const taxistandsdata = await taxistandsdataPromise;
    const mrtdata = await mrtdataPromise;

    while(true)
    {
        let carparkdataPromise = LoadCarParks(carparkdata.length);
        const rowdata = await carparkdataPromise;
        carparkdata = carparkdata.concat(rowdata)
        if(rowdata.length < 500)
            break;
    }
    
    for(let s in sectors)
    {
        let dataPromise = LoadBicycleParking(sectors[s]);
        let data = await dataPromise;
        bicycleparkingdata = bicycleparkingdata.concat(data);
    }
    
    // Loading of map, Layers and markers once all data is loaded
    let map = LoadMap();

    const busstopLayer = L.markerClusterGroup();
    const parkLayer = L.markerClusterGroup();
    const bicycleLayer = L.markerClusterGroup();
    const taxistandLayer = L.markerClusterGroup();
    const carparkLayer = L.markerClusterGroup();
    const emptylayer = L.layerGroup(); 
    const resultlayer = L.markerClusterGroup();
    const directionLayer = L.layerGroup(); 
    const currentlayer = L.layerGroup(); 
 

    emptylayer.addTo(map);

    DrawBusStops(bustopdata,busstopLayer);
    DrawBicycleParking(bicycleparkingdata,bicycleLayer);
    const parkholder = DrawParks(parksdata);
    parkLayer.addLayer(parkholder);
    DrawTaxiStands(taxistandsdata,taxistandLayer);
    const parkconnectorLayer = DrawParkConnectors(parkconnectorsdata);
    const mrtStationLayer = DrawMrtLayer(mrtdata);
    DrawCarparks(carparkdata,carparkLayer);

    const baseLayers = {
        'None' : emptylayer,
        'Bus Stops': busstopLayer,
        'Bicycle Parking': bicycleLayer,
        'Parks' : parkLayer,
        'Taxis Stands' : taxistandLayer,
        'Mrt Layer' : mrtStationLayer,
        'Carparks' : carparkLayer
    }

    const overlayLayers = {
        'Park Connectors' : parkconnectorLayer,
    }     

    L.control.layers(baseLayers,overlayLayers).addTo(map);

    /**
     * Toggle Search Button on click event listener
     */
    document.querySelector("#toggleSearchBtn").addEventListener("click", function(){
        const searchContainer = document.querySelector("#search-container");
        const directionContainer = document.querySelector("#directions-container");
        const style = window.getComputedStyle(searchContainer);
        // if the search container is already visible, we'll hide it
        if (style.display != "none") {
            searchContainer.style.display = "none";
        } else {
            // otherwise, show it
            searchContainer.style.display = 'block';
        }   
    });

    /**
     * Toggle Direction Button on click event listener
     */
    const DirectionBtn = document.querySelector("#directionicon");
    DirectionBtn.addEventListener("click", async function(){
        const directionContainer = document.querySelector("#directions-container");
        const style = window.getComputedStyle(directionContainer);
        const searchContainer = document.querySelector("#search-container");
        // if the search container is already visible, we'll hide it
        if (style.display != "none") {
            directionContainer.style.display = "none";
            searchContainer.style.display = 'block';
        } else {
            // otherwise, show it
            directionContainer.style.display = 'block';
            searchContainer.style.display = 'none';
        } 
    });

    /**
     * Search Button on click event listener
     */
    const searchBtn = document.querySelector("#searchBtn");
    searchBtn.addEventListener("click", async function(){
        const searchterms = document.querySelector("#searchText").value;
        const searchtype = document.querySelector("#datasets").value;
        let resultlist = [];
        
        // OneMap search and display results
        if(searchtype == "onemap")
        {
            resultlist = await ONEMAPSEARCH(searchterms)
            if(resultlist.length != 0)
            {
                AddResultsToMap(resultlist, resultlayer ,map, searchterms);
                resultlayer.addTo(map);
                map.flyTo([resultlist[0].LATITUDE, resultlist[0].LONGITUDE], 16);
                // DisplaySearchResults(resultlist, searchterms,map);
            }
        }
        // STB search and display results
        else
        {
            resultlist = await STBSEARCH(searchterms,searchtype);
            AddResultsToMapSTB(resultlist, resultlayer, searchtype, map, searchterms);
            resultlayer.addTo(map);
            let goodlocation;
            for(let r of resultlist)
            {
                if(r.location.latitude != 0 && r.location.longitude != 0)
                {
                    goodlocation = {
                        "latitude" : r.location.latitude,
                        "longitude" : r.location.longitude
                    };
                    break;
                }
            }
            map.flyTo([goodlocation.latitude, goodlocation.longitude], 16);
            // DisplaySearchResultsSTB(resultlist, searchterms,map);
            
        }      
    });

    /**
     * Get Directions Button on click event listener
     */
    const DirectionsBtn = document.querySelector("#DirectionsBtn");
    DirectionsBtn.addEventListener("click", async function(){
        selectRouteType("routedrive");
        GetDirectionsHandler('drive', map, directionLayer);
    });

    /**
     * Get current Location Button on click event listener
     */
    const gps = document.querySelector("#gpsimg");
    gps.addEventListener("click", async function(){
        getLocation();
        centerView(map, currentlayer);
    });

    /**
     * Close Overlay Button on click event listener
     */
    const closeoverlay = document.querySelector("#busdivclose");
    closeoverlay.addEventListener("click", async function(){
        const buslist = document.querySelector("#bustimings");
        buslist.style.display = "none";
    });

    /**
     * Get Directions Drive Button on click event listener
     */
    const routedrive = document.querySelector("#routedrive");
    routedrive.addEventListener("click", async function(){
        if (routedrive.classList.contains('directiontypeselected'))
            return;
        selectRouteType("routedrive");
        GetDirectionsHandler('drive', map, directionLayer);
    });

    /**
     * Get Directions Public Transport Button on click event listener
     */
    const routepublic = document.querySelector("#routepublic");
    routepublic.addEventListener("click", async function(){
        if (routepublic.classList.contains('directiontypeselected'))
            return;
        selectRouteType("routepublic");
        GetDirectionsHandlerPT(map, directionLayer);
    });

    /**
     * Get Directions Cycle Button on click event listener
     */
    const routecycle = document.querySelector("#routecycle");
    routecycle.addEventListener("click", async function(){
        if (routecycle.classList.contains('directiontypeselected'))
            return;
        selectRouteType("routecycle");
        GetDirectionsHandler('cycle', map, directionLayer);
    });

    /**
     * Get Directions Walk Button on click event listener
     */
    const routewalk = document.querySelector("#routewalk");
    routewalk.addEventListener("click", async function(){
        if (routewalk.classList.contains('directiontypeselected'))
            return;
        selectRouteType("routewalk");
        GetDirectionsHandler('walk', map, directionLayer);
        
    });
    
    /**
     * Toggle Dark Mode Button on click event listener
     */
    const darkmode = document.querySelector("#themeimg");
    darkmode.addEventListener("click", async function(){
        const themeid = document.querySelector("#themeid");
        themeid.value = themeid.value == "default" ? "dark" :"default";
        switchBaseLayer(themeid.value, map);
    });
});

/**
 * Loading Function to show loading screen and loading location and onemap verification
 */
function Loading()
{
    const mapholder = document.querySelector("#singaporeMap");
    mapholder.style.background = `url("./img/loading.gif") center center`;
    mapholder.style.backgroundRepeat = "no-repeat";
    getLocation();
    LoadOneMap();
}

/**
 * Using the route given by OneMap to display direction on the screen (Mode: Driving)
 * @param {Object} route route info from OneMap
 */
function DisplayRouteDirections(route)
{
    // get and show offcanvas set header and remove old content if any
    let offcanvasElement = document.getElementById('offcanvasroute');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    const offcanvasheader = offcanvasElement.querySelector('#offcanvasrouteLabel');
    offcanvasheader.innerText = `${route.route_summary.start_point} to ${route.route_summary.end_point} (${ToKMFromM(route.route_summary.total_distance)}) in ${ToHrMinsFromSeconds(route.route_summary.total_time)}`;
    const routebox = document.querySelector("#offcanvasroutebody");
    if(routebox.hasChildNodes())
        routebox.removeChild(routebox.lastElementChild);
    // create accordion for each route
    const directionsholder = document.createElement("div");
    const routeholder = document.createElement("div");
    let text = `
    <div class="accordion" id="route1">
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    ${route.route_summary.start_point} to ${route.route_summary.end_point} (${route.subtitle}) in ${ToHrMinsFromSeconds(route.route_summary.total_time)}
                </button>
            </h2>
                <div id="collapseOne" class="c collapse show" data-bs-parent="#route1">
                    <div class="accordion-body">
    `;
    // displaying route instruction
    for( let i of route.route_instructions)
    {
        text += `<div class='ruoteinstruction'>
        <img class='directiontypeimg' src=${GetDirectionImage(i[0])}>
        ${i[9]} (${ToKMFromM(i[2])})<br/></div>` ;
    }
    text += `
                    </div>
            </div>
        </div>
    </div>
    `;
    routeholder.innerHTML = text;
    directionsholder.appendChild(routeholder);
    // check and display another route if any
    if(route.phyroute != null)
    {
        const routeholder = document.createElement("div");
        let text = `
        <div class="accordion" id="route2">
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
                        ${route.phyroute.route_summary.start_point} to ${route.phyroute.route_summary.end_point} (${route.phyroute.subtitle}) in ${ToHrMinsFromSeconds(route.phyroute.route_summary.total_time)}
                    </button>
                </h2>
                    <div id="collapseTwo" class="c collapse" data-bs-parent="#route2">
                        <div class="accordion-body">
        `;
        for( let i of route.phyroute.route_instructions)
        {
            text += `<div class='ruoteinstruction'>
            <img class='directiontypeimg' src=${GetDirectionImage(i[0])}>
            ${i[9]} (${ToKMFromM(i[2])})<br/></div>` ;
        }
        text += `
                        </div>
                </div>
            </div>
        </div>
        `;
        routeholder.innerHTML = text;
        directionsholder.appendChild(routeholder);
    }
    // check and display alternative route if any
    if(route.alternativeroute != null)
    {
        const routeholder = document.createElement("div");
        let text = `
        <div class="accordion" id="route3">
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="true" aria-controls="collapseThree">
                        ${route.alternativeroute[0].route_summary.start_point} to ${route.alternativeroute[0].route_summary.end_point} (${route.alternativeroute[0].subtitle}) in ${ToHrMinsFromSeconds(route.alternativeroute[0].route_summary.total_time)}
                    </button>
                </h2>
                    <div id="collapseThree" class="c collapse" data-bs-parent="#route3">
                        <div class="accordion-body">
        `;
        for( let i of route.alternativeroute[0].route_instructions)
        {
            text += `<div class='ruoteinstruction'>
            <img class='directiontypeimg' src=${GetDirectionImage(i[0])}>
            ${i[9]} (${ToKMFromM(i[2])})<br/></div>` ;
        }
        text += `
                        </div>
                </div>
            </div>
        </div>
        `;
        routeholder.innerHTML = text;
        directionsholder.appendChild(routeholder);
    }
    routebox.appendChild(directionsholder);
}

/**
 * Using the route given by OneMap to display direction on the screen (Mode: Cycling)
 * @param {Object} route route info from OneMap
 */
function DisplayRouteDirectionsCycle(route)
{
    // get and show offcanvas set header and remove old content if any
    let offcanvasElement = document.getElementById('offcanvasroute');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    const offcanvasheader = offcanvasElement.querySelector('#offcanvasrouteLabel');
    offcanvasheader.innerText = `${route.route_summary.start_point} to ${route.route_summary.end_point} (${ToKMFromM(route.route_summary.total_distance)}) in ${ToHrMinsFromSeconds(route.route_summary.total_time)}`;
    const routebox = document.querySelector("#offcanvasroutebody");
    if(routebox.hasChildNodes())
        routebox.removeChild(routebox.lastElementChild);
    // create accordion for each route
    const directionsholder = document.createElement("div");
    const routeholder = document.createElement("div");
    let text = `
    <div class="accordion" id="route1">
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    ${route.route_summary.start_point} to ${route.route_summary.end_point} in ${ToHrMinsFromSeconds(route.route_summary.total_time)}
                </button>
            </h2>
                <div id="collapseOne" class="c collapse show" data-bs-parent="#route1">
                    <div class="accordion-body">
    `;
    // displaying route instruction
    for( let i of route.route_instructions)
    {
        text += `<div class='ruoteinstruction'>
        <img class='directiontypeimg' src=${GetDirectionImage(i[0])}>
        ${i[9]} (${ToKMFromM(i[2])})<br/></div>` ;
    }
    text += `
                    </div>
            </div>
        </div>
    </div>
    `;
    routeholder.innerHTML = text;
    directionsholder.appendChild(routeholder);
    // check and display another route if any
    if(route.phyroute != null)
    {
        const routeholder = document.createElement("div");
        let text = `
        <div class="accordion" id="route2">
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
                        ${route.phyroute.route_summary.start_point} to ${route.phyroute.route_summary.end_point} (${route.phyroute.subtitle}) in ${ToHrMinsFromSeconds(route.phyroute.route_summary.total_time)}
                    </button>
                </h2>
                    <div id="collapseTwo" class="c collapse" data-bs-parent="#route2">
                        <div class="accordion-body">
        `;
        for( let i of route.phyroute.route_instructions)
        {
            text += `<div class='ruoteinstruction'>
            <img class='directiontypeimg' src=${GetDirectionImage(i[0])}>
            ${i[9]} (${ToKMFromM(i[2])})<br/></div>` ;
        }
        text += `
                        </div>
                </div>
            </div>
        </div>
        `;
        routeholder.innerHTML = text;
        directionsholder.appendChild(routeholder);
    }
    // check and display alternative route if any
    if(route.alternativeroute != null)
    {
        const routeholder = document.createElement("div");
        let text = `
        <div class="accordion" id="route3">
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="true" aria-controls="collapseThree">
                        ${route.alternativeroute[0].route_summary.start_point} to ${route.alternativeroute[0].route_summary.end_point} (${route.alternativeroute[0].subtitle}) in ${ToHrMinsFromSeconds(route.alternativeroute[0].route_summary.total_time)}
                    </button>
                </h2>
                    <div id="collapseThree" class="c collapse" data-bs-parent="#route3">
                        <div class="accordion-body">
        `;
        for( let i of route.alternativeroute[0].route_instructions)
        {
            text += `<div class='ruoteinstruction'>
            <img class='directiontypeimg' src=${GetDirectionImage(i[0])}>
            ${i[9]} (${ToKMFromM(i[2])})<br/></div>` ;
        }
        text += `
                        </div>
                </div>
            </div>
        </div>
        `;
        routeholder.innerHTML = text;
        directionsholder.appendChild(routeholder);
    }
    routebox.appendChild(directionsholder);
}

/**
 * Using the route given by OneMap to display direction on the screen (Mode: Walking)
 * @param {Object} route route info from OneMap
 * @param {Object} from from location info from OneMap
 * @param {Object} to to location info from OneMap
 */
function DisplayRouteDirectionsWalk(route,from,to)
{
    // get and show offcanvas set header and remove old content if any
    let offcanvasElement = document.getElementById('offcanvasroute');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    const offcanvasheader = offcanvasElement.querySelector('#offcanvasrouteLabel');
    offcanvasheader.innerText = `${from.GeocodeInfo[0].BLOCK} ${from.GeocodeInfo[0].ROAD} to ${to.GeocodeInfo[0].BLOCK} ${to.GeocodeInfo[0].ROAD} (${ToKMFromM(route.route_summary.total_distance)}) in ${ToHrMinsFromSeconds(route.route_summary.total_time)}`;
    const routebox = document.querySelector("#offcanvasroutebody");
    if(routebox.hasChildNodes())
        routebox.removeChild(routebox.lastElementChild);
    // create accordion for each route
    const directionsholder = document.createElement("div");
    const routeholder = document.createElement("div");
    let text = `
    <div class="accordion" id="route1">
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    ${from.GeocodeInfo[0].BLOCK} ${from.GeocodeInfo[0].ROAD} to ${to.GeocodeInfo[0].BLOCK} ${to.GeocodeInfo[0].ROAD} in ${ToHrMinsFromSeconds(route.route_summary.total_time)}
                </button>
            </h2>
                <div id="collapseOne" class="c collapse show" data-bs-parent="#route1">
                    <div class="accordion-body">
    `;
    // displaying route instruction
    for( let i of route.route_instructions)
    {
        text += `<div class='ruoteinstruction'>
        <img class='directiontypeimg' src=${GetDirectionImage(i[0])}>
        ${i[9]} (${ToKMFromM(i[2])})<br/></div>` ;
    }
    text += `
                    </div>
            </div>
        </div>
    </div>
    `;
    routeholder.innerHTML = text;
    directionsholder.appendChild(routeholder);
    routebox.appendChild(directionsholder);
}

/**
 * Function to show first route
 */
function onClickRoute()
{
    let offcanvasElement = document.getElementById('offcanvasroute');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    let collapseOne = offcanvasElement.querySelector('#collapseOne');
    let accordion1 = new bootstrap.Collapse(collapseOne);
    accordion1.show();
    let collapseTwo = offcanvasElement.querySelector('#collapseTwo');
    let accordion2 = new bootstrap.Collapse(collapseTwo);
    accordion2.hide();
    let collapseThree = offcanvasElement.querySelector('#collapseThree');
    let accordion3 = new bootstrap.Collapse(collapseThree);
    accordion3.hide();
}

/**
 * Function to show second route
 */
function onClickRouteAlt()
{
    let offcanvasElement = document.getElementById('offcanvasroute');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    let collapseOne = offcanvasElement.querySelector('#collapseOne');
    let accordion1 = new bootstrap.Collapse(collapseOne);
    accordion1.hide();
    let collapseTwo = offcanvasElement.querySelector('#collapseTwo');
    let accordion2 = new bootstrap.Collapse(collapseTwo);
    accordion2.show();
    let collapseThree = offcanvasElement.querySelector('#collapseThree');
    let accordion3 = new bootstrap.Collapse(collapseThree);
    accordion3.hide();
}

/**
 * Function to show thrid route
 */
function onClickRouteAlt2()
{
    let offcanvasElement = document.getElementById('offcanvasroute');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    let collapseOne = offcanvasElement.querySelector('#collapseOne');
    let accordion1 = new bootstrap.Collapse(collapseOne);
    accordion1.hide();
    let collapseTwo = offcanvasElement.querySelector('#collapseTwo');
    let accordion2 = new bootstrap.Collapse(collapseTwo);
    accordion2.hide();
    let collapseThree = offcanvasElement.querySelector('#collapseThree');
    let accordion3 = new bootstrap.Collapse(collapseThree);
    accordion3.show();
}

/**
 * Function to show search canvas
 */
function onClickSearch()
{
    let offcanvasElement = document.getElementById('offcanvassearch');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
}

/**
 * Function to load select options from STB
 */
async function LoadSelect()
{
    const selectList = document.querySelector("#datasets");
    const datalist = await GetDataset();
    for(let d of datalist)
    {
        let option = document.createElement("option");
        option.text = d;
        option.value = d;
        selectList.add(option);
    }
}

/**
 * Function that Handles OneMap searching
 * @param {String} searchterms terms to search by
 * @returns the search results
 */
async function ONEMAPSEARCH(searchterms)
{
    let resultlist = [];
    let curpage = 1;
    // loop to get all search results
    while(true)
    {
        const responsePromise = SearchOneMap(searchterms, curpage);
        const response = await responsePromise;
        curpage = response.pageNum;
        const totalpage = response.totalNumPages;
        resultlist = resultlist.concat(response.results);
        if (curpage == totalpage || response.results.length == 0)
            break;
        else 
            curpage++;
    }
    return resultlist;
}

/**
 * Function that Handles STB searching
 * @param {String} searchterms terms to search by
 * @param {String} searchtype database to search from
 * @returns the search results
 */
async function STBSEARCH(searchterms,searchtype)
{
    let resultlist = [];
    let offset = 0;
    // loop to get all search results
    while(true)
    {
        const responsePromise = SearchSTB(searchtype,searchterms,offset);
        const response = await responsePromise;
        for (let r of response.data)
            resultlist.push(r);
        if (response.totalRecords == resultlist.length)
            break;
        else
            offset += 50;
    }
    return resultlist;
}

/**
 * Dispay Search Results from STB
 * @param {Object} resultlist list of results for search function
 * @param {string} searchterms terms search by
 * @param {Map} map map object
 */
function DisplaySearchResultsSTB(resultlist, searchterms, map)
{
    // get offcanvas and display it
    let offcanvasElement = document.getElementById('offcanvassearch');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    // Set display header and information
    const offcanvasheader = offcanvasElement.querySelector('#offcanvassearchLabel');
    offcanvasheader.innerText = "Search Results for " + searchterms;
    const searchbox = document.querySelector("#offcanvassearchbody");
    if(searchbox.hasChildNodes())
        searchbox.removeChild(searchbox.lastElementChild);
}


/**
 * Function that handles direction for driving , cycling and walking
 * @param {string} type type of transport
 * @param {Map} map map object
 * @param {layerGroup} directionLayer layer to place routes on
 */
async function GetDirectionsHandler(type, map, directionLayer)
{
    // get user input and serch the postalcode / address
    const fromvalue = document.querySelector("#startText").value;
    const tovalue = document.querySelector("#endText").value;    
    const responsefromPromise = SearchOneMap(fromvalue);
    const responsetoPromise = SearchOneMap(tovalue);
    const responsefrom = await responsefromPromise;
    const responseto = await responsetoPromise;
    let from;
    // if start location is current location
    if (fromvalue == "My Location")
    {
        getLocation();
        from = { 
            lat : USER_POSITION.lat,
            lng : USER_POSITION.lng
        };
    }
    else
    {
        from = { 
            lat : responsefrom.results[0].LATITUDE,
            lng : responsefrom.results[0].LONGITUDE
        };
    }
    const to = { 
        lat : responseto.results[0].LATITUDE,
        lng : responseto.results[0].LONGITUDE
    };
    // call get directions api and fly to starting point and place start and end markers and routes to map
    const route = await GetDirections(from,to,type);;
    map.flyTo([from.lat, from.lng], 14);
    DrawDirectionsOnMap(route,directionLayer);
    AddMarkerToLayer(from,directionLayer,MarkerType["FROM"]);
    AddMarkerToLayer(to,directionLayer,MarkerType["TO"]);
    directionLayer.addTo(map);
    // Handles the displaying of routes for different transport modes
    switch (type) {
        case "drive":
            DisplayRouteDirections(route);
            break;
        case "cycle":
            DisplayRouteDirectionsCycle(route);
            break;
        case "walk":
            const fromloc = await GeoCodeFromLatLng(from.lat, from.lng);
            const toloc = await GeoCodeFromLatLng(to.lat, to.lng);
            DisplayRouteDirectionsWalk(route,fromloc,toloc);
            break;
        default:
            break;
    }
    
}

/**
 * Select and display the current transport mode
 * @param {String} type transport mode
 */
function selectRouteType(type)
{
    const routedrive = document.querySelector("#routedrive");
    const routepublic = document.querySelector("#routepublic");
    const routecycle = document.querySelector("#routecycle");
    const routewalk = document.querySelector("#routewalk");
    routedrive.className = "directiontype";
    routepublic.className = "directiontype";
    routecycle.className = "directiontype";
    routewalk.className = "directiontype";
    const routemain = document.querySelector(`#${type}`);
    routemain.classList.toggle('directiontypeselected');
    routemain.classList.toggle('directiontype');
}

/**
 * Function that handles direction for using public transport
 * @param {Map} map map object
 * @param {layerGroup} directionLayer layer to place routes on
 */
async function GetDirectionsHandlerPT(map, directionLayer)
{
    // get user input and serch the postalcode / address
    const fromvalue = document.querySelector("#startText").value;
    const tovalue = document.querySelector("#endText").value;    
    const responsefromPromise = SearchOneMap(fromvalue);
    const responsetoPromise = SearchOneMap(tovalue);
    const responsefrom = await responsefromPromise;
    const responseto = await responsetoPromise;
    let from;
    // if start location is current location
    if (fromvalue == "My Location")
    {
        getLocation();
        from = { 
            lat : USER_POSITION.lat,
            lng : USER_POSITION.lng
        };
    }
    else
    {
        from = { 
            lat : responsefrom.results[0].LATITUDE,
            lng : responsefrom.results[0].LONGITUDE
        };
    }
    const to = { 
        lat : responseto.results[0].LATITUDE,
        lng : responseto.results[0].LONGITUDE
    };
    // call get directions api and fly to starting point and place start and end markers and routes to map
    const route = await GetDirectionsPublicTransport(from,to);
    map.flyTo([from.lat, from.lng], 14);
    DrawDirectionsOnMapPT(route,directionLayer);
    AddMarkerToLayer(from,directionLayer,MarkerType["FROM"]);
    AddMarkerToLayer(to,directionLayer,MarkerType["TO"]);
    directionLayer.addTo(map);
    const fromloc = await GeoCodeFromLatLng(from.lat, from.lng);
    const toloc = await GeoCodeFromLatLng(to.lat, to.lng);
    // displaying of routes for using public transport
    DisplayRouteDirectionsPT(route, fromloc, toloc);
}

/**
 * Display routes information
 * @param {Object} route routing information
 * @param {Object} from starting location 
 * @param {Object} to end location
 */
function DisplayRouteDirectionsPT(route, from, to)
{
    // get the offcanvas and display it
    let offcanvasElement = document.getElementById('offcanvasroute');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    // set header and remove olf info inf any
    const offcanvasheader = offcanvasElement.querySelector('#offcanvasrouteLabel');
    offcanvasheader.innerText = `${from.GeocodeInfo[0].BLOCK} ${from.GeocodeInfo[0].ROAD} to ${to.GeocodeInfo[0].BLOCK} ${to.GeocodeInfo[0].ROAD} via Public Transport`;
    const routebox = document.querySelector("#offcanvasroutebody");
    if(routebox.hasChildNodes())
        routebox.removeChild(routebox.lastElementChild);
    const directionsholder = document.createElement("div");
    // display infomation for all route
    for (let i in route.plan.itineraries) 
    {
        const routeholder = document.createElement("div");
        let text = `
        <div class="accordion" id="route${i+1}">
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i+1}" aria-expanded="true" aria-controls="collapse${i+1}">
                        ${from.GeocodeInfo[0].BLOCK} ${from.GeocodeInfo[0].ROAD} to ${to.GeocodeInfo[0].BLOCK} ${to.GeocodeInfo[0].ROAD} in ${ToHrMinsFromSeconds(route.plan.itineraries[i].duration)}
                    </button>
                </h2>
                    <div id="collapse${i+1}" class="c collapse ${i==0?"show":""}" data-bs-parent="#route${i+1}">
                        <div class="accordion-body">
        `;
        // display info for each route to use
        for( let leg of route.plan.itineraries[i].legs)
        {
            switch(leg.mode)
            {
                case "WALK":
                    text += `<div class='ruoteinstruction'>
                        <div>Walk from ${ToSentenceCase(leg.from.name)} to ${ToSentenceCase(leg.to.name)} (${ToKMFromM(leg.distance)}) est Time: ${ToHrMinsFromSeconds(leg.duration)}</div>
                        </div>` ;
                    break;
                case "BUS":
                    text += `<div class='ruoteinstruction'>
                        <div>Travel by Bus on ${leg.routeShortName} from ${ToSentenceCase(leg.from.name)}(${leg.from.stopCode}) to ${ToSentenceCase(leg.to.name)}(${leg.to.stopCode} (${leg.intermediateStops.length + 1} ${leg.intermediateStops.length?"Stops":"Stop"}) est Time: ${ToHrMinsFromSeconds(leg.duration)}</div>
                        </div>` ;
                    break;
                case "SUBWAY":
                    text += `<div class='ruoteinstruction'>
                        <div>Travel on ${leg.routeLongName} from ${ToSentenceCase(leg.from.name)} to ${ToSentenceCase(leg.to.name)} (${leg.intermediateStops.length + 1} ${leg.intermediateStops.length?"Stops":"Stop"}) est Time: ${ToHrMinsFromSeconds(leg.duration)}</div>
                        </div>` ;
                    break;
            }
            
        }
        text += `
                        </div>
                </div>
            </div>
        </div>
        `;
        routeholder.innerHTML = text;
        directionsholder.appendChild(routeholder);
    }
    routebox.appendChild(directionsholder);
}