// File that calls to OneMap API on Custom API
let ACCESS_TOKEN;

/**
 * Function That loads Onemap API Access Token and assigns it for use
 */
async function LoadOneMap()
{
    ACCESS_TOKEN = await getAccessToken();
}

/** funtion that calls OneMap API to get Current Access Token */
async function getAccessToken()
{
    try
    {
        let response = await axios.get(`${API_URL}/OneMap`);
        return response.data.access_token;
    }
    catch(error)
    {
        console.log(error.message)
    }
}

/**
 * Function that calls OneMap Directions API - Used for Driving, Cycling and Walking
 * @param {Object} from Directions start location
 * @param {Object} to Directions end location
 * @param {String} routetype mode of transport
 * @returns routing infomation object
 */
async function GetDirections(from,to,routetype)
{
    try
    {
        let response = await axios.get(`${API_URL}/OneMap/Directions`,{
            params: 
            {
                fromlat : from.lat,
                fromlng : from.lng,
                tolat : to.lat,
                tolng : to.lng,
                routetype : routetype
            }
        });
        return response.data.data;
    }
    catch(error)
    {
      console.log(error.message)
    }
}

/**
 * Function that calls OneMap Directions API - Used for public Transport
 * @param {Object} from Directions start location
 * @param {Object} to Directions end location
 * @returns routing infomation object
 */
async function GetDirectionsPublicTransport(from,to)
{
    try
    {
        let response = await axios.get(`${API_URL}/OneMap/DirectionsPT`, {
            params: 
            {
                fromlat : from.lat,
                fromlng : from.lng,
                tolat : to.lat,
                tolng : to.lng,
            }
        });
        console.log(response.data.data)
        return response.data.data;
    }
    catch(error)
    {
      console.log(error.message)
    }
}

/**
 * Function that calls to OneMap Search API
 * @param {String} keyword keyword to searh by
 * @param {int} pageNo page of result to get
 * @returns array of search results
 */
async function SearchOneMap(keyword, pageNo = 1)
{
    try
    {
        let response = await axios.get(`${API_URL}/OneMap/Search`,{
            params: 
            {
                keyword : keyword,
                pageno : pageNo
            }
        });
        return response.data.data;
    }
    catch(error)
    {
      console.log(error.message)
    }
}

/**
 * Function that calls Reverse Geocode API from OneMap - Getting info from a given latlng
 * @param {double} lat Latitude of a given location
 * @param {double} lng Longitude of a given location
 * @returns information on a location
 */
async function GeoCodeFromLatLng(lat,lng)
{
    try
    {
        let response = await axios.get(`${API_URL}/OneMap/Geocode`,{
            params: 
            {
                lat : lat,
                lng : lng,
            }
        });
        return response.data.data;
    }
    catch(error)
    {
      console.log(error.message)
    }
}