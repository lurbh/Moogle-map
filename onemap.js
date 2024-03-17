// File that calls to OneMap API
const data = JSON.stringify({
    "email": "bison.chalk814@eagereverest.com",
    "password": "^W^Vx$RfyBy7xM56v3bj"
});
const ONEMAP_URL = "https://www.onemap.gov.sg";
const ROUTING_API = "/api/public/routingsvc/route";
const ACCESS_API = "/api/auth/post/getToken";
const ONEMAP_SEARCH_API= "/api/common/elastic/search";
const REVGEOCODE_API = "/api/public/revgeocode";
let ACCESS_TOKEN; //"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI2ZjUzZWM1MzYxYzQ2MThlMzFjNDM5MmQ4Y2FkNTQwYiIsImlzcyI6Imh0dHA6Ly9pbnRlcm5hbC1hbGItb20tcHJkZXppdC1pdC0xMjIzNjk4OTkyLmFwLXNvdXRoZWFzdC0xLmVsYi5hbWF6b25hd3MuY29tL2FwaS92Mi91c2VyL3Bhc3N3b3JkIiwiaWF0IjoxNzA4MDUwMTAxLCJleHAiOjE3MDgzMDkzMDEsIm5iZiI6MTcwODA1MDEwMSwianRpIjoiRldNd2dwclJPc3JpakZZQiIsInVzZXJfaWQiOjI2MDIsImZvcmV2ZXIiOmZhbHNlfQ.vzXlf_Cc-OQx9QSghfBSgmTyFoS_vNrWXVu6E-vIakw";
let headerom;

/**
 * Function That loads Onemap API Access Token and assigns it for use
 */
async function LoadOneMap()
{
    ACCESS_TOKEN = await getAccessToken();
    headerom = {
        Authorization : `${ACCESS_TOKEN}`
    }
}

/** funtion that calls OneMap API to get Current Access Token */
async function getAccessToken()
{
    let response = await axios.post(`${ONEMAP_URL}${ACCESS_API}`, data, {
        headers: {
            'Content-Type': 'application/json'
          }
    });
    return response.data.access_token;
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
    let response = await axios.get(`${ONEMAP_URL}${ROUTING_API}`,{
        params: 
        {
           start : `${from.lat},${from.lng}`,
           end : `${to.lat},${to.lng}`,
           routeType : routetype
        }, 
        headers: headerom
    });
    return response.data;
}

/**
 * Function that calls OneMap Directions API - Used for public Transport
 * @param {Object} from Directions start location
 * @param {Object} to Directions end location
 * @returns routing infomation object
 */
async function GetDirectionsPublicTransport(from,to)
{
    // get current datetime
    let datetime = new Date();
    let date = `${PadNo(datetime.getMonth() + 1)}-${PadNo(datetime.getDate())}-${datetime.getFullYear()}`;
    let time = `${datetime.getHours()}${datetime.getMinutes()}00`;
    let response = await axios.get(`${ONEMAP_URL}${ROUTING_API}`, {
        params: 
        {
           start : `${from.lat},${from.lng}`,
           end : `${to.lat},${to.lng}`,
           routeType : 'pt',
           date : date,
           time : time,
           mode : "TRANSIT",
           maxWalkDistance : 1000,
           numItineraries : 3
        }, 
        headers: headerom
    });
    return response.data;
}

/**
 * Function that calls to OneMap Search API
 * @param {String} keyword keyword to searh by
 * @param {int} pageNo page of result to get
 * @returns array of search results
 */
async function SearchOneMap(keyword, pageNo = 1)
{
    let response = await axios.get(`${ONEMAP_URL}${ONEMAP_SEARCH_API}`,{
        params: 
        {
           searchVal : keyword,
           returnGeom : "Y",
           getAddrDetails : "Y",
           pageNum : pageNo
        }, 
        headers: headerom
    });
    return response.data;
}

/**
 * Function that calls Reverse Geocode API from OneMap - Getting info from a given latlng
 * @param {double} lat Latitude of a given location
 * @param {double} lng Longitude of a given location
 * @returns information on a location
 */
async function GeoCodeFromLatLng(lat,lng)
{
    const location = `${lat},${lng}`
    let response = await axios.get(`${ONEMAP_URL}${REVGEOCODE_API}`,{
        params: 
        {
            location : location,
            buffer : 100,
            addressType : "All",
            otherFeatures : "Y"
        }, 
        headers: headerom
    });
    return response.data;
}