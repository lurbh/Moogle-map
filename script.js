document.addEventListener("DOMContentLoaded", async function () {
    
    Loading();
    // await LoadSelect();
    
    let bustopdata = [];
    // let parksdata = [];
    // let parkconnectorsdata = [];
    let bicycleparkingdata = [];
    // let taxistandsdata = [];
    // let mrtdata = [];
    let carparkdata = [];
    
    while (true)
    {
        let rowdata = await LoadBusData(bustopdata.length);
        // console.log(rowdata.value);
        bustopdata = bustopdata.concat(rowdata.value);
        if (rowdata.value.length < 500)
            break;
    }
    const parksdata = await LoadParks();
    const parkconnectorsdata = await LoadParkConnectors();
    const taxistandsdata = await LoadTaxiStands();
    const mrtdata = await LoadMRTGEOJSON();
    // carparkdata = await LoadCarParks();

    while(true)
    {
        let rowdata = await LoadCarParks(carparkdata.length);
        // console.log(rowdata);
        carparkdata = carparkdata.concat(rowdata)
        if(rowdata.length < 500)
            break;
    }
    
    for(let s in sectors)
    {
        let data = await LoadBicycleParking(sectors[s]);
        bicycleparkingdata = bicycleparkingdata.concat(data);
    }
    
    let map = LoadMap();

    const busstopLayer = L.markerClusterGroup();
    const parkLayer = L.markerClusterGroup();
    const bicycleLayer = L.markerClusterGroup();
    const taxistandLayer = L.markerClusterGroup();
    // const parkconnectorLayer = L.layerGroup(); 
    const carparkLayer = L.markerClusterGroup();
    const emptylayer = L.layerGroup(); 
    const resultlayer = L.markerClusterGroup();
    const directionLayer = L.layerGroup(); 
    const currentlayer = L.layerGroup(); 
    // let mrtStationLayer;// = 

    emptylayer.addTo(map);
    // busstopLayer.addTo(map);
    // bicycleLayer.addTo(map);
    // taxistandLayer.addTo(map);
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
    // onClickRoute();
    // onClickSearch();

    document.querySelector("#toggleSearchBtn").addEventListener("click", function(){
        const searchContainer = document.querySelector("#search-container");
        const style = window.getComputedStyle(searchContainer);
        // if the search container is already visible, we'll hide it
        if (style.display != "none") {
            searchContainer.style.display = "none";
        } else {
            // otherwise, show it
            searchContainer.style.display = 'block';
        }   
    });

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

    const searchBtn = document.querySelector("#searchBtn");
    searchBtn.addEventListener("click", async function(){
        const searchterms = document.querySelector("#searchText").value;
        const searchtype = document.querySelector("#datasets").value;
        // console.log(searchtype);
        let resultlist = [];
        
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
        else
        {
            resultlist = await STBSEARCH(searchterms,searchtype);
            // console.log(resultlist);
            AddResultsToMapSTB(resultlist, resultlayer, searchtype, map, searchterms);
            resultlayer.addTo(map);
            let goodlocation;
            for(let r of resultlist)
            {
                console.log(r);
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

    const DirectionsBtn = document.querySelector("#DirectionsBtn");
    DirectionsBtn.addEventListener("click", async function(){
        selectRouteType("routedrive");
        GetDirectionsHandler('drive', map, directionLayer);
    });

    const gps = document.querySelector("#gpsimg");
    gps.addEventListener("click", async function(){
        getLocation();
        centerView(map, currentlayer);
    });

    const closeoverlay = document.querySelector("#busdivclose");
    closeoverlay.addEventListener("click", async function(){
        const buslist = document.querySelector("#bustimings");
        buslist.style.display = "none";
    });

    const routedrive = document.querySelector("#routedrive");
    routedrive.addEventListener("click", async function(){
        if (routedrive.classList.contains('directiontypeselected'))
            return;
        selectRouteType("routedrive");
        GetDirectionsHandler('drive', map, directionLayer);
    });

    const routepublic = document.querySelector("#routepublic");
    routepublic.addEventListener("click", async function(){
        if (routepublic.classList.contains('directiontypeselected'))
            return;
        selectRouteType("routepublic");
        GetDirectionsHandlerPT(map, directionLayer);
    });

    const routecycle = document.querySelector("#routecycle");
    routecycle.addEventListener("click", async function(){
        if (routecycle.classList.contains('directiontypeselected'))
            return;
        selectRouteType("routecycle");
        GetDirectionsHandler('cycle', map, directionLayer);
    });

    const routewalk = document.querySelector("#routewalk");
    routewalk.addEventListener("click", async function(){
        if (routewalk.classList.contains('directiontypeselected'))
            return;
        selectRouteType("routewalk");
        GetDirectionsHandler('walk', map, directionLayer);
        
    });
    

});

function Loading()
{
    const mapholder = document.querySelector("#singaporeMap");
    mapholder.style.background = `url("./img/loading.gif") center center`;
    mapholder.style.backgroundRepeat = "no-repeat";
    getLocation();
    LoadOneMap();
}

function DisplayRouteDirections(route)
{
    // console.log(route);
    let offcanvasElement = document.getElementById('offcanvasroute');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    const offcanvasheader = offcanvasElement.querySelector('#offcanvasrouteLabel');
    offcanvasheader.innerText = `${route.route_summary.start_point} to ${route.route_summary.end_point} (${ToKMFromM(route.route_summary.total_distance)}) in ${ToHrMinsFromSeconds(route.route_summary.total_time)}`;
    const routebox = document.querySelector("#offcanvasroutebody");
    if(routebox.hasChildNodes())
        routebox.removeChild(routebox.lastElementChild);
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
    for( let i of route.route_instructions)
    {
        // console.log(i[0]);
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
    // console.log(text);
    routeholder.innerHTML = text;
    directionsholder.appendChild(routeholder);
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
        // console.log(text);
        routeholder.innerHTML = text;
        directionsholder.appendChild(routeholder);
    }
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
        // console.log(text);
        routeholder.innerHTML = text;
        directionsholder.appendChild(routeholder);
    }
    routebox.appendChild(directionsholder);
}

function DisplayRouteDirectionsCycle(route)
{
    let offcanvasElement = document.getElementById('offcanvasroute');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    const offcanvasheader = offcanvasElement.querySelector('#offcanvasrouteLabel');
    offcanvasheader.innerText = `${route.route_summary.start_point} to ${route.route_summary.end_point} (${ToKMFromM(route.route_summary.total_distance)}) in ${ToHrMinsFromSeconds(route.route_summary.total_time)}`;
    const routebox = document.querySelector("#offcanvasroutebody");
    if(routebox.hasChildNodes())
        routebox.removeChild(routebox.lastElementChild);
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
    for( let i of route.route_instructions)
    {
        // console.log(i[0]);
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
    // console.log(text);
    routeholder.innerHTML = text;
    directionsholder.appendChild(routeholder);
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
        // console.log(text);
        routeholder.innerHTML = text;
        directionsholder.appendChild(routeholder);
    }
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
        // console.log(text);
        routeholder.innerHTML = text;
        directionsholder.appendChild(routeholder);
    }
    routebox.appendChild(directionsholder);
}

function DisplayRouteDirectionsWalk(route,from,to)
{
    console.log(from);
    console.log(to);
    let offcanvasElement = document.getElementById('offcanvasroute');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    const offcanvasheader = offcanvasElement.querySelector('#offcanvasrouteLabel');
    offcanvasheader.innerText = `${from.GeocodeInfo[0].BLOCK} ${from.GeocodeInfo[0].ROAD} to ${to.GeocodeInfo[0].BLOCK} ${to.GeocodeInfo[0].ROAD} (${ToKMFromM(route.route_summary.total_distance)}) in ${ToHrMinsFromSeconds(route.route_summary.total_time)}`;
    const routebox = document.querySelector("#offcanvasroutebody");
    if(routebox.hasChildNodes())
        routebox.removeChild(routebox.lastElementChild);
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
    for( let i of route.route_instructions)
    {
        // console.log(i[0]);
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
    console.log(text);
    routeholder.innerHTML = text;
    directionsholder.appendChild(routeholder);
    routebox.appendChild(directionsholder);
}

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

function onClickSearch()
{
    let offcanvasElement = document.getElementById('offcanvassearch');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
}

// async function LoadSelect()
// {
//     const selectList = document.querySelector("#datasets");
//     const datalist = await GetDataset();
//     for(let d of datalist)
//     {
//         let option = document.createElement("option");
//         option.text = d;
//         option.value = d;
//         selectList.add(option);
//     }
// }

async function ONEMAPSEARCH(searchterms)
{
    let resultlist = [];
    let curpage = 1;
    while(true)
    {
        const response = await SearchOneMap(searchterms, curpage);
        // console.log(response);
        curpage = response.pageNum;
        const totalpage = response.totalNumPages;
        for (let r of response.results)
            resultlist.push(r);
        // console.log(response.results.length);
        if (curpage == totalpage || response.results.length == 0)
            break;
        else 
            curpage++;
    }
    // console.log(resultlist);
    return resultlist;
}

async function STBSEARCH(searchterms,searchtype)
{
    let resultlist = [];
    let offset = 0;
    while(true)
    {
        const response = await SearchSTB(searchtype,searchterms,offset);
        for (let r of response.data)
            resultlist.push(r);
        if (response.totalRecords == resultlist.length)
            break;
        else
            offset += 50;
    }
    return resultlist;
}

// function DisplaySearchResults(resultlist, searchterms, map)
// {
//     console.log(resultlist);
//     let offcanvasElement = document.getElementById('offcanvassearch');
//     let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
//     offcanvas.show();
//     const offcanvasheader = offcanvasElement.querySelector('#offcanvassearchLabel');
//     offcanvasheader.innerText = "Search Results for " + searchterms;
//     const searchbox = document.querySelector("#offcanvassearchbody");
//     if(searchbox.hasChildNodes())
//         searchbox.removeChild(searchbox.lastElementChild);
//     const searchHolder = document.createElement("div");
//     for(let r of resultlist)
//     {
//         const node = document.createElement("div");
//         node.classList.add('searchlist')
//         node.innerHTML = r.ADDRESS;
//         node.addEventListener("click", function () {
//             map.flyTo([r.LATITUDE, r.LONGITUDE], 16);
//             marker.openPopup();
//         });
//         searchHolder.appendChild(node);
//     }
//     searchbox.appendChild(searchHolder);
// }

function DisplaySearchResultsSTB(resultlist, searchterms, map)
{
    console.log(resultlist);
    let offcanvasElement = document.getElementById('offcanvassearch');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    const offcanvasheader = offcanvasElement.querySelector('#offcanvassearchLabel');
    offcanvasheader.innerText = "Search Results for " + searchterms;
    const searchbox = document.querySelector("#offcanvassearchbody");
    if(searchbox.hasChildNodes())
        searchbox.removeChild(searchbox.lastElementChild);
}

async function GetDirectionsHandler(type, map, directionLayer)
{
    const fromvalue = document.querySelector("#startText").value;
    const tovalue = document.querySelector("#endText").value;    
    const responsefrom = await SearchOneMap(fromvalue);
    const responseto = await SearchOneMap(tovalue);
    // console.log(responsefrom);
    // console.log(responseto);
    let from;
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
    const route = await GetDirections(from,to,type);;
    map.flyTo([from.lat, from.lng], 14);
    DrawDirectionsOnMap(route,directionLayer);
    AddMarkerToLayer(from,directionLayer,MarkerType["FROM"]);
    AddMarkerToLayer(to,directionLayer,MarkerType["TO"]);
    directionLayer.addTo(map);
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

async function GetDirectionsHandlerPT(map, directionLayer)
{
    const fromvalue = document.querySelector("#startText").value;
    const tovalue = document.querySelector("#endText").value;    
    const responsefrom = await SearchOneMap(fromvalue);
    const responseto = await SearchOneMap(tovalue);
    // console.log(responsefrom);
    // console.log(responseto);
    let from;
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
    const route = await GetDirectionsPublicTransport(from,to);
    map.flyTo([from.lat, from.lng], 14);
    DrawDirectionsOnMapPT(route,directionLayer);
    AddMarkerToLayer(from,directionLayer,MarkerType["FROM"]);
    AddMarkerToLayer(to,directionLayer,MarkerType["TO"]);
    directionLayer.addTo(map);
    const fromloc = await GeoCodeFromLatLng(from.lat, from.lng);
    const toloc = await GeoCodeFromLatLng(to.lat, to.lng);
    DisplayRouteDirectionsPT(route, fromloc, toloc);
}

function DisplayRouteDirectionsPT(route, from, to)
{
    let offcanvasElement = document.getElementById('offcanvasroute');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    const offcanvasheader = offcanvasElement.querySelector('#offcanvasrouteLabel');
    // `${from.GeocodeInfo[0].BLOCK} ${from.GeocodeInfo[0].ROAD} to ${to.GeocodeInfo[0].BLOCK} ${to.GeocodeInfo[0].ROAD} (${ToKMFromM(route.route_summary.total_distance)}) in ${ToHrMinsFromSeconds(route.route_summary.total_time)}`;
    offcanvasheader.innerText = `${from.GeocodeInfo[0].BLOCK} ${from.GeocodeInfo[0].ROAD} to ${to.GeocodeInfo[0].BLOCK} ${to.GeocodeInfo[0].ROAD} via Public Transport`;
    const routebox = document.querySelector("#offcanvasroutebody");
    if(routebox.hasChildNodes())
        routebox.removeChild(routebox.lastElementChild);
    const directionsholder = document.createElement("div");
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
        // console.log(text);
        routeholder.innerHTML = text;
        directionsholder.appendChild(routeholder);
    }
    routebox.appendChild(directionsholder);
}