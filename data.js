const MRT_URL = "https://gist.githubusercontent.com/raphodn/aca68c6e5b704d021fe0b0d8a376f4aa/raw/40d3d455da164bf8046a1fc6e51a5dc1ed2a0fa6/singapore-mrt.min.geojson";
const PARKS_URL = 'data/Parks.geojson';
const PARKS_CONNECTOR_URL = 'data/ParkConnectorLoop.geojson';
let USER_POSITION;



async function LoadParks()
{
    const response = await axios.get(PARKS_URL);
    // console.log(response.data);
    return response.data;
}

async function LoadMRTGEOJSON()
{
    const response = await axios.get(MRT_URL);
    // console.log(response.data);
    return response.data;
}

async function LoadParkConnectors()
{
    const response = await axios.get(PARKS_CONNECTOR_URL);
    // console.log(response.data);
    return response.data;
}

function getCoordinates(str) {
    let newstr = str.replaceAll("[","");
    newstr = newstr.replaceAll("]","");
    // console.log(newstr);
    const arr = newstr.split(', ');
    const finalArr = [];

    for (var i = 0, n = arr.length; i < n; i+=2) {
        finalArr.push({
            "lng": parseFloat(arr[i]),
            "lat": parseFloat(arr[i+1])
        });
    }

    return finalArr;
}

function GetLotType(type)
{
    return lotType[type];
}

function ProcessBusstopInfo(busesinfo)
{
    // console.log(busesinfo);
    let list = [];
    for (let i of busesinfo)
    {
        list.push(i.ServiceNo);
    }
    return list.sort(function(a, b){return a - b});
}

function RenderBusInfo(BusInfo)
{
    console.log(BusInfo);
    if (!BusInfo.EstimatedArrival)
        return '';
    let time = Math.round((new Date(BusInfo.EstimatedArrival) - new Date()) /  60000);
    let innerHTML = ` <span class='BusInfo' style="background-color: ${HandleBusLoad(BusInfo.Load)}">
        ${HandleTime(time)} - ${HandleBusType(BusInfo.Type)} ${HandleBusFeature(BusInfo.Feature)}
    </span>`;

    return innerHTML;
}

function HandleTime(time)
{
    if (time <= 1)
        return "Arr"
    return time;
}


function HandleBusLoad(load)
{
    return BusLoad[load];
}

function HandleBusFeature(feature)
{
    if(feature == "WAB")
        return `- <i class="bi bi-person-wheelchair"></i>`;
    return ``;
}

function HandleBusType(type)
{
    return BusType[type];
}

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

function ToKMFromM(dist)
{
    if(dist > 1000)
        return `${Math.round(dist / 1000 * 100.0) / 100.0} Km`;
    return `${Math.round(dist)} m`
}

function ToHrMinsFromSeconds(time)
{
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    if (hours != 0)
        return `${hours} h ${minutes} mins`;
    return `${minutes} mins`;
}

function GetDirectionImage(desc)
{
    const toCheck = desc.toUpperCase();
    // console.log(toCheck);
    for(let t in DirectionType)
    {
        if(toCheck.includes(t))
            return DirectionType[t];
    }
    return DirectionType["BLANK"];
}

function GetIcon(str)
{
    return MarkerType[str];
}

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
    // console.log(str);
    return str;
}

function PadNo(no)
{
    let padno = no.toString()
    if(padno.length == 1)
    {
        padno = "0".concat(padno);
    }
    return padno;
}

function getTransportColor(mode, line = "")
{
    if(mode == "SUBWAY")
        return GetSubwayLineColor(line);
    else 
        return PTTransitMode[mode];
}

function GetSubwayLineColor(line)
{
    return PTTransitMode["SUBWAY"][line];
}