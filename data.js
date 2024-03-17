// file that constain other file processing data and Function to help work with data recieved
const MRT_URL = "https://gist.githubusercontent.com/raphodn/aca68c6e5b704d021fe0b0d8a376f4aa/raw/40d3d455da164bf8046a1fc6e51a5dc1ed2a0fa6/singapore-mrt.min.geojson";
const PARKS_URL = 'data/Parks.geojson';
const PARKS_CONNECTOR_URL = 'data/ParkConnectorLoop.geojson';
let USER_POSITION;

/**
 * Function the read Parks Geojson file returns data
 * @returns parks data
 */
async function LoadParks()
{
    const response = await axios.get(PARKS_URL);
    return response.data;
}

/**
 * Function the read MRT Geojson file returns data
 * @returns MRT Data
 */
async function LoadMRTGEOJSON()
{
    const response = await axios.get(MRT_URL);
    return response.data;
}

/**
 * Function the read Park COnnectors Geojson file returns data
 * @returns Park Connections data
 */
async function LoadParkConnectors()
{
    const response = await axios.get(PARKS_CONNECTOR_URL);
    return response.data;
}

/**
 * Function the Returns the Lot Type From COst Variable
 * @param {String} type Type of Lot indicator
 * @returns type of lot
 */
function GetLotType(type)
{
    return lotType[type];
}

/**
 * Function that get the buses and arrrange then numerically
 * @param {Array} busesinfo Array of buses
 * @returns Sorted bus array
 */
function ProcessBusstopInfo(busesinfo)
{
    let list = [];
    for (let i of busesinfo)
    {
        list.push(i.ServiceNo);
    }
    return list.sort(function(a, b){return a - b});
}

/**
 * Handles the displaying of bus infomation
 * @param {Object} BusInfo 
 * @returns HTML of Bus Info
 */
function RenderBusInfo(BusInfo)
{
    if (!BusInfo.EstimatedArrival)
        return '';
    let time = Math.round((new Date(BusInfo.EstimatedArrival) - new Date()) /  60000);
    let innerHTML = ` <span class='BusInfo' style="background-color: ${HandleBusLoad(BusInfo.Load)}">
        ${HandleTime(time)} - ${HandleBusType(BusInfo.Type)} ${HandleBusFeature(BusInfo.Feature)}
    </span>`;

    return innerHTML;
}

/**
 * Function thta handles the timr for bus arrival
 * @param {int} time time that bus is arriving
 * @returns string of the time or Arr
 */
function HandleTime(time)
{
    if (time <= 1)
        return "Arr"
    return time;
}

/**
 * Function that returns the color to use base on bus load
 * @param {String} load bus load 
 * @returns color to use
 */
function HandleBusLoad(load)
{
    return BusLoad[load];
}

/**
 * Function to Display if Bus is wheelchair accessible
 * @param {String} feature feature string
 * @returns html styling if feature is available
 */
function HandleBusFeature(feature)
{
    if(feature == "WAB")
        return `- <i class="bi bi-person-wheelchair"></i>`;
    return ``;
}

/**
 * Function the Handles the Bus type
 * @param {String} type bus type
 * @returns Text for bus type
 */
function HandleBusType(type)
{
    return BusType[type];
}

/**
 * Function tha convet a given string into sentence case
 * @param {String} string string to convert
 * @returns sentance case string
 */
function ToSentenceCase(string)
{
    let s = string.toLowerCase();
    let words = s.split(' ');
    let res = [];
    for(let w of words)
    {
        let letter = w[0];
        let k = letter.toUpperCase() + w.substring(1);
        res.push(k);
    }
    let sentence = res.join(' ');
    return sentence;
}

/**
 * Function to convert a given distance in m into Km
 * @param {int} dist distance to convert
 * @returns converted distance as a string
 */
function ToKMFromM(dist)
{
    if(dist > 1000)
        return `${Math.round(dist / 1000 * 100.0) / 100.0} Km`;
    return `${Math.round(dist)} m`
}

/**
 * Function to Convert time from seconds into hr and mins
 * @param {int} time timein seconds
 * @returns string of time in hr and mins
 */
function ToHrMinsFromSeconds(time)
{
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    if (hours != 0)
        return `${hours} h ${minutes} mins`;
    return `${minutes} mins`;
}

/**
 * Function to handle the direction test to load corresponding image for it
 * @param {String} desc description of direction to conver to img 
 * @returns img file link
 */
function GetDirectionImage(desc)
{
    const toCheck = desc.toUpperCase();
    for(let t in DirectionType)
    {
        if(toCheck.includes(t))
            return DirectionType[t];
    }
    return DirectionType["BLANK"];
}

/**
 * Function to Get Icon
 * @param {String} str type of icon to get
 * @returns image link for icon
 */
function GetIcon(str)
{
    return MarkerType[str];
}

/**
 * Function convert address object into a string
 * @param {Object} address address to convert
 * @returns string of the address
 */
function ParseAddress(address)
{
    let str = "";
    if(address.block != "")
        str = str.concat(address.block + " ");
    if(address.streetName != "")
        str = str.concat(address.streetName + " ");
    if(address.postalCode != "")
        str = str.concat(address.postalCode + "\n");
    if(address.buildingName != "")
        str = str.concat(address.buildingName + "\n");
    if(address.floorNumber != "")
        str = str.concat('#' + address.floorNumber);
    if(address.unitNumber != "")
        str = str.concat("-" + address.unitNumber + "\n")
    return str;
}

/**
 * Function to Pad no for date and time use
 * @param {int} no no to pad if needed
 * @returns padded number
 */
function PadNo(no)
{
    let padno = no.toString()
    if(padno.length == 1)
    {
        padno = "0".concat(padno);
    }
    return padno;
}

/**
 * Function to get Transport mdoe color
 * @param {String} mode transport mode 
 * @param {string} line subway line
 * @returns 
 */
function getTransportColor(mode, line = "")
{
    if(mode == "SUBWAY")
        return GetSubwayLineColor(line);
    else 
        return PTTransitMode[mode];
}

/**
 * Function get subway line colors
 * @param {String} line subway line  
 * @returns subway line color
 */
function GetSubwayLineColor(line)
{
    return PTTransitMode["SUBWAY"][line];
}