// File that calls to LTA Datamall API
const LTA_DATAMALL_URL = "http://datamall2.mytransport.sg";
const BUS_STOP_API = "/ltaodataservice/BusStops";
const TAXI_STANDS_API = "/ltaodataservice/TaxiStands";
const BICYCLE_PARKING_API = "/ltaodataservice/BicycleParkingv2";
const CARPARKAPI = "/ltaodataservice/CarParkAvailabilityv2";
const BUS_ARRIVAL_URL = "/ltaodataservice/BusArrivalv2";
const headerdm = { 
  'AccountKey': 'fLf0y6ycSKSzqshZhvw7Gw=='
};

/**
 * Function that calls to Datamall Bus Stops Api to get All Bus stops
 * @param {int} skip skip to get rest of search results 
 * @returns array of bus stops
 */
async function LoadBusData(skip = 0)
{
    try
    {
        const response  = await axios.get(`${CORS_URL}${LTA_DATAMALL_URL}${BUS_STOP_API}`,{
            params: 
            {
                $skip : skip
            },
            headers : headerdm
        });
        return response.data;
    }
    catch(error)
    {
      console.log(error.message)
    }
}

/**
 * Function that calls to Datamall Bicycle Parking API
 * @param {Object} location location to search from
 * @returns array of Bicycle Parkign Locations
 */
async function LoadBicycleParking(location)
{
    try
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
        return response.data.value;
    }
    catch(error)
    {
      console.log(error.message)
    }
} 

/**
 * Function that calls to Datamall Taxi Stands API
 * @returns Array of taxi stands
 */
async function LoadTaxiStands()
{
    try
    {
        const response  = await axios.get(`${CORS_URL}${LTA_DATAMALL_URL}${TAXI_STANDS_API}`,{
            headers : headerdm
        });
        return response.data.value;
    }
    catch(error)
    {
      console.log(error.message)
    }
}

/**
 * Function that calls to Datamall Carpark API
 * @param {int} skip skip to get rest of search results 
 * @returns array of carparks
 */
async function LoadCarParks(skip = 0)
{
    try
    {
        const response  = await axios.get(`${CORS_URL}${LTA_DATAMALL_URL}${CARPARKAPI}`,{
            params: 
            {
                $skip : skip
            },
            headers : headerdm
        });
        return response.data.value;
    }
    catch(error)
    {
      console.log(error.message)
    }
}

/**
 * Function That calls Bus Arrival API to Get Buses and arrival timing from a Bus Stop
 * @param {String} busstopcode Bus stop code to search by
 * @returns Buses and timing for the bus stop
 */
async function LoadGetBusesAtBusstop(busstopcode)
{
    try
    {
        const response  = await axios.get(`${CORS_URL}${LTA_DATAMALL_URL}${BUS_ARRIVAL_URL}`,{
            params: 
            {
                BusStopCode : busstopcode
            },
            headers : headerdm
        });
        return response.data.Services;
    }
    catch(error)
    {
      console.log(error.message)
    }
}

/**
 * Function That calls Bus Arrival API to Get a bus timing at a particular bustops
 * @param {String} busstopcode Bus stop code to search by
 * @param {String} busno Bus number to search by
 * @returns Bus info for a bus stop
 */
async function GetBusTimings(busstopcode,busno)
{
    try
    {
        const response  = await axios.get(`${CORS_URL}${LTA_DATAMALL_URL}${BUS_ARRIVAL_URL}`,{
            params: 
            {
                BusStopCode : busstopcode,
                ServiceNo : busno
            },
            headers : headerdm
        });
        return response.data.Services;
    }
    catch(error)
    {
      console.log(error.message)
    }
}