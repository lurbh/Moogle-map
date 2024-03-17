// File that calls to STB API
const STB_URL = "https://api.stb.gov.sg";
const DATASET_API = "/content/common/v2/datasets";
const TIH_SEARCH_API = "/content/common/v2/search";
const MEDIA_DOWNLOAD_API = "/media/download/v2/";
const headertih = { 
  'x-api-key': 'XAmWJadZKDzaZNjoY9B5RzK9pmGhL8sz',
};

/**
 * Function that gets datasets from stb to use for searching
 * @returns list of datasets from STB
 */
async function GetDataset()
{
  const url = `${CORS_URL}${STB_URL}${DATASET_API}`;
    const response = await axios.get(url,{
        headers : headertih
    });
  return response.data.data;
}

/**
 * Function that calls STB searh API
 * @param {String} searchtype Database to search from
 * @param {String} searchterms Terms to search by
 * @param {int} offset offset to get rest of search results
 * @returns 
 */
async function SearchSTB(searchtype,searchterms,offset)
{
  const url = `${CORS_URL}${STB_URL}${TIH_SEARCH_API}`;
  const response = await axios.get(url,{
      params: 
      {
        dataset : searchtype,
        keyword : searchterms,
        limit : 50,
        offset : offset
      },
      headers : headertih
  });
  return response.data;
}

