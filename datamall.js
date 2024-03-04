const LTA_DATAMALL_URL = "http://datamall2.mytransport.sg";
const BUS_STOP_API = "/ltaodataservice/BusStops";
const TAXI_STANDS_API = "/ltaodataservice/TaxiStands";
const BICYCLE_PARKING_API = "/ltaodataservice/BicycleParkingv2";
const CARPARKAPI = "/ltaodataservice/CarParkAvailabilityv2";
const BUS_ARRIVAL_URL = "/ltaodataservice/BusArrivalv2";
const headerdm = { 
  'AccountKey': 'fLf0y6ycSKSzqshZhvw7Gw=='
};


async function LoadBusData(skip = 0)
{
    const response  = await axios.get(`${CORS_URL}${LTA_DATAMALL_URL}${BUS_STOP_API}`,{
        params: 
        {
            $skip : skip
        },
        headers : headerdm
    });
    // console.log(response.data);
    return response.data;
}

async function LoadBicycleParking(location)
{
    const response  = await axios.get(`${CORS_URL}${LTA_DATAMALL_URL}${BICYCLE_PARKING_API}`,{
        params: 
        {
            Lat : location.Lat,
            Long: location.Lng,
            Dist: 5

        },
        headers : headerdm
    });
    // console.log(response.data.value);
    return response.data.value;
} 

async function LoadTaxiStands()
{
    const response  = await axios.get(`${CORS_URL}${LTA_DATAMALL_URL}${TAXI_STANDS_API}`,{
        headers : headerdm
    });
    // console.log(response.data.value);
    return response.data.value;
}

async function LoadCarParks(skip = 0)
{
    const response  = await axios.get(`${CORS_URL}${LTA_DATAMALL_URL}${CARPARKAPI}`,{
        params: 
        {
            $skip : skip
        },
        headers : headerdm
    });
    // console.log(response.data.value);
    return response.data.value;
}

async function LoadGetBusesAtBusstop(busstopcode)
{
    const response  = await axios.get(`${CORS_URL}${LTA_DATAMALL_URL}${BUS_ARRIVAL_URL}`,{
        params: 
        {
            BusStopCode : busstopcode
        },
        headers : headerdm
    });
    // console.log(response.data.Services);
    return response.data.Services;
}

async function GetBusTimings(busstopcode,busno)
{
    const response  = await axios.get(`${CORS_URL}${LTA_DATAMALL_URL}${BUS_ARRIVAL_URL}`,{
        params: 
        {
            BusStopCode : busstopcode,
            ServiceNo : busno
        },
        headers : headerdm
    });
    // console.log(response.data.Services);
    return response.data.Services;
}