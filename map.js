function LoadMap()
{
    const mapholder = document.querySelector("#singaporeMap");
    mapholder.style.background = ``;
    const mymap = L.map('singaporeMap', {drawControl: true}).setView([1.3526, 103.8352], 13);
    const basemap = L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png', {
    detectRetina: true,
    maxZoom: 19,
    minZoom: 12,
   /** DO NOT REMOVE the OneMap attribution below **/
    attribution: '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'
    });
    basemap.addTo(mymap);
    return mymap;
}

function DrawBusStops(busstops, busstopLayer)
{
    let busIcon = L.icon({
        iconUrl: 'img/bus-stop.png',
    
        iconSize:     [25, 25], // size of the icon
        iconAnchor:   [12.5, 12.5], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    for(let bs of busstops)
    {
        const lat = bs.Latitude;
        const lng = bs.Longitude;
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

            async function getBuses() {
                let busstopdata = [];
                busstopdata = await LoadGetBusesAtBusstop(bs.BusStopCode);
                const busesatbusstop = ProcessBusstopInfo(busstopdata);
                // console.log(busesatbusstop);
                let htmltext = "";
                for (let b of busesatbusstop)
                {
                    htmltext += `<span class="busno">${b}</span>`;
                }
                divElement.querySelector("div").innerHTML = htmltext;
            }

            getBuses();

            divElement.querySelector(".TimingButton").addEventListener("click", async function(){
                let timings = await LoadGetBusesAtBusstop(bs.BusStopCode);
                timings = timings.sort(function(a, b){return a.ServiceNo - b.ServiceNo});
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
                header.className = 'center';
                buslist.appendChild(header);
                for (let t of timings)
                {
                    console.log(t);
                    let time = Math.round((new Date(t.NextBus.EstimatedArrival) - new Date()) /  60000);
                    // console.log(time);
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
                // console.log(timings);
            });

            return divElement;
        });

        marker.addTo(busstopLayer);
    }
}

function getLocation() 
{
    if (navigator.geolocation) 
      return navigator.geolocation.getCurrentPosition(showPosition);
    else 
      return "Geolocation is not supported by this browser.";
}

function showPosition(position)
{
    USER_POSITION = {
      lat : position.coords.latitude,
      lng :  position.coords.longitude
    };
}

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

function DrawBicycleParking(bicycleparkingdata,bicycleLayer)
{
    // console.log(bicycleparkingdata);
    let bicycleIcon = L.icon({
        iconUrl: 'img/bicycle.png',
    
        iconSize:     [25, 25], // size of the icon
        iconAnchor:   [12.5, 12.5], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    for (let b of bicycleparkingdata)
    {
        const lat = b.Latitude;
        const lng = b.Longitude;
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

function DrawTaxiStands(taxistandsdata,taxistandLayer)
{
    // console.log(taxistandsdata);
    let taxiIcon = L.icon({
        iconUrl: 'img/taxi.png',
    
        iconSize:     [25, 25], // size of the icon
        iconAnchor:   [12.5, 12.5], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    for (const ts of taxistandsdata) 
    {
        const lat = ts.Latitude;
        const lng = ts.Longitude;
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

function DrawParkConnectors(parkconnectorsdata)
{
    // console.log(parkconnectorsdata);
    const parkconnectorlayer = L.geoJson(parkconnectorsdata,{
        onEachFeature:function(feature, layer) {
            // console.log(feature);
            if (feature.geometry.type == "LineString") //<center><table><tr><th colspan='2' align='center'><em>Attributes</em></th></tr><tr bgcolor="#E3E3F3"> <th>PARK</th> <td>Bukit Timah PC (btwn King Albert Park - Adam Rd)</td> </tr><tr bgcolor=""> <th>PCN_LOOP</th> <td>Western Adventure Loop</td> </tr><tr bgcolor="#E3E3F3"> <th>MORE_INFO</th> <td>http://www.nparks.gov.sg/pcn</td> </tr><tr bgcolor=""> <th>INC_CRC</th> <td>F9CECE522DECF3F1</td> </tr><tr bgcolor="#E3E3F3"> <th>FMEL_UPD_D</th> <td>20221031160852</td> </tr></table></center>
            {
                let desc = feature.properties.Description;
                const name = desc.substring(desc.indexOf("<td>") + 4,desc.indexOf("</td>"));
                let pcn = desc.substring(desc.indexOf("PCN_LOOP") + 18);
                pcn = pcn.substring(0,pcn.indexOf("</td>"));
                // console.log(name,pcn);
                layer.setStyle({
                    'color': "green",
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
    // for (let pc of parkconnectorsdata)
    // {
    //     // console.log(pc.coordinates);
    //     let cord = getCoordinates(pc.coordinates);
    //     // console.log(cord);
    //     let polyline = L.polyline(cord, {color: 'green', 'weight': 5});
    //     polyline.bindPopup(function(){
    //         const divElement = document.createElement('div');
    //         divElement.innerHTML = `
    //             <h3>${pc.name}</h3>
    //         `;
    //         return divElement;
    //     });
    //     parkconnectorLayer.addLayer(polyline);
    // }

}

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

function DrawParks(parksdata)
{
    // console.log(parksdata);
    
    const parkLayer = L.geoJson(parksdata,{
        pointToLayer: function(feature, latlng) {
            let parkIcon = L.icon({
                iconUrl: 'img/park.png',
            
                iconSize:     [25, 25], // size of the icon
                iconAnchor:   [12.5, 12.5], // point of the icon which will correspond to marker's location
                popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
            });
            // console.log(latlng);
            return L.marker(latlng, {icon: parkIcon});
        },
        onEachFeature:function(feature, layer) {
            // console.log(feature);
            if (feature.type == "Feature")
            {
                let desc = feature.properties.Description;
                let name = desc.substring(desc.indexOf("<td>") + 4,desc.indexOf("</td>"));
                // console.log(name);
                layer.bindPopup(`
                <div>
                    <h4>${name}</h4>
                </div>`);
            }
        }
    });
    return parkLayer;
    // for (const p of parksdata) 
    // {
    //     const lat = p.location.latitude;
    //     const lng = p.location.longitude;
    //     const marker = L.marker([lat, lng], {icon: parkIcon});
    //     marker.bindPopup(function(){
    //         const divElement = document.createElement('div');
    //         divElement.innerHTML = `
    //             <h3>${p.name}</h3>
    //         `;
    //         return divElement;
    //     });
    //     marker.addTo(parkLayer);
    // }
}

function DrawCarparks(carparkdata,carparkLayer)
{
    // console.log(carparkdata);
    let carparkIcon = L.icon({
        iconUrl: 'img/parking.png',
    
        iconSize:     [25, 25], // size of the icon
        iconAnchor:   [12.5, 12.5], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    for (const p of carparkdata) 
    {
        // console.log(p);
        const loc = p.Location.split(" ");
        const lat = loc[0];
        const lng = loc[1];
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

async function PopUpBusTimings(busstopcode,busno)
{
    const result = await GetBusTimings(busstopcode,busno);
    console.log(result.data);
}

function AddResultsToMap(resultlist, resultlayer, map, searchterms)
{
    // console.log(resultlist);
    resultlayer.clearLayers();
    let resultIcon = L.icon({
        iconUrl: 'img/pin.png',
    
        iconSize:     [25, 25], // size of the icon
        iconAnchor:   [12.5, 12.5], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    let offcanvasElement = document.getElementById('offcanvassearch');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    const offcanvasheader = offcanvasElement.querySelector('#offcanvassearchLabel');
    offcanvasheader.innerText = "Search Results for " + searchterms;
    const searchbox = document.querySelector("#offcanvassearchbody");
    if(searchbox.hasChildNodes())
        searchbox.removeChild(searchbox.lastElementChild);
    const searchHolder = document.createElement("div");
    for (const r of resultlist) 
    {
        const lat = r.LATITUDE;
        const lng = r.LONGITUDE;
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

function AddResultsToMapSTB(resultlist, resultlayer, searchtype, map, searchterms)
{
    console.log(resultlist);
    let iconname = GetIcon(searchtype);
    resultlayer.clearLayers();
    let resultIcon = L.icon({
        iconUrl: iconname,
    
        iconSize:     [50, 50], // size of the icon
        iconAnchor:   [25, 25], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });
    let offcanvasElement = document.getElementById('offcanvassearch');
    let offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
    const offcanvasheader = offcanvasElement.querySelector('#offcanvassearchLabel');
    offcanvasheader.innerText = "Search Results for " + searchterms;
    const searchbox = document.querySelector("#offcanvassearchbody");
    if(searchbox.hasChildNodes())
        searchbox.removeChild(searchbox.lastElementChild);
    const searchHolder = document.createElement("div");
    for (const r of resultlist) 
    {
        const lat = r.location.latitude;
        const lng = r.location.longitude;
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

function DrawDirectionsOnMap(route,directionLayer)
{
    // console.log(route);
    directionLayer.clearLayers();
    const r = L.Polyline.fromEncoded(route.route_geometry);
    r.setStyle({
        color:'red'
    })
    r.on('click', onClickRoute);
    
    if(route.phyroute != null)
    {
        const r2 = L.Polyline.fromEncoded(route.phyroute.route_geometry);
        r2.setStyle({
            color:'lightcoral'
        })
        r2.on('click', onClickRouteAlt);
        r2.addTo(directionLayer);
    }
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

function DrawDirectionsOnMapPT(route,directionLayer)
{
    directionLayer.clearLayers();
    for(let i in route.plan.itineraries)
    {
        // console.log(i);
        for(let leg of route.plan.itineraries[i].legs)
        {
            // console.log(leg);
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

