let basemap;
let darkbasemap;

/**
 * Function to Load Leaflet Map
 * @returns loade Map
 */
function LoadMap()
{
    const mapholder = document.querySelector("#singaporeMap");
    mapholder.style.background = ``;
    const mymap = L.map('singaporeMap', {drawControl: true}).setView([1.3526, 103.8352], 13);
    // Normal map
    basemap = L.tileLayer('	https://www.onemap.gov.sg/maps/tiles/Default_HD/{z}/{x}/{y}.png', {
    detectRetina: true,
    maxZoom: 19,
    minZoom: 12,
   /** DO NOT REMOVE the OneMap attribution below **/
    attribution: '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'
    });
    // dark map
    darkbasemap = L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Night_HD/{z}/{x}/{y}.png', {
    detectRetina: true,
    maxZoom: 19,
    minZoom: 12,
   /** DO NOT REMOVE the OneMap attribution below **/
    attribution: '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'
    });
    basemap.addTo(mymap);
    return mymap;
}

/**
 * Function to switch to different map type
 * @param {String} layer layer to change to
 * @param {Map} map Map Object
 */
function switchBaseLayer(layer, map) {
    if (layer === 'default') {
        basemap.addTo(map);
        darkbasemap.removeFrom(map);
    } else if (layer === 'dark') {
        darkbasemap.addTo(map);
        basemap.removeFrom(map);
    }
}

/**
 * Function to draw busstop markers on a layer
 * @param {Array} busstops array of busstop
 * @param {LeafletLayer} busstopLayer bus stop layer - marker clustering
 */
function DrawBusStops(busstops, busstopLayer)
{
    let busIcon = L.icon({
        iconUrl: 'img/bus-stop.png',
    
        iconSize:     [25, 25], // size of the icon
        iconAnchor:   [12.5, 12.5], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    // loop all busstop
    for(let bs of busstops)
    {
        const lat = bs.Latitude;
        const lng = bs.Longitude;
        // add marker with custom icon and popup
        const marker = L.marker([lat, lng], {icon: busIcon});
        
        marker.bindPopup(function(){
            const divElement = document.createElement('div');
            divElement.classList.add('busstopcard');
            divElement.innerHTML = `
                <h3>${bs.Description} - ${bs.BusStopCode}</h3>
                <h4>${bs.RoadName}</h4>
                <div class="container busesholder">
                </div>
                <br/>
                <div class="py-1"></div>
                <button class="TimingButton">Get Bus Timings</button>
            `;

            // function to get buses and process the data and display it
            async function getBuses() {
                let busstopdata = [];
                busstopdata = await LoadGetBusesAtBusstop(bs.BusStopCode);
                const busesatbusstop = ProcessBusstopInfo(busstopdata);
                let htmltext = "";
                for (let b of busesatbusstop)
                {
                    htmltext += `<span class="busno">${b}</span>`;
                }
                divElement.querySelector("div").innerHTML = htmltext;
            }

            getBuses();

            // function the display the bustiming for a bus stop
            divElement.querySelector(".TimingButton").addEventListener("click", async function(){
                let timings = await LoadGetBusesAtBusstop(bs.BusStopCode);
                timings = timings.sort(function(a, b){return a.ServiceNo - b.ServiceNo});
                // finf and fill data on a popup div
                const buslist = document.querySelector("#bustimings");
                buslist.style.display = "block";
                const tabledata = buslist.querySelector('table');
                const headerdata = buslist.querySelector('h3');
                if (tabledata)
                    tabledata.remove();
                if(headerdata)
                    headerdata.remove()
                const busestableElement = document.createElement('table');
                busestableElement.className = 'center';
                const header = document.createElement("h3");
                header.innerHTML = `${bs.Description} - ${bs.BusStopCode} - ${bs.RoadName}`;
                header.className = 'center px-3';
                buslist.appendChild(header);
                // go through timing and display the buses info
                for (let t of timings)
                {
                    const bustableElement = document.createElement('tr'); 
                    bustableElement.innerHTML = `
                        <td><span class="busno">${t.ServiceNo}</span></td>
                        <td>${RenderBusInfo(t.NextBus)}</td>
                        <td>${RenderBusInfo(t.NextBus2)}</td>
                        <td>${RenderBusInfo(t.NextBus3)}</td>
                    `;
                    busestableElement.appendChild(bustableElement);
                }
                buslist.appendChild(busestableElement);
            });

            return divElement;
        });

        marker.addTo(busstopLayer);
    }
}

/**
 * Function to call geolocation to get current location
 * @returns geolocation
 */
function getLocation() 
{
    if (navigator.geolocation) 
      return navigator.geolocation.getCurrentPosition(showPosition);
    else 
      return "Geolocation is not supported by this browser.";
}

/**
 * Function to set current position
 * @param {Object} position position from geolocation 
 */
function showPosition(position)
{
    USER_POSITION = {
      lat : position.coords.latitude,
      lng :  position.coords.longitude
    };
}

/**
 * Function to Center the Map view
 * @param {Map} map Map Object
 * @param {LeafletLayer} currentlayer Layer to clear and add current location
 */
function centerView(map, currentlayer)
{
    currentlayer.clearLayers();
    let locationIcon = L.icon({
        iconUrl: 'img/location.png',
    
        iconSize:     [25, 25], // size of the icon
        iconAnchor:   [12.5, 12.5], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    map.flyTo([USER_POSITION.lat, USER_POSITION.lng], 18);
    const marker = L.marker([USER_POSITION.lat, USER_POSITION.lng], {icon: locationIcon});
    marker.addTo(currentlayer);
    currentlayer.addTo(map);
}

/**
 * Function to draw bicycle parking markers on a layer
 * @param {Array} bicycleparkingdata array of bicycle parking
 * @param {LeafletLayer} bicycleLayer bicycle parking layer - marker clustering
 */
function DrawBicycleParking(bicycleparkingdata,bicycleLayer)
{
    let bicycleIcon = L.icon({
        iconUrl: 'img/bicycle.png',
    
        iconSize:     [25, 25], // size of the icon
        iconAnchor:   [12.5, 12.5], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    // loop through data
    for (let b of bicycleparkingdata)
    {
        const lat = b.Latitude;
        const lng = b.Longitude;
        // add marker with custom icon and display popup
        const marker = L.marker([lat, lng], {icon: bicycleIcon});
        const shelter = b.ShelterIndicator == 'Y'? "Yes" : "No"; 
        marker.bindPopup(function(){
            const divElement = document.createElement('div');
            divElement.innerHTML = `
                <h3>${ToSentenceCase(b.Description)}</h3>
                <h4>Type: ${b.RackType}</h4>
                <h4>Total Slots: ${b.RackCount}</h4>
                <h4>Shelter: ${shelter}</h4>
            `;
            return divElement;
        });
        marker.addTo(bicycleLayer);
    }
}

/**
 * Function to draw taxi stand markers on a layer
 * @param {Array} taxistandsdata array of taxi stands
 * @param {LeafletLayer} taxistandLayer taxi stands layer - marker clustering
 */
function DrawTaxiStands(taxistandsdata,taxistandLayer)
{
    let taxiIcon = L.icon({
        iconUrl: 'img/taxi.png',
    
        iconSize:     [25, 25], // size of the icon
        iconAnchor:   [12.5, 12.5], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    // Loop through data
    for (const ts of taxistandsdata) 
    {
        const lat = ts.Latitude;
        const lng = ts.Longitude;
        // add custom marker with popup
        const marker = L.marker([lat, lng], {icon: taxiIcon});
        marker.bindPopup(function(){
            const divElement = document.createElement('div');
            divElement.innerHTML = `
                <h3>${ts.Name} - ${ts.TaxiCode}</h3>
                <h4>Barrier Free: ${ts.Bfa}</h4>
                <h4>Ownership: ${ts.Ownership}</h4>
                <h4>Type: ${ts.Type}</h4>
            `;
            return divElement;
        });
        marker.addTo(taxistandLayer);
    }
}

/**
 * Function to Draw Park Connections
 * @param {GeoJSON} parkconnectorsdata GeoJson for park connections
 * @returns Layer for Park connections
 */
function DrawParkConnectors(parkconnectorsdata)
{
    const parkconnectorlayer = L.geoJson(parkconnectorsdata,{
        // the onEachFeatue function is executed on each feature from the geoJson file
        // parameter 1: the feature object (from the geojson file)
        // parameter 2: the Leaflet visual representation (ie, a layer) of that feature
        onEachFeature:function(feature, layer) {
            if (feature.geometry.type == "LineString") 
            {
                // extract data and add data to popup 
                let desc = feature.properties.Description;
                const name = desc.substring(desc.indexOf("<td>") + 4,desc.indexOf("</td>"));
                let pcn = desc.substring(desc.indexOf("PCN_LOOP") + 18);
                pcn = pcn.substring(0,pcn.indexOf("</td>"));
                layer.setStyle({
                    'color': "#2AAA8A",
                    'weight': 5
                });
                layer.bindPopup(`
                <div>
                    <h4>${name}</h4>
                    <h5>${pcn}</h5>
                </div>`);
            }      
        }
    });
    return parkconnectorlayer;
}

/**
 * Function to draw mrt data on a layer
 * @param {GeoJSON} mrtdata geojson for mrt data
 * @returns layer for mrt
 */
function DrawMrtLayer(mrtdata)
{
    const mrtStationLayer = L.geoJson(mrtdata, {
        pointToLayer: function(feature, latlng) {
            let mrtIcon = L.icon({
                iconUrl: 'img/train.png',
            
                iconSize:     [25, 25], // size of the icon
                iconAnchor:   [12.5, 12.5], // point of the icon which will correspond to marker's location
                popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
            });
        return L.marker(latlng, {icon: mrtIcon});
    },
        // the onEachFeatue function is executed on each feature from the geoJson file
        // parameter 1: the feature object (from the geojson file)
        // parameter 2: the Leaflet visual representation (ie, a layer) of that feature
        onEachFeature:function(feature, layer) {
            // if object is a line - Polyline
            if (feature.type == "LineString")
            {
                layer.setStyle({
                    'color': feature.properties.color,
                    'weight': 5
                });
                layer.bindPopup(`
                <div>
                    <h4>${feature.properties.name} - ${feature.properties.code}</h4>
                </div>`);
            }
            // if objet is a feature - marker
            else if (feature.type == "Feature")
            {
                layer.bindPopup(`
                <div>
                    <h4>${feature.properties.lines[0]} - ${feature.properties.name}</h4>
                </div>`);
            }
            
        }
    });
    return mrtStationLayer;
}

/**
 * Function to draw parks from GeoJson file
 * @param {GeoJSON} parksdata Geojson for park data 
 * @returns Layer for parks
 */
function DrawParks(parksdata)
{    
    const parkLayer = L.geoJson(parksdata,{
        pointToLayer: function(feature, latlng) {
            let parkIcon = L.icon({
                iconUrl: 'img/park.png',
            
                iconSize:     [25, 25], // size of the icon
                iconAnchor:   [12.5, 12.5], // point of the icon which will correspond to marker's location
                popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
            });
            return L.marker(latlng, {icon: parkIcon});
        },
        onEachFeature:function(feature, layer) {
            if (feature.type == "Feature")
            {
                let desc = feature.properties.Description;
                let name = desc.substring(desc.indexOf("<td>") + 4,desc.indexOf("</td>"));
                layer.bindPopup(`
                <div>
                    <h4>${name}</h4>
                </div>`);
            }
        }
    });
    return parkLayer;
}

/**
 * Function to draw carparks on a layer
 * @param {Array} carparkdata Array of carpark data 
 * @param {LeafletLayer} carparkLayer car park layer - marker clustering
 */
function DrawCarparks(carparkdata,carparkLayer)
{
    let carparkIcon = L.icon({
        iconUrl: 'img/parking.png',
    
        iconSize:     [25, 25], // size of the icon
        iconAnchor:   [12.5, 12.5], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    // loop though data
    for (const p of carparkdata) 
    {
        // skip if no location
        if(!p.Location)
            continue;
        const loc = p.Location.split(" ");
        const lat = loc[0];
        const lng = loc[1];
        // add marker with custom icon and display popup
        const marker = L.marker([lat, lng], {icon: carparkIcon});
        const lottype = GetLotType(p.LotType)
        marker.bindPopup(function(){
            const divElement = document.createElement('div');
            divElement.innerHTML = `
                <h3>${p.Development}</h3>
                <h4>Carpark ID: ${p.CarParkID} - Lot Type : ${lottype}</h4>
                <h4>Available Lots: ${p.AvailableLots}</h4>
            `;
            return divElement;
        });
        marker.addTo(carparkLayer);
    }
}

/**
 * Function to add search results on map
 * @param {Array} resultlist array of search results
 * @param {LeafletLayer} resultlayer Layer for results
 * @param {Map} map Map Object
 * @param {String} searchterms search terms
 */
function AddResultsToMap(resultlist, resultlayer, map, searchterms)
{
    resultlayer.clearLayers();
    let resultIcon = L.icon({
        iconUrl: 'img/pin.png',
    
        iconSize:     [25, 25], // size of the icon
        iconAnchor:   [12.5, 12.5], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    // get offcanvas and display it
    let offcanvasElement = document.getElementById('offcanvassearch');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    // set header and remove all data of any
    const offcanvasheader = offcanvasElement.querySelector('#offcanvassearchLabel');
    offcanvasheader.innerText = "Search Results for " + searchterms;
    const searchbox = document.querySelector("#offcanvassearchbody");
    if(searchbox.hasChildNodes())
        searchbox.removeChild(searchbox.lastElementChild);
    const searchHolder = document.createElement("div");
    // loop through data
    for (const r of resultlist) 
    {
        const lat = r.LATITUDE;
        const lng = r.LONGITUDE;
        // add marker with custom icon and display popup
        const marker = L.marker([lat, lng], {icon: resultIcon});
        marker.bindPopup(function(){
            const divElement = document.createElement('div');
            divElement.innerHTML = `
                <h3>${ToSentenceCase(r.SEARCHVAL)}</h3>
                <h4>Address: ${ToSentenceCase(r.ADDRESS)}</h4>
                <br/>
                <div class="py-1"></div>
                <button class="directionButton">Get Directions</button>
            `;
            // event handler for get directions button in pop up
            divElement.querySelector(".directionButton").addEventListener("click", async function(){
                getLocation();
                offcanvas.hide();
                const fromvalue = document.querySelector("#startText");
                const tovalue = document.querySelector("#endText");
                fromvalue.value = "My Location";
                tovalue.value = r.POSTAL;
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

            return divElement;
        });
        marker.addTo(resultlayer);

        // create listing node for off canvas
        const node = document.createElement("div");
        node.classList.add('searchlist')
        node.innerHTML = r.ADDRESS;
        node.addEventListener("click", function () {
            map.flyTo([r.LATITUDE, r.LONGITUDE], 18);
            marker.openPopup();
        });
        searchHolder.appendChild(node);
        
    }
    searchbox.appendChild(searchHolder);
}

/**
 * Function to add search results on map
 * @param {Array} resultlist array of search results
 * @param {LeafletLayer} resultlayer Layer for results
 * @param {String} searchtype search type
 * @param {Map} map Map Object
 * @param {String} searchterms search terms
 */
function AddResultsToMapSTB(resultlist, resultlayer, searchtype, map, searchterms)
{
    let iconname = GetIcon(searchtype);
    resultlayer.clearLayers();
    let resultIcon = L.icon({
        iconUrl: iconname,
    
        iconSize:     [50, 50], // size of the icon
        iconAnchor:   [25, 25], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    // get offcanvas and display it
    let offcanvasElement = document.getElementById('offcanvassearch');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    // set header and remove all data of any
    const offcanvasheader = offcanvasElement.querySelector('#offcanvassearchLabel');
    offcanvasheader.innerText = "Search Results for " + searchterms;
    const searchbox = document.querySelector("#offcanvassearchbody");
    if(searchbox.hasChildNodes())
        searchbox.removeChild(searchbox.lastElementChild);
    const searchHolder = document.createElement("div");
    // loop through data
    for (const r of resultlist) 
    {
        const lat = r.location.latitude;
        const lng = r.location.longitude;
        // add marker with custom icon and display popup
        const marker = L.marker([lat, lng], {icon: resultIcon});
        marker.bindPopup(function(){
            const divElement = document.createElement('div');
            divElement.innerHTML = `
                <h3>${(r.name)}</h3>
                <h4>Address: ${ParseAddress(r.address)}</h4>
                <h5>${r.description}</h5>
                <br/>
                <div class="py-1"></div>
                <button class="directionButton">Get Directions</button>
            `;
            // event handler for get directions button in pop up
            divElement.querySelector(".directionButton").addEventListener("click", async function(){
                getLocation();
                offcanvas.hide();
                const fromvalue = document.querySelector("#startText");
                const tovalue = document.querySelector("#endText");
                fromvalue.value = "My Location";
                tovalue.value = r.address.postalCode;
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

            return divElement;
        });
        marker.addTo(resultlayer);

        // create listing node for off canvas
        const node = document.createElement("div");
        node.classList.add('searchlist')
        node.innerHTML = r.name + " - " + ParseAddress(r.address);
        node.addEventListener("click", function () {
            map.flyTo([lat, lng], 18);
            marker.openPopup();
        });
        searchHolder.appendChild(node);
    }
    searchbox.appendChild(searchHolder);
}

/**
 * Function to draw route directions on map
 * @param {Object} route routes from onemap routing
 * @param {LeafletLayer} directionLayer layer to add directions on
 */
function DrawDirectionsOnMap(route,directionLayer)
{
    directionLayer.clearLayers();
    // draw main route
    const r = L.Polyline.fromEncoded(route.route_geometry);
    r.setStyle({
        color:'red'
    })
    r.on('click', onClickRoute);
    // draw secondary route if any
    if(route.phyroute != null)
    {
        const r2 = L.Polyline.fromEncoded(route.phyroute.route_geometry);
        r2.setStyle({
            color:'lightcoral'
        })
        r2.on('click', onClickRouteAlt);
        r2.addTo(directionLayer);
    }
    // draw thrid route if any
    if(route.alternativeroute != null)
    {
        const r3 = L.Polyline.fromEncoded(route.alternativeroute[0].route_geometry);
        r3.setStyle({
            color:'lightpink'
        })
        r3.on('click', onClickRouteAlt2);
        r3.addTo(directionLayer);
    }
    r.addTo(directionLayer);
}

/**
 * Function to add marker to map
 * @param {Object} location Location to add marker
 * @param {LeafletLayer} layer layer to add marker to
 * @param {String} markertype marker type to use
 */
function AddMarkerToLayer(location,layer,markertype)
{
    let newIcon = L.icon({
        iconUrl: markertype,
    
        iconSize:     [25, 25], // size of the icon
        iconAnchor:   [12.5, 12.5], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    const lat = location.lat;
    const lng = location.lng;
    const marker = L.marker([lat, lng], {icon: newIcon});
    marker.addTo(layer);
}

/**
 * Function to draw directions for pubic transport
 * @param {Object} route routes from onemap routing
 * @param {LeafletLayer} directionLayer layer to add directions 
 */
function DrawDirectionsOnMapPT(route,directionLayer)
{
    directionLayer.clearLayers();
    // for each transport plan
    for(let i in route.plan.itineraries)
    {
        // for each leg in the plan
        for(let leg of route.plan.itineraries[i].legs)
        {
            // draw line 
            const r = L.Polyline.fromEncoded(leg.legGeometry.points);
            const rid = (leg.mode == "SUBWAY") ? leg.routeId : leg.mode;
            if(i != 0)
            {
                r.setStyle({
                    color: getTransportColor(leg.mode,rid),
                    opacity: 0.5,
                    weight:4
                })
                if(rid == "BUS")
                    r.setStyle({
                        color: getTransportColor(leg.mode,rid),
                        dashArray: '10, 10',
                        dashOffset: '5',
                        opacity: 0.5,
                        weight:4
                    })
            }
            else
            {
                r.setStyle({
                    color: getTransportColor(leg.mode,rid),
                    weight:6
                })
                if(rid == "BUS")
                    r.setStyle({
                        color: getTransportColor(leg.mode,rid),
                        dashArray: '10, 10',
                        dashOffset: '5',
                        weight:6
                    })
            }
            r.bindPopup((function(){
                const divElement = document.createElement('div');
                divElement.innerHTML = `
                    <h4>From: ${ToSentenceCase(leg.from.name)} - To: ${ToSentenceCase(leg.to.name)}</h4>
                    <h4>${leg.mode} - ${leg.routeId ? leg.routeId : "Walk"}</h4>
                `;
                return divElement;
            }));
            r.addTo(directionLayer);
        }
    }
}

